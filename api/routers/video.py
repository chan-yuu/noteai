import asyncio
import os
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile
from loguru import logger
from pydantic import BaseModel

from open_notebook.database.repository import repo_create, repo_query, repo_update

router = APIRouter()

# Constants
WAN_ROOT = Path("Wan2.2")
MEDIA_ROOT = Path("media")
MEDIA_ROOT = Path("media")
MEDIA_ROOT.mkdir(exist_ok=True)

# Model Configuration with Env Var Overrides and Default Local Paths
WAN_MODELS = {
    "t2v-A14B": os.getenv("WAN_CKPT_T2V_A14B", str(WAN_ROOT / "Wan2.1-T2V-14B")),
    "i2v-A14B": os.getenv("WAN_CKPT_I2V_A14B", str(WAN_ROOT / "Wan2.1-I2V-14B")),
    "ti2v-5B": os.getenv("WAN_CKPT_TI2V_5B", str(WAN_ROOT / "Wan2.1-TI2V-5B")),
}

class VideoJob(BaseModel):
    id: str
    type: str  # t2v-A14B or i2v-A14B
    prompt: str
    status: str  # pending, processing, completed, failed
    created_at: str
    output_url: Optional[str] = None
    error: Optional[str] = None
    image_path: Optional[str] = None

class GenerateRequest(BaseModel):
    prompt: str
    type: str = "t2v-A14B"

async def run_wan_generation(job_id: str, command: str, output_path: Path):
    """
    Background task to run the Wan2.2 generation script.
    """
    logger.info(f"Starting video generation for job {job_id}")
    
    try:
        # Update status to processing
        await repo_update("video_job", job_id, {"status": "processing"})
        
        # Execute the command
        logger.info(f"Executing command: {command}")
        process = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode == 0:
            logger.info(f"Job {job_id} completed successfully")
            # Verify output file exists
            if output_path.exists():
                # Provide web-accessible URL (assuming mounted at /media)
                web_path = f"/media/{output_path.name}"
                await repo_update("video_job", job_id, {
                    "status": "completed",
                    "output_url": web_path,
                    "completed_at": datetime.now().isoformat()
                })
            else:
                logger.error(f"Job {job_id} output file not found at {output_path}")
                await repo_update("video_job", job_id, {
                    "status": "failed", 
                    "error": "Output file generation failed"
                })
        else:
            error_msg = stderr.decode()
            logger.error(f"Job {job_id} failed with error: {error_msg}")
            await repo_update("video_job", job_id, {
                "status": "failed",
                "error": f"Generation process failed: {error_msg[:500]}"
            })
            
    except Exception as e:
        logger.exception(f"Exception in background task for job {job_id}")
        await repo_update("video_job", job_id, {
            "status": "failed",
            "error": str(e)
        })

from api.utils import get_context_content

@router.post("/video/generate")
async def generate_video(
    background_tasks: BackgroundTasks,
    prompt: str = Form(...),
    type: str = Form("t2v-A14B"),
    context_ids: Optional[str] = Form(None), # JSON string of list[str]
    image: Optional[UploadFile] = File(None)
):
    """
    Start a video generation job.
    """
    job_id = str(uuid.uuid4())
    created_at = datetime.now().isoformat()
    
    # Parse context_ids
    parsed_context_ids = []
    if context_ids:
        try:
            parsed_context_ids = json.loads(context_ids)
        except json.JSONDecodeError:
            logger.warning(f"Invalid context_ids JSON: {context_ids}")

    # Fetch context content if any
    context_text = ""
    if parsed_context_ids:
        try:
            context_text = await get_context_content(parsed_context_ids)
        except Exception as e:
            logger.error(f"Failed to fetch context: {e}")

    # Validate type
    if type not in WAN_MODELS:
        raise HTTPException(status_code=400, detail=f"Invalid generation type. Must be one of {list(WAN_MODELS.keys())}")

    # Determine paths
    ckpt_dir = WAN_MODELS[type]
    output_filename = f"{job_id}.mp4"
    output_path = MEDIA_ROOT / output_filename
    
    input_image_path = None
    
    # Handle image upload for i2v
    if type == "i2v-A14B":
        if not image:
            raise HTTPException(status_code=400, detail="Image is required for i2v-A14B task")
        
        # Save uploaded image
        input_image_filename = f"{job_id}_input{Path(image.filename).suffix}"
        input_image_path = MEDIA_ROOT / input_image_filename
        with open(input_image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
    
    # Enrich prompt with context if available
    final_prompt = prompt
    if context_text:
        # We assume the model handles natural language well.
        # Truncate context if too long to avoid exceeding cli/prompt limits (rough safeguard)
        safe_context = context_text[:2000] 
        final_prompt = f"Context: {safe_context}\n\nTask: {prompt}"
        
        # Escape single quotes for CLI
        final_prompt = final_prompt.replace("'", "'\\''")

    # Construct command
    # Using 'uv run' to ensure environment consistency
    cmd_parts = [
        "uv", "run", "python", str(WAN_ROOT / "generate.py"),
        "--task", type,
        "--ckpt_dir", str(ckpt_dir),
        "--prompt", f"'{final_prompt}'",
        "--save_file", str(output_path),
        "--offload_model", "True" # Force offload to save VRAM
    ]
    
    if type == "i2v-A14B" and input_image_path:
        cmd_parts.extend(["--image", str(input_image_path)])
        
    command = " ".join(cmd_parts)
    
    # Store initial job state
    job_data = {
        "id": job_id,
        "type": type,
        "prompt": prompt, # Store original prompt or final? Original is better for UI display.
        "status": "pending",
        "created_at": created_at,
        "image_path": str(input_image_path) if input_image_path else None,
        "context_ids": parsed_context_ids
    }
    
    await repo_create("video_job", job_data)
    
    # Trigger background task
    background_tasks.add_task(run_wan_generation, job_id, command, output_path)
    
    return {"job_id": job_id, "status": "pending"}

@router.get("/video/jobs")
async def list_jobs():
    """
    List recent video generation jobs.
    """
    # Simple listing, could add pagination later
    jobs = await repo_query("SELECT * FROM video_job ORDER BY created DESC")
    return jobs

@router.get("/video/jobs/{job_id}")
async def get_job(job_id: str):
    """
    Get status of a specific job.
    """
    # Ensure job_id is formatted correctly for query if needed, 
    # but strictly speaking we passed UUIDs. table:uuid is standard in surreal.
    # repo_query handles the string building usually but let's be explicit or safe.
    # actually repo_update does `table:id`. Let's try matching that format.
    
    # Check if job_id already has table prefix
    if not job_id.startswith("video_job:"):
        query_id = f"video_job:{job_id}"
    else:
        query_id = job_id
        
    result = await repo_query(f"SELECT * FROM {query_id}")
    
    if not result:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return result[0]

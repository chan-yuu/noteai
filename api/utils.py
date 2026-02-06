from typing import List
from open_notebook.database.repository import repo_query
from loguru import logger

async def get_context_content(context_ids: List[str]) -> str:
    """
    Aggregates text content from a list of context IDs (notebooks or sources).
    
    Args:
        context_ids: List of strings in format "notebook:{id}" or "source:{id}"
        
    Returns:
        Combined text content
    """
    context_text = []
    
    # Deduplicate IDs to avoid fetching same content twice
    unique_ids = set(context_ids)
    
    for cid in unique_ids:
        try:
            if cid.startswith("notebook:"):
                # Format: notebook:uuid
                notebook_part = cid.split(":", 1)[1]
                # Prepare ID for DB query (handle if it needs table prefix or not)
                # In repository.py, type::thing('table', 'id') is robust
                
                # 1. Fetch Notes
                # Assuming 'note' table has 'notebook' field acting as foreign key
                notes_query = f"SELECT * FROM note WHERE notebook = type::thing('notebook', '{notebook_part}')"
                notes = await repo_query(notes_query)
                
                if notes:
                    context_text.append(f"--- Notebook Content ({cid}) ---")
                    for note in notes:
                        content = note.get("content", "").strip()
                        if content:
                            context_text.append(f"Note: {note.get('title', 'Untitled')}\n{content}")
                
                # 2. Fetch Sources associated with Notebook
                # Assuming 'source' table has 'notebooks' array field
                # OR 'notebook_source' link table.
                # sources_service uses api_client, so difficult to know exact schema from there.
                # But 'notebooks' param in create_source suggests 'notebooks' array in 'source' table.
                sources_query = f"SELECT * FROM source WHERE notebooks CONTAINS type::thing('notebook', '{notebook_part}')"
                sources = await repo_query(sources_query)
                
                if sources:
                    context_text.append(f"--- Sources in Notebook ({cid}) ---")
                    for source in sources:
                        # try 'full_text' or 'content'
                        content = source.get("full_text") or source.get("content") or ""
                        content = content.strip()
                        if content:
                            context_text.append(f"Source: {source.get('title', 'Untitled')}\n{content}")

            elif cid.startswith("source:"):
                # Format: source:uuid
                source_part = cid.split(":", 1)[1]
                source_query = f"SELECT * FROM source WHERE id = type::thing('source', '{source_part}')"
                sources = await repo_query(source_query)
                
                if sources:
                    source = sources[0]
                    content = source.get("full_text") or source.get("content") or ""
                    content = content.strip()
                    if content:
                        context_text.append(f"--- Specific Source ({cid}) ---\nSource: {source.get('title', 'Untitled')}\n{content}")
                        
        except Exception as e:
            logger.error(f"Error fetching context for {cid}: {e}")
            continue

    return "\n\n".join(context_text)

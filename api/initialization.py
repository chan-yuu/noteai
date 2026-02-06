import asyncio
from loguru import logger
from open_notebook.database.repository import repo_update, repo_query

# 1. Dynamic Global Prompt
NEW_GLOBAL_PROMPT = """
[Important]
Please execute all transformations in the SAME LANGUAGE as the input text, unless the text is explicitly in another language and the task requires preserving it.
"""

# 2. Preset Prompts (Chinese prioritized)
NEW_PRESETS = [
    {"name": "摘要 (Summarize)", "prompt": "请简要总结以下内容。"},
    {"name": "解释 (Explain)", "prompt": "请用通俗易懂的语言解释以下内容。"},
    {"name": "深度思考 (Deep Dive)", "prompt": "请对以下内容进行深度分析和思考。"},
    {"name": "分析论文 (Analyze Paper)", "prompt": "请分析这篇论文的主要贡献、方法和结论。"},
    {"name": "提取行动项 (Action Items)", "prompt": "请从文本中提取关键的行动项。"},
    {"name": "润色 (Polish)", "prompt": "请润色以下文字，使其更加流畅专业。"},
    {"name": "翻译成英文 (To English)", "prompt": "请将以下内容翻译成英文。"},
    {"name": "Fix Grammar", "prompt": "Please fix any grammar and spelling errors."},
    {"name": "Keywords", "prompt": "Extract the main keywords."}
]

async def initialize_prompts():
    """
    Initialize or update default prompts in the database.
    This runs on every startup to ensure configuration is up to date.
    """
    logger.info("Initializing default prompts...")
    
    try:
        # Update/Create Chinese default prompt record 
        await repo_update("prompt_template", "open_notebook:default_prompts_zh", {
            "global_prompt": NEW_GLOBAL_PROMPT,
            "preset_prompts": NEW_PRESETS
        })
        
        # Update/Create the main default record as well
        await repo_update("prompt_template", "open_notebook:default_prompts", {
            "global_prompt": NEW_GLOBAL_PROMPT,
            "preset_prompts": NEW_PRESETS
        })
        
        logger.info("Default prompts initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize prompts: {e}")

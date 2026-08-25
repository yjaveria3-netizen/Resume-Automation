import uuid
from pathlib import Path
from typing import Tuple
import aiofiles
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB limit in bytes


async def save_resume_file(user_id: str, upload_file: UploadFile) -> Tuple[str, str]:
    """Validates .docx format & size (<5MB), generates unique filename, and saves file to storage directory."""
    original_filename = upload_file.filename or "resume.docx"
    filename_lower = original_filename.lower()

    # 1. Validate file extension (.docx only)
    if not filename_lower.endswith(".docx"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only Microsoft Word (.docx) documents are allowed.",
        )

    # 2. Read file content and validate file size (< 5MB)
    file_content = await upload_file.read()
    file_size = len(file_content)

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size ({round(file_size / (1024 * 1024), 2)}MB) exceeds maximum allowed limit of 5MB.",
        )

    # 3. Ensure target storage directory exists
    target_dir = Path(settings.STORAGE_DIR)
    target_dir.mkdir(parents=True, exist_ok=True)

    # 4. Generate collision-free sanitized unique filename (prevents path traversal)
    unique_filename = f"{user_id}_{uuid.uuid4().hex}.docx"
    target_filepath = target_dir / unique_filename

    # 5. Write file asynchronously to disk
    async with aiofiles.open(target_filepath, "wb") as out_file:
        await out_file.write(file_content)

    return (str(target_filepath.resolve()), original_filename)

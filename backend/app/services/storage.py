import os
import uuid
import tempfile
import zipfile
from pathlib import Path
from typing import Tuple
import docx
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB limit in bytes
CHUNK_SIZE = 64 * 1024  # 64KB chunk size for streaming


async def save_resume_file(user_id: str, upload_file: UploadFile) -> Tuple[str, str]:
    """Validates real .docx format (ZIP magic bytes, word/document.xml, python-docx),
    enforces 5MB stream cap, performs atomic file write, and never overwrites user original files.
    """
    original_filename = upload_file.filename or "resume.docx"
    filename_lower = original_filename.lower()

    # 1. Reject non-docx extensions
    if not filename_lower.endswith(".docx"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only Microsoft Word (.docx) documents are allowed.",
        )

    # 2. Ensure target storage directory exists
    target_dir = Path(settings.STORAGE_DIR)
    target_dir.mkdir(parents=True, exist_ok=True)

    # 3. Stream-read with 5MB cap into a temp file for atomic writing
    total_bytes = 0
    temp_file = tempfile.NamedTemporaryFile(dir=target_dir, delete=False, suffix=".tmp")
    temp_path = Path(temp_file.name)

    try:
        while True:
            chunk = await upload_file.read(CHUNK_SIZE)
            if not chunk:
                break
            total_bytes += len(chunk)
            if total_bytes > MAX_FILE_SIZE:
                temp_file.close()
                if temp_path.exists():
                    temp_path.unlink()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File exceeds maximum allowed limit of 5MB.",
                )
            temp_file.write(chunk)

        temp_file.flush()
        os.fsync(temp_file.fileno())
        temp_file.close()

        # Reject empty file
        if total_bytes == 0:
            if temp_path.exists():
                temp_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )

        # 4. Content validation: Verify ZIP magic bytes
        with open(temp_path, "rb") as f:
            magic_bytes = f.read(4)
        if not magic_bytes.startswith(b"PK"):
            if temp_path.exists():
                temp_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file content: file is not a valid docx archive (missing ZIP magic bytes).",
            )

        # 5. Content validation: Verify archive contains word/document.xml
        try:
            with zipfile.ZipFile(temp_path, "r") as zf:
                namelist = zf.namelist()
                if "word/document.xml" not in namelist:
                    if temp_path.exists():
                        temp_path.unlink()
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid file content: archive does not contain word/document.xml.",
                    )
        except zipfile.BadZipFile as exc:
            if temp_path.exists():
                temp_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file content: corrupt zip archive ({exc}).",
            )

        # 6. Content validation: Verify opens with python-docx
        try:
            docx.Document(str(temp_path))
        except Exception as exc:
            if temp_path.exists():
                temp_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file content: unable to parse document with docx ({exc}).",
            )

        # 7. Atomic move to unique collision-free filename (never overwrite existing)
        unique_filename = f"{user_id}_{uuid.uuid4().hex}.docx"
        target_filepath = target_dir / unique_filename

        os.replace(temp_path, target_filepath)
        return (str(target_filepath.resolve()), original_filename)

    except HTTPException:
        if temp_path.exists():
            try:
                temp_path.unlink()
            except Exception:
                pass
        raise
    except Exception as exc:
        if temp_path.exists():
            try:
                temp_path.unlink()
            except Exception:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving file: {exc}",
        ) from exc

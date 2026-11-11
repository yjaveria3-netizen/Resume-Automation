import os
import time
import logging
from pathlib import Path
from app.core.config import settings

logger = logging.getLogger("storage_cleanup")


def cleanup_old_temp_files(storage_dir: Path = None, max_age_hours: int = 24) -> int:
    """Scans storage directory for temporary files (.tmp, .temp, or files in temp/)
    older than max_age_hours and purges them. Never deletes actual resume docx files.
    """
    storage_root = Path(storage_dir) if storage_dir else Path(settings.STORAGE_DIR)
    if not storage_root.exists():
        return 0

    now_time = time.time()
    cutoff_time = now_time - (max_age_hours * 3600)
    deleted_count = 0

    # 1. Clean *.tmp, *.temp, *.bak files across storage
    for pattern in ("*.tmp", "*.temp", "*.bak"):
        for filepath in storage_root.rglob(pattern):
            try:
                if filepath.is_file() and filepath.stat().st_mtime < cutoff_time:
                    filepath.unlink()
                    deleted_count += 1
                    logger.info(f"Purged old temp file: {filepath.name}")
            except Exception as e:
                logger.warning(f"Failed to delete temp file {filepath.name}: {e}")

    # 2. Clean files inside storage_root / "temp" directory
    temp_dir = storage_root / "temp"
    if temp_dir.exists():
        for filepath in temp_dir.glob("*"):
            try:
                if filepath.is_file() and filepath.stat().st_mtime < cutoff_time:
                    filepath.unlink()
                    deleted_count += 1
                    logger.info(f"Purged file in temp directory: {filepath.name}")
            except Exception as e:
                logger.warning(f"Failed to delete file in temp/: {e}")

    return deleted_count

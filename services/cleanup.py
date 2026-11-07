import os
import time
import logging
from pathlib import Path
from app.core.config import settings

logger = logging.getLogger("storage_cleanup")


def cleanup_old_temp_files(max_age_hours: int = 24) -> int:
    """Scans storage directory for temporary / orphaned generated files older than max_age_hours and purges them to prevent disk overflow."""
    storage_root = Path(settings.STORAGE_DIR)
    if not storage_root.exists():
        return 0

    now_time = time.time()
    cutoff_time = now_time - (max_age_hours * 3600)
    deleted_count = 0

    target_dirs = [storage_root / "temp", storage_root / "versions", storage_root]

    for target_dir in target_dirs:
        if not target_dir.exists():
            continue

        for filepath in target_dir.glob("*.docx"):
            try:
                # Check modification time
                mtime = filepath.stat().st_mtime
                if mtime < cutoff_time:
                    filepath.unlink()
                    deleted_count += 1
                    logger.info(f"Purged old temporary storage file: {filepath.name}")
            except Exception as e:
                logger.warning(f"Failed to delete file {filepath.name}: {e}")

    return deleted_count

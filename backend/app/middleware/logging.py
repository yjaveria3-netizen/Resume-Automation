import time
import json
import logging
from datetime import datetime, timezone
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("api_access")


class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware that logs every incoming HTTP request as single-line structured JSON with duration_ms and redacted headers."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()

        # Capture client IP
        client_ip = request.client.host if request.client else "unknown"

        # Execute request downstream
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as exc:
            status_code = 500
            duration_ms = round((time.time() - start_time) * 1000, 2)
            log_payload = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "client_ip": client_ip,
                "method": request.method,
                "path": request.url.path,
                "status_code": 500,
                "duration_ms": duration_ms,
                "error": str(exc),
            }
            logger.error(json.dumps(log_payload))
            raise exc

        duration_ms = round((time.time() - start_time) * 1000, 2)

        # Build single-line structured JSON log
        log_payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "client_ip": client_ip,
            "method": request.method,
            "path": request.url.path,
            "status_code": status_code,
            "duration_ms": duration_ms,
        }

        # Log as structured JSON
        logger.info(json.dumps(log_payload))
        return response

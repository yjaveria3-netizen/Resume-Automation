import time
import json
import logging
from datetime import datetime, timezone
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("api_access")


class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware that logs every incoming HTTP request as single-line structured JSON:
    timestamp, method, path, status, duration_ms, user_id.
    Never logs secrets, passwords, or tokens.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"

        # Safe extraction of user_id from Authorization header
        user_id = None
        auth_header = request.headers.get("Authorization", "").strip()
        if auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "").strip()
            try:
                from jose import jwt
                from app.core.config import settings
                payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
                user_id = payload.get("sub")
            except Exception:
                user_id = None

        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as exc:
            status_code = 500
            duration_ms = round((time.time() - start_time) * 1000, 2)
            log_payload = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "method": request.method,
                "path": request.url.path,
                "status": 500,
                "duration_ms": duration_ms,
                "user_id": str(user_id) if user_id else None,
                "client_ip": client_ip,
            }
            logger.error(json.dumps(log_payload))
            raise exc

        duration_ms = round((time.time() - start_time) * 1000, 2)

        log_payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "method": request.method,
            "path": request.url.path,
            "status": status_code,
            "duration_ms": duration_ms,
            "user_id": str(user_id) if user_id else None,
            "client_ip": client_ip,
        }

        logger.info(json.dumps(log_payload))
        return response

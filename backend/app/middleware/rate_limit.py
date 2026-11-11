import time
from collections import defaultdict
from typing import Dict, List
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

# In-memory storage: ip -> endpoint_key -> list of timestamp floats
_rate_limit_store: Dict[str, Dict[str, List[float]]] = defaultdict(lambda: defaultdict(list))


def reset_rate_limit_store() -> None:
    """Helper to clear rate limit store between tests."""
    _rate_limit_store.clear()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Enforces rate limiting: 10 req/min for auth endpoints (/auth/login, /auth/signup),
    30 req/min for all other endpoints. Returns 429 with Retry-After header.
    """

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path.rstrip("/")

        # Determine limit category
        if path in ("/auth/login", "/auth/signup"):
            bucket = "auth"
            max_requests = 10
        else:
            bucket = "default"
            max_requests = 30

        now = time.time()
        window_seconds = 60.0

        timestamps = _rate_limit_store[client_ip][bucket]
        # Prune old timestamps
        _rate_limit_store[client_ip][bucket] = [t for t in timestamps if now - t < window_seconds]
        current_history = _rate_limit_store[client_ip][bucket]

        if len(current_history) >= max_requests:
            oldest_ts = current_history[0]
            retry_after = max(1, int(window_seconds - (now - oldest_ts)))
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Rate limit exceeded."},
                headers={"Retry-After": str(retry_after)},
            )

        current_history.append(now)
        return await call_next(request)

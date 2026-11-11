from fastapi.testclient import TestClient
from app.main import app


def test_health_check_returns_all_required_keys():
    client = TestClient(app)
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()

    # Core required keys
    assert "status" in data
    assert data["status"] in ("healthy", "degraded")
    assert "database" in data
    assert "memory_mb" in data
    assert isinstance(data["memory_mb"], (int, float))
    assert data["memory_mb"] > 0
    assert "uptime_seconds" in data
    assert isinstance(data["uptime_seconds"], int)
    assert data["uptime_seconds"] >= 0
    assert "version" in data
    assert data["version"] == "1.0.0"
    assert "timestamp" in data

    # Storage key (must NOT leak path)
    assert "storage" in data
    storage = data["storage"]
    assert "available" in storage
    assert "free_disk_mb" in storage
    assert "path" not in storage

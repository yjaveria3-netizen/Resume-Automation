#!/usr/bin/env python3
"""
Day 9 — n8n webhook burst load test
Resume Auto-Updater · Person E (Database, Automation & Coordinator)

Plan (10 events in ~5 seconds):
  1. Build 10 unique GitHub push JSON payloads (different commit SHAs).
  2. Sign each body with HMAC-SHA256 (same header GitHub sends: X-Hub-Signature-256).
  3. Fire all 10 POSTs at the same time with asyncio + httpx.
  4. Record HTTP status, latency (ms), and errors.
  5. Print a summary table. Exit 0 only if every request returned HTTP 200.

Usage:
  python scripts/load_test_automation.py
  python scripts/load_test_automation.py --url http://127.0.0.1:5678/webhook/github-push
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import hmac
import json
import os
import statistics
import sys
import time
from datetime import datetime, timezone
from typing import Any

import httpx

DEFAULT_WEBHOOK_URL = os.getenv(
    "N8N_WEBHOOK_URL",
    "http://127.0.0.1:5678/webhook/github-push",
)
DEFAULT_SECRET = os.getenv("GITHUB_WEBHOOK_SECRET", "resume001122--")
DEFAULT_USER_ID = os.getenv("DEFAULT_USER_ID", "fa9690b9-58e0-49a8-8593-8973c72be3b4")


def make_github_push_payload(index: int) -> dict[str, Any]:
    """One fake GitHub push event. Each index is a unique commit."""
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    sha = hashlib.sha1(f"load-test-{index}-{now}".encode("utf-8")).hexdigest()
    return {
        "ref": "refs/heads/main",
        "before": "0" * 40,
        "after": sha,
        "created": False,
        "deleted": False,
        "forced": False,
        "user_id": DEFAULT_USER_ID,
        "repository": {
            "id": 1000 + index,
            "name": "resume-auto-updater",
            "full_name": "SyncBuilds/resume-auto-updater",
            "private": False,
            "owner": {
                "login": "SyncBuilds",
                "name": "SyncBuilds",
            },
        },
        "pusher": {"name": "load-tester", "email": "loadtest@example.com"},
        "head_commit": {
            "id": sha,
            "message": f"load-test burst event {index + 1}/10",
            "timestamp": now,
            "author": {
                "name": "Load Tester",
                "email": "loadtest@example.com",
                "username": "load-tester",
            },
            "added": [f"load-test/{index}.txt"],
            "modified": ["README.md"],
            "removed": [],
        },
        "commits": [
            {
                "id": sha,
                "message": f"load-test burst event {index + 1}/10",
                "timestamp": now,
                "author": {"name": "Load Tester", "username": "load-tester"},
                "added": [f"load-test/{index}.txt"],
                "modified": ["README.md"],
                "removed": [],
            }
        ],
    }


def sign_body(secret: str, body: bytes) -> str:
    digest = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
    return f"sha256={digest}"


async def fire_one(
    client: httpx.AsyncClient,
    url: str,
    secret: str,
    index: int,
) -> dict[str, Any]:
    payload = make_github_push_payload(index)
    body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "GitHub-Hookshot/load-test",
        "X-GitHub-Event": "push",
        "X-GitHub-Delivery": f"load-test-{index}-{int(time.time() * 1000)}",
        "X-Hub-Signature-256": sign_body(secret, body),
    }
    started = time.perf_counter()
    error = ""
    status_code = 0
    try:
        response = await client.post(url, content=body, headers=headers)
        status_code = response.status_code
        error = "" if status_code == 200 else (response.text or "")[:120]
    except Exception as exc:
        error = str(exc)[:160]
    latency_ms = (time.perf_counter() - started) * 1000
    return {
        "index": index + 1,
        "status": status_code,
        "latency_ms": latency_ms,
        "ok": status_code == 200,
        "error": error,
    }


async def run_burst(url: str, secret: str, count: int, timeout: float) -> list[dict[str, Any]]:
    limits = httpx.Limits(max_connections=count, max_keepalive_connections=count)
    async with httpx.AsyncClient(timeout=timeout, limits=limits) as client:
        tasks = [fire_one(client, url, secret, i) for i in range(count)]
        return await asyncio.gather(*tasks)


def print_table(results: list[dict[str, Any]], wall_seconds: float) -> None:
    print("\n" + "=" * 78)
    print("RESUME AUTO-UPDATER · n8n WEBHOOK LOAD TEST (Day 9)")
    print("=" * 78)
    print(f"{'#':<4} {'STATUS':<8} {'LATENCY':<12} {'RESULT':<10} {'NOTES'}")
    print("-" * 78)
    for row in results:
        badge = "OK" if row["ok"] else "FAIL"
        notes = row["error"].replace("\n", " ") if row["error"] else ""
        print(
            f"{row['index']:<4} {row['status']:<8} {row['latency_ms']:>8.1f} ms  {badge:<10} {notes}"
        )
    print("-" * 78)

    latencies = [r["latency_ms"] for r in results]
    success = sum(1 for r in results if r["ok"])
    total = len(results)
    error_rate = (1 - success / total) * 100 if total else 100
    throughput = total / wall_seconds if wall_seconds > 0 else 0

    print(f"Requests:     {total}")
    print(f"Success:      {success}/{total}  ({100 - error_rate:.1f}%)")
    print(f"Error rate:   {error_rate:.1f}%")
    print(f"Min latency:  {min(latencies):.1f} ms")
    print(f"Max latency:  {max(latencies):.1f} ms")
    print(f"Avg latency:  {statistics.mean(latencies):.1f} ms")
    print(f"Wall time:    {wall_seconds:.3f} s  (target burst window: 5 s)")
    print(f"Throughput:   {throughput:.2f} requests/sec")
    print("=" * 78 + "\n")


def main() -> int:
    parser = argparse.ArgumentParser(description="Day 9 concurrent n8n webhook load test")
    parser.add_argument("--url", default=DEFAULT_WEBHOOK_URL, help="Production n8n webhook URL")
    parser.add_argument("--secret", default=DEFAULT_SECRET, help="HMAC webhook secret")
    parser.add_argument("--count", type=int, default=10, help="How many concurrent events")
    parser.add_argument("--timeout", type=float, default=120.0, help="Per-request timeout seconds")
    args = parser.parse_args()

    print(f"Target:  {args.url}")
    print(f"Burst:   {args.count} concurrent GitHub push events")
    print("Firing...")

    wall_start = time.perf_counter()
    results = asyncio.run(run_burst(args.url, args.secret, args.count, args.timeout))
    wall_seconds = time.perf_counter() - wall_start
    print_table(results, wall_seconds)

    if not all(r["ok"] for r in results):
        print("ASSERT FAILED: expected 100% HTTP 200.")
        return 1
    print("ASSERT PASSED: 100% HTTP 200 — no dropped webhooks in this burst.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

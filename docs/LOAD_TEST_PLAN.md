# Day 9 Load-Testing Plan

**Owner:** Person E (Database, Automation & Coordinator)  
**Target:** production n8n webhook `POST /webhook/github-push`  
**Goal:** 10 simulated GitHub `push` events inside about 5 seconds, 100% HTTP 200, no dropped webhooks, no database deadlocks.

## Why this test exists

In real life, several teammates (or CI jobs) can push at the same time. The webhook must accept every event, queue work, and not lose payloads.

## Burst design

| Item | Value |
|---|---|
| Concurrent events | 10 |
| Window | all requests start together (`asyncio.gather`) |
| Payload | unique GitHub-style JSON (unique commit SHA each time) |
| Branch | `refs/heads/main` so the Filter node lets them through |
| Auth header | `X-Hub-Signature-256` HMAC-SHA256 of the raw body |
| Secret | `GITHUB_WEBHOOK_SECRET` or default `resume001122--` |
| Success | every response is HTTP 200 |
| Metrics | min / max / avg latency, throughput (req/s), error rate |

## How to run

1. Make sure n8n is running and the workflow **Resume-Auto-Updater-GitHub-Trigger** is **Active**.
2. (Optional) Start the FastAPI backend on port 8000 so the HTTP Request node can finish.
3. From the project root:

```bash
python scripts/load_test_automation.py
```

4. Read the printed table. All 10 rows should say `OK`.
5. Optional: open n8n **Executions** and confirm 10 runs (or more if retries). Check `automation_logs` if Postgres is connected.

## What “no deadlock” means here

Each successful pipeline path inserts one row into `automation_logs`. Ten parallel inserts on different rows should complete. If the database hangs or n8n executions stay “running” forever, that is a failure even if HTTP 200 arrived early.

## Pass / fail

- **Pass:** 10/10 HTTP 200, script prints `ASSERT PASSED`.
- **Fail:** any non-200, timeout, or connection refused (n8n off, wrong URL, workflow inactive).

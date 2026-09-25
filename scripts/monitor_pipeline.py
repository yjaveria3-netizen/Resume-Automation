#!/usr/bin/env python3
"""
Pipeline Verification and Health Monitor
Resume Auto-Updater — Day 8 Deliverable
Role: Person E (Database, Automation & Coordinator)

Monitors the end-to-end production automation chain:
1. Backend API (/health)
2. Database (PostgreSQL / SQLite fallback: queries latest record timestamp & count in resume_versions)
3. n8n Automation Webhook (ping & latency verification)
"""

import os
import sys
import time
import argparse
from datetime import datetime
from pathlib import Path
import urllib.request
import urllib.error
import json

# Setup root path resolution for imports
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# ANSI colors for status badges
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
BOLD = "\033[1m"
RESET = "\033[0m"


def format_badge(status: str) -> str:
    if status == "HEALTHY":
        return f"{GREEN}[HEALTHY]{RESET}"
    elif status == "DEGRADED":
        return f"{YELLOW}[DEGRADED]{RESET}"
    else:
        return f"{RED}[OFFLINE]{RESET}"


def check_backend_health(base_url: str):
    url = f"{base_url.rstrip('/')}/health"
    start = time.perf_counter()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Pipeline-Monitor/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            elapsed_ms = (time.perf_counter() - start) * 1000
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                status = "HEALTHY" if elapsed_ms < 1000 else "DEGRADED"
                details = f"service: {data.get('service', 'OK')}"
                return status, elapsed_ms, details
            else:
                return "DEGRADED", elapsed_ms, f"HTTP {resp.status}"
    except Exception as e:
        elapsed_ms = (time.perf_counter() - start) * 1000
        return "OFFLINE", elapsed_ms, str(e)[:35]


def check_database_health(db_url: str = None):
    start = time.perf_counter()
    raw_url = (db_url or os.getenv("DATABASE_URL") or "").strip()
    
    # Try PostgreSQL first if DATABASE_URL is configured
    if raw_url and (raw_url.startswith("postgres") or raw_url.startswith("postgresql")):
        try:
            import psycopg2
            clean_url = raw_url.replace("postgres://", "postgresql://", 1)
            conn = psycopg2.connect(clean_url, connect_timeout=5)
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*), MAX(created_at) FROM resume_versions;")
            row = cur.fetchone()
            count = row[0] if row else 0
            latest_ts = str(row[1]) if (row and row[1]) else "None"
            cur.close()
            conn.close()
            elapsed_ms = (time.perf_counter() - start) * 1000
            status = "HEALTHY" if elapsed_ms < 500 else "DEGRADED"
            return status, elapsed_ms, count, latest_ts, "PostgreSQL"
        except Exception:
            pass # Fall through to SQLite

    # SQLite fallback
    sqlite_path = ROOT_DIR / "resume_auto_updater.db"
    if not sqlite_path.exists():
        sqlite_path = ROOT_DIR / "backend" / "resume_auto_updater.db"

    if sqlite_path.exists():
        try:
            import sqlite3
            conn = sqlite3.connect(str(sqlite_path), timeout=5)
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*), MAX(created_at) FROM resume_versions;")
            row = cur.fetchone()
            count = row[0] if row else 0
            latest_ts = str(row[1]) if (row and row[1]) else "None"
            cur.close()
            conn.close()
            elapsed_ms = (time.perf_counter() - start) * 1000
            status = "HEALTHY" if elapsed_ms < 500 else "DEGRADED"
            return status, elapsed_ms, count, latest_ts, "SQLite (Local)"
        except Exception as sq_err:
            elapsed_ms = (time.perf_counter() - start) * 1000
            return "OFFLINE", elapsed_ms, 0, "N/A", f"DB Error: {str(sq_err)[:25]}"

    elapsed_ms = (time.perf_counter() - start) * 1000
    return "OFFLINE", elapsed_ms, 0, "N/A", "Database file/URL not reachable"


def check_n8n_webhook(webhook_url: str):
    start = time.perf_counter()
    try:
        # Lightweight ping: POST mock ping event
        payload = json.dumps({"ping": True, "source": "monitor_pipeline"}).encode("utf-8")
        req = urllib.request.Request(
            webhook_url,
            data=payload,
            headers={"Content-Type": "application/json", "User-Agent": "Pipeline-Monitor/1.0"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            elapsed_ms = (time.perf_counter() - start) * 1000
            if resp.status in (200, 201):
                status = "HEALTHY" if elapsed_ms < 1000 else "DEGRADED"
                return status, elapsed_ms, f"HTTP {resp.status} OK"
            else:
                return "DEGRADED", elapsed_ms, f"HTTP {resp.status}"
    except urllib.error.HTTPError as he:
        elapsed_ms = (time.perf_counter() - start) * 1000
        if he.code in (400, 401, 403, 404):
            return "DEGRADED", elapsed_ms, f"HTTP {he.code} (Webhook Active)"
        return "DEGRADED", elapsed_ms, f"HTTP {he.code}"
    except Exception as e:
        elapsed_ms = (time.perf_counter() - start) * 1000
        return "OFFLINE", elapsed_ms, str(e)[:35]


def run_health_check(backend_url: str, webhook_url: str, db_url: str = None):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # 1. Backend API
    b_status, b_lat, b_details = check_backend_health(backend_url)
    
    # 2. Database & Resume Versions
    d_status, d_lat, total_resumes, latest_version_ts, db_type = check_database_health(db_url)
    
    # 3. n8n Automation Webhook
    n_status, n_lat, n_details = check_n8n_webhook(webhook_url)
    
    # Print formatted output table
    print("\n" + "=" * 80)
    print(f"{BOLD}RESUME AUTO-UPDATER · END-TO-END PIPELINE HEALTH MONITOR{RESET}")
    print(f"Timestamp: {timestamp} | Mode: Live Production Chain Check")
    print("=" * 80)
    print(f"{'COMPONENT':<22} | {'STATUS':<17} | {'LATENCY':<10} | {'DETAILS'}")
    print("-" * 80)
    print(f"{'Backend API (/health)':<22} | {format_badge(b_status):<26} | {b_lat:>6.1f} ms  | {b_details}")
    print(f"{'Database Engine':<22} | {format_badge(d_status):<26} | {d_lat:>6.1f} ms  | {db_type} (Latest version: {latest_version_ts})")
    print(f"{'n8n Webhook Pipeline':<22} | {format_badge(n_status):<26} | {n_lat:>6.1f} ms  | {n_details}")
    print("-" * 80)
    print(f"{BOLD}Total Processed Resume Versions in DB:{RESET} {GREEN}{total_resumes}{RESET}")
    
    # Overall summary badge
    all_healthy = (b_status == "HEALTHY" and d_status == "HEALTHY" and n_status == "HEALTHY")
    any_offline = (b_status == "OFFLINE" or d_status == "OFFLINE" or n_status == "OFFLINE")
    overall = "HEALTHY" if all_healthy else ("OFFLINE" if any_offline else "DEGRADED")
    print(f"{BOLD}Overall Pipeline Health:{RESET} {format_badge(overall)}")
    print("=" * 80 + "\n")


def main():
    parser = argparse.ArgumentParser(description="Resume Auto-Updater Pipeline Health Monitor (Day 8)")
    parser.add_argument("--backend", default=os.getenv("BACKEND_URL", "http://127.0.0.1:8000"), help="Backend base URL")
    parser.add_argument("--webhook", default=os.getenv("N8N_WEBHOOK_URL", "http://127.0.0.1:5678/webhook/github-push"), help="n8n Webhook URL")
    parser.add_argument("--db", default=os.getenv("DATABASE_URL"), help="Database URL (Postgres or SQLite)")
    parser.add_argument("--watch", action="store_true", help="Run in periodic monitoring watch mode")
    parser.add_argument("--interval", type=int, default=10, help="Watch interval in seconds (default: 10s)")
    args = parser.parse_args()

    if args.watch:
        print(f"{BLUE}Starting pipeline health monitor in watch mode (interval: {args.interval}s)... Press Ctrl+C to stop.{RESET}")
        try:
            while True:
                run_health_check(args.backend, args.webhook, args.db)
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\nMonitor stopped.")
    else:
        run_health_check(args.backend, args.webhook, args.db)


if __name__ == "__main__":
    main()

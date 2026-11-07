import os
import sys
import time
import argparse
from datetime import datetime, timezone
import requests

DEFAULT_URL = os.getenv("TARGET_URL", "http://127.0.0.1:8000/health")
DEFAULT_INTERVAL = int(os.getenv("PING_INTERVAL", "50"))


def ping_server(url: str) -> bool:
    """Sends a lightweight GET request to the target server health endpoint and prints performance latency."""
    start_time = time.time()
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    try:
        response = requests.get(url, timeout=15)
        duration_ms = (time.time() - start_time) * 1000

        if response.status_code == 200:
            print(f"[{now_str}]  PING SUCCESS | URL: {url} | Status: 200 | Latency: {duration_ms:.1f}ms")
            return True
        else:
            print(f"[{now_str}] [!] PING WARNING | URL: {url} | Status: {response.status_code} | Latency: {duration_ms:.1f}ms")
            return False
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        print(f"[{now_str}] [X] PING ERROR   | URL: {url} | Exception: {e} | Latency: {duration_ms:.1f}ms")
        return False


def main():
    parser = argparse.ArgumentParser(description="Render Server Keep-Alive Auto-Ping Runner")
    parser.add_argument(
        "--url",
        type=str,
        default=DEFAULT_URL,
        help="Target server health check URL (e.g., https://your-app.onrender.com/health)",
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=DEFAULT_INTERVAL,
        help="Interval between pings in seconds (default: 50s)",
    )

    args = parser.parse_args()

    print("=================================================================================")
    print("   RENDER AUTO-PING KEEP-ALIVE RUNNER")
    print("=================================================================================")
    print(f"Target URL:      {args.url}")
    print(f"Ping Interval:   Every {args.interval} seconds")
    print("Press Ctrl+C to stop the keep-alive runner.\n")

    # Initial ping
    ping_server(args.url)

    while True:
        try:
            time.sleep(args.interval)
            ping_server(args.url)
        except KeyboardInterrupt:
            print("\n[INFO] Keep-alive runner stopped by user.")
            sys.exit(0)


if __name__ == "__main__":
    main()

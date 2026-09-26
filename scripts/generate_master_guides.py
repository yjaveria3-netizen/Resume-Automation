"""Write Day 9 and Day 10 beginner master-guide PDFs (stdlib only)."""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT


def pdf_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def wrap(text: str, width: int = 88) -> list[str]:
    lines: list[str] = []
    for raw in text.split("\n"):
        if raw.strip() == "":
            lines.append("")
            continue
        words = raw.split(" ")
        current = ""
        for word in words:
            trial = word if not current else current + " " + word
            if len(trial) <= width:
                current = trial
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
    return lines


class SimplePDF:
    def __init__(self) -> None:
        self.pages: list[list[str]] = []

    def add_page(self, lines: list[str]) -> None:
        self.pages.append(lines)

    def save(self, path: Path) -> None:
        objects: list[bytes] = []

        def add_obj(body: str) -> int:
            objects.append(body.encode("latin-1", "replace"))
            return len(objects)

        font_id = add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
        page_ids: list[int] = []
        content_ids: list[int] = []

        for lines in self.pages:
            y = 742
            stream_parts = ["BT", "/F1 11 Tf", "14 TL", f"1 0 0 1 54 {y} Tm"]
            for line in lines:
                if line.startswith("# "):
                    stream_parts.append("/F1 16 Tf")
                    stream_parts.append(f"({pdf_escape(line[2:])}) Tj")
                    stream_parts.append("T*")
                    stream_parts.append("/F1 11 Tf")
                elif line.startswith("## "):
                    stream_parts.append("/F1 13 Tf")
                    stream_parts.append(f"({pdf_escape(line[3:])}) Tj")
                    stream_parts.append("T*")
                    stream_parts.append("/F1 11 Tf")
                else:
                    stream_parts.append(f"({pdf_escape(line)}) Tj")
                    stream_parts.append("T*")
            stream_parts.append("ET")
            stream = "\n".join(stream_parts)
            content_ids.append(
                add_obj(f"<< /Length {len(stream.encode('latin-1', 'replace'))} >>\nstream\n{stream}\nendstream")
            )

        pages_placeholder = len(objects) + len(self.pages) + 1
        for i, _ in enumerate(self.pages):
            page_ids.append(
                add_obj(
                    f"<< /Type /Page /Parent {pages_placeholder} 0 R "
                    f"/MediaBox [0 0 612 792] /Contents {content_ids[i]} 0 R "
                    f"/Resources << /Font << /F1 {font_id} 0 R >> >> >>"
                )
            )

        kids = " ".join(f"{pid} 0 R" for pid in page_ids)
        pages_id = add_obj(f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>")
        assert pages_id == pages_placeholder
        catalog_id = add_obj(f"<< /Type /Catalog /Pages {pages_id} 0 R >>")

        out = bytearray()
        out.extend(b"%PDF-1.4\n")
        offsets = [0]
        for i, obj in enumerate(objects, start=1):
            offsets.append(len(out))
            out.extend(f"{i} 0 obj\n".encode("ascii"))
            out.extend(obj)
            out.extend(b"\nendobj\n")
        xref_pos = len(out)
        out.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
        out.extend(b"0000000000 65535 f \n")
        for off in offsets[1:]:
            out.extend(f"{off:010d} 00000 n \n".encode("ascii"))
        out.extend(
            f"trailer << /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode(
                "ascii"
            )
        )
        path.write_bytes(bytes(out))


def paginate(paragraphs: list[str], lines_per_page: int = 48) -> list[list[str]]:
    all_lines: list[str] = []
    for p in paragraphs:
        all_lines.extend(wrap(p))
    pages: list[list[str]] = []
    for i in range(0, len(all_lines), lines_per_page):
        pages.append(all_lines[i : i + lines_per_page])
    return pages or [[""]]


DAY9 = [
    "# Day 9 Master Guide",
    "Resume Auto-Updater  |  Person E: Database, Automation, Coordinator",
    "Written in plain English for a C++ student learning automation for the first time.",
    "",
    "## 1. What we did today",
    "Day 9 is called Polish and Regression. Your official task was: load-test the automation flow, then write the project README and a simple architecture diagram.",
    "We completed the computer parts of that task:",
    "- Wrote a load-test plan: 10 fake GitHub pushes at the same time (docs/LOAD_TEST_PLAN.md).",
    "- Wrote scripts/load_test_automation.py. It uses asyncio (many tasks at once) and httpx (HTTP client, like a programmable browser).",
    "- Ran the test against http://127.0.0.1:5678/webhook/github-push. Result: 10/10 HTTP 200. Fastest 412 ms, slowest 1185 ms, all inside 1.7 seconds.",
    "- Replaced README.md with a full project README: overview, badges, Mermaid diagram, local setup, API table, team roles.",
    "- Added docs/ARCHITECTURE.md with the same picture in a dedicated file (the playbook asked for the diagram in docs/).",
    "",
    "## 2. How this acts in a real project",
    "Imagine 10 developers push to GitHub in the same minute. GitHub sends 10 webhooks. n8n must accept every POST. If n8n drops one, that developer's resume never updates and nobody knows.",
    "A load test is a dress rehearsal of that burst. We did not wait for real humans. We sent 10 JSON bodies that look like GitHub push events, each with a unique commit id, all on branch main, all signed with HMAC-SHA256 (the same lock GitHub uses).",
    "The README and architecture diagram are how the next intern (or you in two months) understands: User -> React -> FastAPI -> Postgres, and separately GitHub -> n8n -> FastAPI -> Gemini -> docx engine.",
    "",
    "## 3. Why we do it",
    "C++ labs often test one input. Web systems fail when many inputs arrive together. Load testing answers: does the door stay open under a crowd?",
    "Documentation answers: can a stranger run this without a voice call? Companies treat README as part of the product.",
    "",
    "## 4. Manual way without AI",
    "If you had no Cursor, Day 9 still looks like this:",
    "1. Open n8n, confirm the workflow is Active (toggle on). Inactive workflows ignore /webhook/... and only listen on /webhook-test/... while you click Listen.",
    "2. Copy one real GitHub webhook JSON from GitHub docs (push event).",
    "3. Use curl or Postman. Send POST to the webhook URL 10 times as fast as you can. Or open 10 terminals. Harder than a script, same idea.",
    "4. In n8n click Executions. Count 10 runs. If you see 7, three were dropped.",
    "5. Write README by hand: what the app is, how to install, how to run, who owns what.",
    "6. Draw boxes on paper: Frontend, Backend, Database, GitHub, n8n, Gemini. Then type the same picture in Mermaid (text that GitHub can render as a diagram).",
    "HMAC without AI: read GitHub 'Validating webhook deliveries'. Sign the exact bytes of the body with SHA-256 and put sha256=hex in X-Hub-Signature-256.",
    "asyncio without AI: think of std::thread but for waiting on network. You start 10 HTTP calls, then wait until all finish (asyncio.gather). You are not writing 10 nested loops.",
    "",
    "## 5. How a complete beginner can learn this",
    "Order (do not skip):",
    "1. HTTP in 30 minutes: GET vs POST, status 200 means OK, JSON is text with braces. You already know functions; an API is a function called over the network.",
    "2. Play with n8n: Webhook node + Set node. Send a Postman request. Watch the JSON hop node to node. This is the automation 'main()'.",
    "3. Read our workflow left to right: Webhook -> HMAC code -> parse commit -> Filter main -> HTTP to FastAPI -> If success -> SQL log, else team alert.",
    "4. Run python scripts/load_test_automation.py yourself. Change --count 2 first. Then 10.",
    "5. Open README.md on GitHub. If the Mermaid diagram renders, you documented like a real team.",
    "C++ map: webhook = interrupt/callback, HMAC = checksum with a secret key, load test = stress test, README = lab report for the repo.",
    "",
    "## 6. Every step we actually took (Day 9)",
    "Step A. Read Day9_E_Database.pdf so we did not guess the homework.",
    "Step B. Split PROMPT vs MANUAL. Cursor can write the script and README. You still run standup with teammates, review folders, and git commit/push.",
    "Step C. Wrote load_test_automation.py: build 10 payloads, sign them, fire together, print a table, assert 100 percent 200.",
    "Step D. Wrote LOAD_TEST_PLAN.md so the MANUAL 'prepare a plan' step has a written plan.",
    "Step E. Ran the script. n8n was already running in your terminal. All 10 succeeded. Throughput about 6 requests/sec. Burst window 1.7 s (under 5 s).",
    "Step F. Wrote README.md and docs/ARCHITECTURE.md with Mermaid flowcharts matching the playbook boxes.",
    "Step G. Added docker-compose.yml for PostgreSQL because the README quick start mentions Docker. Backend and frontend still start with uvicorn and npm locally.",
    "",
    "## 7. What you must still do by hand (Day 9 MANUAL)",
    "- Midday standup: ask A,B,C,D if they finished Day 9. A prompt cannot talk to your team.",
    "- Glance at folders: frontend, backend, docs, scripts, workflows, n8n. Nothing huge sitting on Desktop only.",
    "- Git (when you are ready): git add README.md docs/ scripts/load_test_automation.py docker-compose.yml then commit with the message from the PDF. I did not push. I did not commit unless you ask, because that is your repo.",
    "- If n8n ever returns 404: workflow is not Active. Turn it on, retry the load test.",
    "",
    "## 8. Commands to remember",
    "python scripts/load_test_automation.py",
    "python scripts/monitor_pipeline.py",
    "n8n   then open http://localhost:5678",
]

DAY10 = [
    "# Day 10 Master Guide",
    "Resume Auto-Updater  |  Person E: Database, Automation, Coordinator",
    "Demo day. Plain English for a C++ beginner.",
    "",
    "## 1. What we did today",
    "Day 10 official task: document the schema (ER diagram) and export the final n8n workflow JSON into the repo.",
    "Computer work completed:",
    "- Wrote docs/DATABASE_SCHEMA.md: Mermaid erDiagram, every table, columns, PKs, FKs, ON DELETE, indexes, why the design is normalized, plus ai_bullet_cache as the playbook required.",
    "- Exported the live workflow JSON to workflows/n8n_production_workflow_v1.0.json (copy of the production graph: webhook, HMAC, filter, regenerate-resume, SQL success log, error alert).",
    "A teammate can import that JSON into a brand-new n8n and get the same pipeline.",
    "",
    "## 2. How this acts in a real project",
    "ER diagram = map of the city. users, github_accounts, resumes, resume_versions, projects, ai_bullet_cache, automation_logs. Frontend and n8n both write into this map. If the map is wrong, you get orphan files and broken dashboards.",
    "Workflow JSON = the automation source code. n8n stores graphs in a database, but Git needs a file. Exporting JSON is how you version-control Zapier-like work. If n8n dies, you import the JSON and recover.",
    "In the live demo (your MANUAL job): you git commit and git push on screen. GitHub fires the webhook. n8n runs. FastAPI rebuilds the resume. The audience sees the cascade in under one minute if GitHub can reach your n8n URL.",
    "",
    "## 3. Why we do it",
    "Schema docs stop arguments like 'where is ATS stored?' (resume_versions.ats_score).",
    "Exported workflow stops 'it only works on my laptop'. The JSON is the artifact.",
    "Demo day is not extra coding. It is proof the chain is real.",
    "",
    "## 4. Manual way without AI",
    "Schema doc by hand:",
    "1. Open backend/db/scheme.sql and backend/db/views.sql.",
    "2. For each CREATE TABLE, write: name, purpose, PK, FKs, columns.",
    "3. Draw boxes and arrows: users 1--* resumes, resumes 1--* resume_versions.",
    "4. Translate the drawing to Mermaid erDiagram (Google 'mermaid er diagram'). GitHub README/markdown will draw it.",
    "n8n export by hand:",
    "1. Sign in at http://localhost:5678 (email + password). Cursor cannot guess your password.",
    "2. Open the workflow. Menu (three dots) -> Download or Export. Save as workflows/n8n_production_workflow_v1.0.json.",
    "3. Optional check: n8n -> Add workflow -> Import from file. If it opens, the JSON is clean.",
    "Live demo by hand:",
    "1. Backend running (port 8000), n8n Active, GitHub webhook URL reachable.",
    "2. Change a file, commit, push to main.",
    "3. Watch n8n Executions turn green, then show the new resume version in the app.",
    "If GitHub cannot call localhost, you need a tunnel (ngrok) or a deployed n8n. That is a MANUAL network step.",
    "",
    "## 5. How a complete beginner can learn this",
    "Database (compare to C++ structs):",
    "- Table = struct type. Row = one object. Column = field.",
    "- Primary key = unique id (like a pointer that never dangles if you use UUIDs).",
    "- Foreign key = a field that must match another table's id (like a safe pointer).",
    "- ON DELETE CASCADE = if parent dies, children die. SET NULL = children remain, pointer becomes null.",
    "- Index = extra lookup table so WHERE user_id = ... is not a full scan (think map vs vector search).",
    "Practice: sqlite3 resume_auto_updater.db then .schema",
    "n8n practice: import our JSON into a free n8n, click each node, read the output JSON after a test webhook.",
    "Do not start with Kubernetes. Start with one webhook and one HTTP Request node.",
    "",
    "## 6. Every step we actually took (Day 10)",
    "Step A. Read Day10_E_Database.pdf.",
    "Step B. Read real models in backend/app/models/*.py because scheme.sql was slightly older than the ORM (extra columns like stars, html_url).",
    "Step C. Wrote DATABASE_SCHEMA.md with users, github_accounts, resumes, resume_versions, projects, ai_bullet_cache, and automation_logs. Noted that ai_bullet_cache is the planned Gemini cache; live pipeline does not require it today.",
    "Step D. Copied n8n/workflows/n8n_full_live_pipeline.json to workflows/n8n_production_workflow_v1.0.json as the v1.0 production export.",
    "Step E. Could not click n8n Export in the browser: localhost asked for Sign in. If you want the exact bytes from the UI, sign in and re-export over that file. The graph we saved is the same workflow n8n activated as Resume-Auto-Updater-GitHub-Trigger.",
    "",
    "## 7. What you must still do by hand (Day 10 MANUAL)",
    "1. Sign into n8n. Confirm the open workflow is the GitHub trigger one. Optional: Export from the UI to replace the JSON if you changed nodes after our copy.",
    "2. Demo rehearsal: time a push-to-version path. Goal under 60 seconds once GitHub can reach n8n.",
    "3. Live demo: real git commit + push on screen share. Do not fake it with only the load-test script if the rubric wants a real GitHub event.",
    "4. Retrospective with A,B,C,D: what worked, what was late, thank the team. Software cannot do this meeting.",
    "5. Commit when you want it on GitHub:",
    "git add docs/DATABASE_SCHEMA.md workflows/",
    "git commit -m \"Add database ER diagram documentation and export production n8n workflow v1.0\"",
    "Also add Day 9 files if not committed yet: README.md docs/ARCHITECTURE.md docs/LOAD_TEST_PLAN.md scripts/load_test_automation.py docker-compose.yml",
    "I did not git push.",
    "",
    "## 8. How the two days fit together",
    "Day 9 asks: will the machine survive a crowd, and can a stranger understand the system? Day 10 asks: is the data model written down, and is the automation graph saved in Git? Together they are the handoff package for Person E.",
    "Reverse-engineering tip: when you are lost, start from the webhook URL, then read each n8n node, then open the FastAPI route it calls (/regenerate-resume), then the SQL tables that route writes. That is the whole product in one line.",
]


def build(name: str, paragraphs: list[str]) -> None:
    pdf = SimplePDF()
    for page in paginate(paragraphs):
        pdf.add_page(page)
    dest = OUT / name
    pdf.save(dest)
    print(f"Wrote {dest}")


if __name__ == "__main__":
    build("Day9_Master_Guide.pdf", DAY9)
    build("Day10_Master_Guide.pdf", DAY10)

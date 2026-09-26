# System Architecture

End-to-end flow for Resume Auto-Updater.

```mermaid
flowchart LR
    User[User]
    React[React Frontend<br/>Vite + Tailwind]
    API[FastAPI Backend]
    DB[(PostgreSQL)]
    GH[GitHub API]
    Gemini[Google Gemini AI]
    Docx[python-docx Engine]
    N8N[n8n Automation]

    User --> React
    React -->|JWT / forms / upload| API
    API --> DB
    API --> GH
    API --> Gemini
    API --> Docx
    GH -->|push webhook HMAC| N8N
    N8N -->|POST /regenerate-resume<br/>X-Service-Secret| API
    Docx -->|updated .docx + ATS score| DB
    API -->|preview / download / versions| React
```

## What happens on a GitHub push

1. Developer pushes code to `main`.
2. GitHub POSTs a signed webhook to n8n.
3. n8n verifies HMAC, keeps only `main`, then calls FastAPI.
4. FastAPI fetches repos, ranks projects, asks Gemini for bullets, rewrites the `.docx`, stores a new version + ATS score.
5. Success is logged in `automation_logs`. Failure can alert the team channel.

See also `docs/DATABASE_SCHEMA.md` for tables and keys.

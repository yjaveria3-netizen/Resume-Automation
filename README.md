# Resume Auto-Update
An app that connects to your GitHub, picks your most impressive projects, and automatically rewrites the "Projects" section of your resume with AI-written bullet points — while checking how likely your resume is to pass automatic ATS screening. It also runs fully automatically: every time you push new code to GitHub, your resume quietly updates itself.

## Team

| Role | Name |
|---|---|
| Frontend Lead | A |
| Frontend Support, QA and Demo | B |
| Backend Lead and Deployment | C |
| AI & Resume Logic | D |
| Database, Automation and Coordinator | E |

## Repo Structure

- `/frontend` — React (Vite + Tailwind) app: login, signup, dashboard, GitHub connect, resume upload/update UI.
- `/backend` — FastAPI server: auth, GitHub OAuth, resume generation pipeline, database connection.
- `/n8n` — n8n automation workflow: listens for GitHub push webhooks and triggers the backend's `/regenerate-resume` endpoint automatically.
- `/docs` — Project documentation: architecture notes, schema/ER diagrams, and workflow exports.

## Getting Started

### Frontend
```bash
cd frontend
# setup instructions to be  added by person A
```

### Backend
```bash
cd backend
# setup instructions to be added by person C
```

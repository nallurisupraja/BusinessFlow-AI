# BusinessFlow AI

One Platform to Manage Business Money, Payments and Cash Flow.

## Requirements

- Python 3.10.11 for the backend
- Node.js 20 LTS or newer for the frontend
- PostgreSQL 16 installed locally on Windows
- Docker Desktop is optional, not required

## Database setup (local PostgreSQL)

1. Create a database named `businessflow` and a user named `businessflow` with password `businessflow` (or use your own values).
2. Copy `.env.example` to `.env` in the project root and set `DATABASE_URL` to match.

## Optional: Docker

If Docker Desktop is installed, `docker compose up -d db` starts PostgreSQL 16.

## Backend (PowerShell)

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements-dev.txt
pytest
ruff check .
uvicorn app.main:app --reload
```

Health check: http://localhost:8000/api/v1/health

## Frontend (PowerShell)

```powershell
cd frontend
npm install
npm test
npm run dev
```

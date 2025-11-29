# IndoorCyclingMonitor

Indoor cycling monitor using ANT+ and Streamlit for GUI

## Run locally

Prereqs (install once):

- Python 3.12 + pipenv: `cd back && pipenv install`
- Node.js + npm: `cd front && npm install`

Then start both backend (FastAPI) and frontend (Vite) with one command from the repo root:

```bash
./dev.sh
```

Backend runs on http://127.0.0.1:8000 (FastAPI docs at `/docs`) and frontend on http://localhost:5173. Hit Ctrl+C to stop both.

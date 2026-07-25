# Backend Service (`backend/`)

This directory contains the Python FastAPI application server for the A2A Inspector.

---

## 🛠️ Key Components

- **`app.py`**:
  - **Socket.IO Integration**: Manages real-time WebSocket messaging between the inspector UI and background tasks.
  - **Static Asset Routes**: Mounts `/static` for frontend assets and `/renderer` for self-contained A2UI Composer renderer static files (`../frontend/public/renderer`).
  - **Agent Proxy Endpoints**: Fetches `.well-known/agent-card.json` metadata and proxies JSON-RPC 2.0 requests to A2A agents.

---

## 🚀 How to Run

```bash
uv run app.py
```
Starts the server on `http://127.0.0.1:5001`.

# A2A Inspector (with A2UI Composer Integration)

An enhanced inspection and validation tool for **Agent-to-Agent (A2A) protocol** communication, extended to render interactive **A2UI v0.9 protocol surfaces** inside sandboxed iframe containers using **A2UI Composer**.

---

## 📁 Repository Directory Structure

- **[`backend/`](./backend/README.md)**: FastAPI application server, Socket.IO WebSocket handlers, and proxy endpoints for A2A agent cards.
- **[`frontend/`](./frontend/README.md)**: Web interface source code, build scripts, TypeScript modules, styles, and static renderer assets.
  - **[`frontend/src/`](./frontend/src/README.md)**: Modular TypeScript source code (A2UI transformers, surface UI components, full-page chat controller).
  - **[`frontend/public/`](./frontend/public/README.md)**: Compiled bundle assets, HTML templates, CSS styles, and renderer assets.
  - **[`frontend/public/renderer/`](./frontend/public/renderer/README.md)**: Self-contained A2UI Composer Lit renderer application dist package.

---

## 🚀 Quick Start Guide

### 1. Build Frontend Bundle
```bash
cd frontend
npm install
npm run build
```

### 2. Start Backend Server
```bash
cd backend
uv run app.py
```

Access the UI at **[http://127.0.0.1:5001](http://127.0.0.1:5001)**.

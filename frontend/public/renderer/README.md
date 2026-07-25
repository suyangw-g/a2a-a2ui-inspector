# A2UI Composer Renderer Application (`frontend/public/renderer/`)

Self-contained build assets from [a2ui-project/composer](https://github.com/a2ui-project/composer) (`lit-basic-catalog`).

---

## 🛠️ Overview

- **`index.html`**: Entrypoint hosted inside surface `<iframe>` elements.
- **`assets/index.js`**: Bundled Lit A2UI Catalog components and `PreviewBridge` postMessage listener.
- Served by the backend under `/renderer` to render A2UI surfaces in an isolated cross-origin context.

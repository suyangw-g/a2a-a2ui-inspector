# Frontend Source Code (`frontend/src/`)

Modular TypeScript source files for the A2A Inspector frontend.

---

## 🛠️ Architecture & Modules

- **`types/a2ui.ts`**: TypeScript interface definitions for A2UI v0.9 payloads (`A2uiSurfaceGroup`, `RenderA2uiItem`, bridge command interfaces).
- **`transformers/a2ui-transformer.ts`**: Pure functions (`extractA2uiSurfaces`, `buildRenderPayload`) to parse markdown/JSON text, normalize A2UI data structures, and format commands for PreviewBridge.
- **`components/a2ui-surface.ts`**: Factory module (`createA2uiSurfaceComponent`) constructing sandboxed iframe DOM containers and per-surface JSON inspectors (`createSurface`, `updateComponents`, `updateDataModel`).
- **`components/full-page-chat.ts`**: Controller module managing full-page chat mode toggling.
- **`script.ts`**: Entrypoint script managing Socket.IO events, chat UI interactions, A2UI bridge message listeners, and debug console logs.

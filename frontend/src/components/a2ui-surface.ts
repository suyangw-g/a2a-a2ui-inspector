/**
 * @fileoverview Component module for building A2UI surface DOM cards,
 * sandboxed renderer iframe elements, and collapsible JSON inspection views.
 * Follows Google TypeScript Style Guide.
 */

import DOMPurify from 'dompurify';
import {A2uiSurfaceGroup, RenderA2uiItem} from '../types/a2ui';
import {buildRenderPayload} from '../transformers/a2ui-transformer';

export interface SurfaceComponentOptions {
  group: A2uiSurfaceGroup;
  rendererUrl?: string;
  onIframeCreated?: (
    surfaceId: string,
    iframe: HTMLIFrameElement,
    payload: RenderA2uiItem[],
  ) => void;
}

/**
 * Constructs a self-contained DOM element representing an A2UI Surface card.
 *
 * @param options Options containing surface group data and callbacks.
 * @return Fully constructed HTMLDivElement.
 */
export function createA2uiSurfaceComponent(
  options: SurfaceComponentOptions,
): HTMLDivElement {
  const {
    group,
    rendererUrl = '/renderer/index.html',
    onIframeCreated,
  } = options;
  const payload = buildRenderPayload(group);

  const container = document.createElement('div');
  container.className = 'a2ui-surface-card';
  container.setAttribute('data-surface-id', group.surfaceId);

  // Surface Card Header
  const header = document.createElement('div');
  header.className = 'a2ui-surface-header';

  const badge = document.createElement('span');
  badge.className = 'a2ui-surface-badge';
  badge.textContent = 'A2UI SURFACE';
  header.appendChild(badge);

  const title = document.createElement('span');
  title.className = 'a2ui-surface-id';
  title.textContent = `ID: ${group.surfaceId}`;
  header.appendChild(title);

  if (group.catalogId) {
    const catalog = document.createElement('span');
    catalog.className = 'a2ui-surface-catalog';
    catalog.textContent = `Catalog: ${group.catalogId}`;
    header.appendChild(catalog);
  }

  container.appendChild(header);

  // Render Box with Sandboxed IFrame
  const renderBox = document.createElement('div');
  renderBox.className = 'a2ui-surface-rendered-container';

  const iframe = document.createElement('iframe');
  iframe.className = 'a2ui-surface-iframe';
  iframe.src = rendererUrl;
  iframe.title = `A2UI Surface ${group.surfaceId}`;
  iframe.sandbox.add('allow-scripts', 'allow-same-origin', 'allow-forms');

  renderBox.appendChild(iframe);
  container.appendChild(renderBox);

  if (onIframeCreated) {
    onIframeCreated(group.surfaceId, iframe, payload);
  }

  // JSON Inspector Collapsible Panel
  const jsonInspector = document.createElement('div');
  jsonInspector.className = 'a2ui-json-inspector';

  // 1. Surface Creation Section
  const createDetailsEl = createJsonDetailsElement(
    '🔍 Surface Creation JSON (createSurface)',
    group.createSurface || payload[0],
  );
  jsonInspector.appendChild(createDetailsEl);

  // 2. Surface Component Updates Section
  const compCmd = payload.find(item => 'updateComponents' in item);
  if (group.updateComponents || compCmd) {
    const compDetailsEl = createJsonDetailsElement(
      '🧩 Surface Component Updates JSON (updateComponents)',
      group.updateComponents || compCmd,
    );
    jsonInspector.appendChild(compDetailsEl);
  }

  // 3. Data Model Updates Section
  const dataCmd = payload.find(item => 'updateDataModel' in item);
  if (group.updateDataModel || dataCmd) {
    const dataDetailsEl = createJsonDetailsElement(
      '📊 Data Model Updates JSON (updateDataModel)',
      group.updateDataModel || dataCmd,
    );
    jsonInspector.appendChild(dataDetailsEl);
  }

  // 4. Surface Deletion Section
  const deleteCmd = payload.find(item => 'deleteSurface' in item);
  if (group.deleteSurface || deleteCmd) {
    const deleteDetailsEl = createJsonDetailsElement(
      '🗑️ Surface Deletion JSON (deleteSurface)',
      group.deleteSurface || deleteCmd,
    );
    jsonInspector.appendChild(deleteDetailsEl);
  }

  container.appendChild(jsonInspector);
  return container;
}

/**
 * Creates a collapsible <details> element containing formatted & sanitized JSON.
 */
function createJsonDetailsElement(
  summaryText: string,
  jsonObject: unknown,
): HTMLDetailsElement {
  const details = document.createElement('details');
  details.className = 'a2ui-json-details';

  const summary = document.createElement('summary');
  summary.textContent = summaryText;
  details.appendChild(summary);

  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.innerHTML = DOMPurify.sanitize(JSON.stringify(jsonObject, null, 2));
  pre.appendChild(code);
  details.appendChild(pre);

  return details;
}

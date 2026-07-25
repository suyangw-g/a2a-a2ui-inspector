/**
 * @fileoverview Transformer module for parsing and normalizing A2UI v0.9 messages
 * transported over the A2A protocol into strict PreviewBridge commands.
 *
 * Follows A2UI v0.9 Specification and Google TypeScript Style Guide.
 */

import {
  A2uiSurfaceGroup,
  CreateSurfaceCommand,
  DeleteSurfaceCommand,
  RenderA2uiItem,
  UpdateComponentsCommand,
  UpdateDataModelCommand,
} from '../types/a2ui';

const DEFAULT_CATALOG_ID = 'https://a2ui.org/catalogs/basic.json';

/**
 * Extracts and groups valid A2UI v0.9 messages from A2A message text or objects.
 *
 * @param input Raw message string (JSON / markdown block) or parsed object.
 * @return Map of surface IDs to normalized A2uiSurfaceGroup objects.
 */
export function extractA2uiSurfaces(
  input: string | Record<string, unknown>,
): Map<string, A2uiSurfaceGroup> {
  const surfaceMap = new Map<string, A2uiSurfaceGroup>();
  const items: Record<string, unknown>[] = [];

  if (typeof input === 'string') {
    // Extract JSON payload from markdown code block if present
    const jsonBlockMatch = /```(?:json)?\s*([\s\S]*?)\s*```/i.exec(input);
    const rawJson = jsonBlockMatch ? jsonBlockMatch[1] : input;

    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed)) {
        items.push(...parsed);
      } else if (typeof parsed === 'object' && parsed !== null) {
        items.push(parsed as Record<string, unknown>);
      }
    } catch {
      return surfaceMap; // Text is plain text, not A2UI payload
    }
  } else if (typeof input === 'object' && input !== null) {
    items.push(input);
  }

  // Filter and group A2UI v0.9 messages by surfaceId
  for (const item of items) {
    if (item['version'] !== 'v0.9') {
      continue;
    }

    const createSurface = item['createSurface'] as Record<string, unknown> | undefined;
    const updateComponents = item['updateComponents'] as Record<string, unknown> | undefined;
    const updateDataModel = item['updateDataModel'] as Record<string, unknown> | undefined;
    const deleteSurface = item['deleteSurface'] as Record<string, unknown> | undefined;

    const surfaceId =
      (createSurface?.['surfaceId'] as string) ||
      (updateComponents?.['surfaceId'] as string) ||
      (updateDataModel?.['surfaceId'] as string) ||
      (deleteSurface?.['surfaceId'] as string) ||
      (item['surface'] as string);

    if (!surfaceId) {
      continue;
    }

    if (!surfaceMap.has(surfaceId)) {
      surfaceMap.set(surfaceId, {
        surfaceId,
        catalogId: (createSurface?.['catalogId'] as string) || DEFAULT_CATALOG_ID,
        allMessages: [],
      });
    }

    const group = surfaceMap.get(surfaceId)!;
    group.allMessages.push(item);

    if (createSurface) {
      group.createSurface = createSurface;
      if (createSurface['catalogId']) {
        group.catalogId = createSurface['catalogId'] as string;
      }
    }
    if (updateComponents) {
      group.updateComponents = updateComponents;
    }
    if (updateDataModel) {
      group.updateDataModel = updateDataModel;
    }
    if (deleteSurface) {
      group.deleteSurface = deleteSurface;
    }
  }

  return surfaceMap;
}

/**
 * Builds clean, spec-compliant PreviewBridge command payloads.
 * Guarantees each command object contains strictly one update type key.
 *
 * @param group The surface group containing extracted surface data.
 * @return Array of single-command items formatted for PreviewBridge.
 */
export function buildRenderPayload(group: A2uiSurfaceGroup): RenderA2uiItem[] {
  const payload: RenderA2uiItem[] = [];

  // 1. CreateSurfaceCommand
  const createDetails = group.createSurface;
  const surfaceId = (createDetails?.['surfaceId'] as string) || group.surfaceId;
  const catalogId =
    (createDetails?.['catalogId'] as string) || group.catalogId || DEFAULT_CATALOG_ID;

  const createCmd: CreateSurfaceCommand = {
    version: 'v0.9',
    createSurface: {
      surfaceId,
      catalogId,
    },
  };
  payload.push(createCmd);

  // 2. UpdateComponentsCommand
  if (group.updateComponents) {
    const rawComp = group.updateComponents;
    const compList = Array.isArray(rawComp)
      ? rawComp
      : ((rawComp['components'] as unknown[]) || []);

    const updateCompCmd: UpdateComponentsCommand = {
      version: 'v0.9',
      updateComponents: {
        surfaceId,
        components: compList,
      },
    };
    payload.push(updateCompCmd);
  }

  // 3. UpdateDataModelCommand
  if (group.updateDataModel) {
    const rawData = group.updateDataModel;
    const dataObj =
      rawData['data'] !== undefined
        ? (rawData['data'] as Record<string, unknown>)
        : rawData;

    const updateDataCmd: UpdateDataModelCommand = {
      version: 'v0.9',
      updateDataModel: {
        surfaceId,
        data: dataObj,
      },
    };
    payload.push(updateDataCmd);
  }

  // 4. DeleteSurfaceCommand
  if (group.deleteSurface) {
    const rawDelete = group.deleteSurface;
    const deleteCmd: DeleteSurfaceCommand = {
      version: 'v0.9',
      deleteSurface: {
        surfaceId: (rawDelete['surfaceId'] as string) || group.surfaceId,
      },
    };
    payload.push(deleteCmd);
  }

  return payload;
}

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
    // 1. Try matching <a2ui-json>...</a2ui-json> or ```json...``` blocks
    const blockRegex =
      /(?:```(?:json)?|<a2ui-json>)\s*([\s\S]*?)\s*(?:```|<\/a2ui-json>)/gi;
    let match: RegExpExecArray | null;
    let foundBlocks = false;

    while ((match = blockRegex.exec(input)) !== null) {
      foundBlocks = true;
      try {
        const parsed = JSON.parse(match[1].trim());
        if (Array.isArray(parsed)) {
          items.push(...parsed);
        } else if (typeof parsed === 'object' && parsed !== null) {
          items.push(parsed as Record<string, unknown>);
        }
      } catch (err) {
        console.warn(
          '[A2UI Transformer] Failed to parse matched block JSON:',
          err,
        );
      }
    }

    // 2. If no block tags matched, try parsing the whole input string directly
    if (!foundBlocks) {
      try {
        const parsed = JSON.parse(input.trim());
        if (Array.isArray(parsed)) {
          items.push(...parsed);
        } else if (typeof parsed === 'object' && parsed !== null) {
          items.push(parsed as Record<string, unknown>);
        }
      } catch {
        // Also try scanning for any standalone JSON array or object substring
        const jsonSubstringRegex = /(\[[\s\S]*\]|\{[\s\S]*\})/g;
        let subMatch: RegExpExecArray | null;
        while ((subMatch = jsonSubstringRegex.exec(input)) !== null) {
          try {
            const parsed = JSON.parse(subMatch[1].trim());
            if (Array.isArray(parsed)) {
              items.push(...parsed);
            } else if (typeof parsed === 'object' && parsed !== null) {
              items.push(parsed as Record<string, unknown>);
            }
          } catch {
            // Ignore non-JSON substrings
          }
        }
      }
    }
  } else if (Array.isArray(input)) {
    items.push(...input);
  } else if (typeof input === 'object' && input !== null) {
    const obj = input as Record<string, unknown>;
    if (Array.isArray(obj['data'])) {
      items.push(...(obj['data'] as Record<string, unknown>[]));
    } else if (obj['data'] && typeof obj['data'] === 'object') {
      items.push(obj['data'] as Record<string, unknown>);
    } else {
      items.push(obj);
    }
  }

  // Filter and group A2UI v0.8 and v0.9 messages by surfaceId
  for (const item of items) {
    const version = String(item['version'] || '');
    const isA2ui =
      version.includes('0.9') ||
      version.includes('0.8') ||
      item['createSurface'] !== undefined ||
      item['updateComponents'] !== undefined ||
      item['updateDataModel'] !== undefined;

    if (!isA2ui) {
      continue;
    }

    const createSurface = item['createSurface'] as
      | Record<string, unknown>
      | undefined;
    const updateComponents = item['updateComponents'] as
      | Record<string, unknown>
      | undefined;
    const updateDataModel = item['updateDataModel'] as
      | Record<string, unknown>
      | undefined;
    const deleteSurface = item['deleteSurface'] as
      | Record<string, unknown>
      | undefined;

    const surfaceId =
      (createSurface?.['surfaceId'] as string) ||
      (updateComponents?.['surfaceId'] as string) ||
      (updateDataModel?.['surfaceId'] as string) ||
      (deleteSurface?.['surfaceId'] as string) ||
      (item['surface'] as string) ||
      'default';

    if (!surfaceMap.has(surfaceId)) {
      surfaceMap.set(surfaceId, {
        surfaceId,
        catalogId:
          (createSurface?.['catalogId'] as string) || DEFAULT_CATALOG_ID,
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
  if (group.allMessages && group.allMessages.length > 0) {
    return group.allMessages as unknown as RenderA2uiItem[];
  }

  const payload: RenderA2uiItem[] = [];

  // 1. CreateSurfaceCommand
  const createDetails = group.createSurface;
  const surfaceId = (createDetails?.['surfaceId'] as string) || group.surfaceId;
  const catalogId =
    (createDetails?.['catalogId'] as string) ||
    group.catalogId ||
    DEFAULT_CATALOG_ID;

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
      : (rawComp['components'] as unknown[]) || [];

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

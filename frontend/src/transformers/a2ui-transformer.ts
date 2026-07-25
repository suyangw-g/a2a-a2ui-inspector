/**
 * @fileoverview Transformer module for parsing, validating, and normalizing
 * raw agent text and JSON messages into A2UI v0.9 surface data structures.
 * Follows Google TypeScript Style Guide.
 */

import {
  A2uiSurfaceGroup,
  CreateSurfaceCommand,
  RenderA2uiItem,
  UpdateComponentsCommand,
  UpdateDataModelCommand,
} from '../types/a2ui';

const DEFAULT_CATALOG_ID = 'https://a2ui.org/catalogs/basic.json';

/**
 * Parses raw text or JSON objects to extract valid A2UI v0.9 surface groups.
 *
 * @param input Raw text containing JSON code blocks or an object payload.
 * @return Map of surface IDs to normalized A2uiSurfaceGroup objects.
 */
export function extractA2uiSurfaces(
  input: string | Record<string, unknown>,
): Map<string, A2uiSurfaceGroup> {
  const surfaceMap = new Map<string, A2uiSurfaceGroup>();
  const parsedItems: Record<string, unknown>[] = [];

  if (typeof input === 'string') {
    // Extract JSON payloads from markdown code blocks or plain text strings
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/gi;
    let match: RegExpExecArray | null;

    while ((match = jsonBlockRegex.exec(input)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed)) {
          parsedItems.push(...parsed);
        } else if (typeof parsed === 'object' && parsed !== null) {
          parsedItems.push(parsed as Record<string, unknown>);
        }
      } catch {
        // Skip non-JSON code blocks
      }
    }

    if (parsedItems.length === 0) {
      try {
        const directParsed = JSON.parse(input);
        if (Array.isArray(directParsed)) {
          parsedItems.push(...directParsed);
        } else if (typeof directParsed === 'object' && directParsed !== null) {
          parsedItems.push(directParsed as Record<string, unknown>);
        }
      } catch {
        // Text is plain text, not A2UI payload
      }
    }
  } else if (typeof input === 'object' && input !== null) {
    parsedItems.push(input);
  }

  for (const item of parsedItems) {
    if (item['version'] !== 'v0.9') {
      continue;
    }

    const surfaceId =
      (item['surface'] as string) ||
      (item['createSurface'] as Record<string, unknown>)?.['surfaceId'] as string ||
      (item['updateComponents'] as Record<string, unknown>)?.['surfaceId'] as string ||
      (item['updateDataModel'] as Record<string, unknown>)?.['surfaceId'] as string;

    if (!surfaceId) {
      continue;
    }

    if (!surfaceMap.has(surfaceId)) {
      surfaceMap.set(surfaceId, {
        surfaceId,
        catalogId: DEFAULT_CATALOG_ID,
        allMessages: [],
      });
    }

    const group = surfaceMap.get(surfaceId)!;
    group.allMessages.push(item);

    if (item['createSurface']) {
      group.createSurface = item['createSurface'] as Record<string, unknown>;
      const cat = (group.createSurface['catalogId'] as string) || item['catalogId'];
      if (cat) {
        group.catalogId = cat as string;
      }
    }

    if (item['updateComponents']) {
      group.updateComponents = item['updateComponents'] as Record<string, unknown>;
    }

    if (item['updateDataModel']) {
      group.updateDataModel = item['updateDataModel'] as Record<string, unknown>;
    }
  }

  return surfaceMap;
}

/**
 * Builds a strict array of A2UI v0.9 bridge commands for a given surface group.
 * Guarantees that each item contains strictly one command key (createSurface,
 * updateComponents, or updateDataModel).
 *
 * @param group The surface group containing extracted surface data.
 * @return Array of single-command items formatted for PreviewBridge.
 */
export function buildRenderPayload(group: A2uiSurfaceGroup): RenderA2uiItem[] {
  const payload: RenderA2uiItem[] = [];

  // 1. Construct CreateSurfaceCommand
  const rawCreate = group.createSurface?.['createSurface'] || group.createSurface;
  const surfaceId =
    (rawCreate as Record<string, unknown>)?.['surfaceId'] as string || group.surfaceId;
  const catalogId =
    (rawCreate as Record<string, unknown>)?.['catalogId'] as string ||
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

  // 2. Construct UpdateComponentsCommand
  if (group.updateComponents) {
    const rawComp =
      (group.updateComponents['updateComponents'] as Record<string, unknown>) ||
      group.updateComponents;
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

  // 3. Construct UpdateDataModelCommand
  if (group.updateDataModel) {
    const rawData =
      (group.updateDataModel['updateDataModel'] as Record<string, unknown>) ||
      group.updateDataModel;
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

  return payload;
}

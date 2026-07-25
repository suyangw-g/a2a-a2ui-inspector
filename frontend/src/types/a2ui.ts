/**
 * @fileoverview Type definitions for A2UI v0.9 protocol payloads and bridge messages.
 * Follows Google TypeScript Style Guide.
 */

export interface CreateSurfaceDetails {
  surfaceId: string;
  catalogId: string;
}

export interface CreateSurfaceCommand {
  version: 'v0.9';
  createSurface: CreateSurfaceDetails;
}

export interface UpdateComponentsDetails {
  surfaceId: string;
  components: unknown[];
}

export interface UpdateComponentsCommand {
  version: 'v0.9';
  updateComponents: UpdateComponentsDetails;
}

export interface UpdateDataModelDetails {
  surfaceId: string;
  data: Record<string, unknown>;
}

export interface UpdateDataModelCommand {
  version: 'v0.9';
  updateDataModel: UpdateDataModelDetails;
}

export interface DeleteSurfaceDetails {
  surfaceId: string;
}

export interface DeleteSurfaceCommand {
  version: 'v0.9';
  deleteSurface: DeleteSurfaceDetails;
}

export type RenderA2uiItem =
  | CreateSurfaceCommand
  | UpdateComponentsCommand
  | UpdateDataModelCommand
  | DeleteSurfaceCommand;

export interface A2uiSurfaceGroup {
  surfaceId: string;
  catalogId?: string;
  createSurface?: Record<string, unknown>;
  updateComponents?: Record<string, unknown>;
  updateDataModel?: Record<string, unknown>;
  deleteSurface?: Record<string, unknown>;
  allMessages: Record<string, unknown>[];
}

export interface RendererBridgeMessage {
  type: 'RENDERER_READY' | 'SEND_TO_SERVER' | 'RENDER_A2UI';
  payload?: unknown;
}

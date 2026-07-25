/**
 * @fileoverview Full-page chat mode toggle controller.
 * Follows Google TypeScript Style Guide.
 */

export const FULL_PAGE_CLASS = 'full-page-chat';

/**
 * Attaches event handler to the expand chat button to toggle full page mode.
 *
 * @param button Element reference for the expand chat button.
 * @param body Element reference for the document body (defaults to document.body).
 */
export function setupFullPageChatToggle(
  button: HTMLButtonElement | null,
  body: HTMLElement = document.body,
): void {
  if (!button) {
    return;
  }

  button.addEventListener('click', () => {
    body.classList.toggle(FULL_PAGE_CLASS);
    const isExpanded = body.classList.contains(FULL_PAGE_CLASS);
    button.textContent = isExpanded ? '🗗 Exit Fullscreen' : '⛶ Expand Chat';
  });
}

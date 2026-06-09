import { App, Component, MarkdownRenderer, TFile } from "obsidian";

export const PREVIEW_CHAR_LIMIT = 7000;

export function truncateForPreview(content: string): {
  text: string;
  truncated: boolean;
} {
  if (content.length <= PREVIEW_CHAR_LIMIT) {
    return { text: content, truncated: false };
  }
  return {
    text: content.slice(0, PREVIEW_CHAR_LIMIT) + "\n\n…",
    truncated: true,
  };
}

export async function renderMarkdownPreview(
  app: App,
  component: Component,
  container: HTMLElement,
  content: string,
  sourcePath: string
): Promise<{ truncated: boolean }> {
  container.empty();
  container.addClass("markdown-rendered");
  const { text, truncated } = truncateForPreview(content);
  await MarkdownRenderer.renderMarkdown(
    text,
    container,
    sourcePath,
    component
  );
  return { truncated };
}

export async function renderFilePreview(
  app: App,
  component: Component,
  container: HTMLElement,
  file: TFile
): Promise<{ truncated: boolean }> {
  const content = await app.vault.read(file);
  return renderMarkdownPreview(app, component, container, content, file.path);
}

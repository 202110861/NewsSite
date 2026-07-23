import type { BodyBlockInput } from "../types/news";
import { resolveMediaUrl } from "./media";
import { extractYoutubeId, isYoutubeUrl } from "./youtube";

export function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function blockSrc(block: Pick<BodyBlockInput, "mediaUrl" | "filePath">) {
  if (block.mediaUrl) return resolveMediaUrl(block.mediaUrl);
  if (block.filePath) {
    const path = block.filePath.startsWith("/uploads/")
      ? block.filePath
      : `/uploads/${block.filePath}`;
    return resolveMediaUrl(path);
  }
  return "";
}

export function blockToHtml(block: BodyBlockInput): string {
  if (block.type === "TEXT") {
    const text = block.text ?? "";
    if (!text.trim()) return "<p><br></p>";
    return `<p>${escapeHtml(text).replace(/\n/g, "<br>")}</p>`;
  }

  if (block.type === "IMAGE") {
    const src = blockSrc(block);
    return `<figure draggable="true" contenteditable="false" data-block-type="IMAGE" data-media-url="${block.mediaUrl ?? ""}" data-file-path="${block.filePath ?? ""}" data-caption="${escapeHtml(block.caption ?? "")}"><div class="overflow-hidden rounded-lg bg-ink-100"><img src="${src}" alt="${escapeHtml(block.caption ?? "")}" class="w-full object-cover" draggable="false" /></div></figure>`;
  }

  const src = blockSrc(block);
  if (isYoutubeUrl(block.mediaUrl ?? "") && block.mediaUrl) {
    const youtubeId = extractYoutubeId(block.mediaUrl) ?? "";
    return `<figure draggable="true" contenteditable="false" data-block-type="VIDEO" data-media-url="${block.mediaUrl}" data-file-path="" data-caption="${escapeHtml(block.caption ?? "")}"><div class="overflow-hidden rounded-lg bg-ink-100"><div class="aspect-video"><iframe src="https://www.youtube.com/embed/${youtubeId}" class="h-full w-full" allowfullscreen></iframe></div></div></figure>`;
  }

  return `<figure draggable="true" contenteditable="false" data-block-type="VIDEO" data-media-url="${block.mediaUrl ?? ""}" data-file-path="${block.filePath ?? ""}" data-caption="${escapeHtml(block.caption ?? "")}"><div class="overflow-hidden rounded-lg bg-ink-100"><video src="${src}" controls class="w-full" draggable="false"></video></div></figure>`;
}

export function blocksToHtml(blocks: BodyBlockInput[]): string {
  return blocks.map(blockToHtml).join("");
}

export function appendEditorParagraph(): string {
  return "<p><br></p>";
}

function extractTextFromElement(el: HTMLElement): string {
  return el.innerHTML
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00A0/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

/** <p><br></p> 같은 빈 문단은 병합 시 줄바꿈 마커로 취급 */
function normalizeParagraphText(text: string): string {
  return text.trim() === "" ? "" : text;
}

function pushFigureBlock(blocks: BodyBlockInput[], figure: HTMLElement) {
  const type = figure.dataset.blockType as "IMAGE" | "VIDEO";
  blocks.push({
    type,
    mediaUrl: figure.dataset.mediaUrl || undefined,
    filePath: figure.dataset.filePath || undefined,
    caption: figure.dataset.caption || undefined,
  });
}

function processChildNode(node: Node, blocks: BodyBlockInput[]) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? "";
    if (text.trim()) blocks.push({ type: "TEXT", text });
    return;
  }

  if (!(node instanceof HTMLElement)) return;

  if (node.tagName === "FIGURE" && node.dataset.blockType) {
    pushFigureBlock(blocks, node);
    return;
  }

  if (node.tagName === "P" || node.tagName === "DIV") {
    if (node.querySelector("figure[data-block-type]")) {
      node.childNodes.forEach((child) => processChildNode(child, blocks));
      return;
    }

    blocks.push({
      type: "TEXT",
      text: normalizeParagraphText(extractTextFromElement(node)),
    });
  }
}

function mergeAdjacentTextBlocks(blocks: BodyBlockInput[]): BodyBlockInput[] {
  const merged: BodyBlockInput[] = [];

  for (const block of blocks) {
    const prev = merged[merged.length - 1];
    if (block.type === "TEXT" && prev?.type === "TEXT") {
      prev.text = `${prev.text ?? ""}\n${block.text ?? ""}`;
      continue;
    }
    merged.push({ ...block });
  }

  return merged;
}

export function htmlToBlocks(container: HTMLElement): BodyBlockInput[] {
  const blocks: BodyBlockInput[] = [];
  container.childNodes.forEach((node) => processChildNode(node, blocks));
  const merged = mergeAdjacentTextBlocks(blocks);

  if (merged.length === 0) return [{ type: "TEXT", text: "" }];

  if (
    merged.length === 1 &&
    merged[0].type === "TEXT" &&
    (merged[0].text ?? "").trim() === ""
  ) {
    return [{ type: "TEXT", text: "" }];
  }

  return merged;
}

export function saveEditorSelection(editor: HTMLElement): Range | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) return null;

  return range.cloneRange();
}

export function restoreEditorSelection(range: Range | null) {
  if (!range) return;

  const selection = window.getSelection();
  if (!selection) return;

  selection.removeAllRanges();
  selection.addRange(range);
}

function normalizeInsertionRange(editor: HTMLElement, range: Range): Range {
  let node: Node | null = range.startContainer;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }

  let el = node instanceof HTMLElement ? node : null;
  while (el && el !== editor) {
    if (el.tagName === "P") {
      const normalized = document.createRange();
      normalized.setStartAfter(el);
      normalized.collapse(true);
      return normalized;
    }
    el = el.parentElement;
  }

  return range;
}

export function insertHtmlInEditor(
  editor: HTMLElement,
  html: string,
  savedRange?: Range | null,
) {
  editor.focus();

  const selection = window.getSelection();
  if (!selection) return;

  let range = savedRange?.cloneRange() ?? null;
  if (range && !editor.contains(range.commonAncestorContainer)) {
    range = null;
  }

  if (!range && selection.rangeCount > 0) {
    range = selection.getRangeAt(0).cloneRange();
    if (!editor.contains(range.commonAncestorContainer)) {
      range = null;
    }
  }

  if (!range) {
    range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
  }

  range = normalizeInsertionRange(editor, range);
  range.deleteContents();

  const template = document.createElement("template");
  template.innerHTML = html;
  const nodes = Array.from(template.content.childNodes);
  let lastInserted: Node | null = null;

  for (const node of nodes) {
    range.insertNode(node);
    lastInserted = node;
    range.setStartAfter(node);
    range.collapse(true);
  }

  if (!lastInserted) return;

  const cursor = document.createRange();
  const trailingParagraph =
    lastInserted instanceof HTMLElement && lastInserted.tagName === "P"
      ? lastInserted
      : lastInserted.nextSibling instanceof HTMLElement &&
          lastInserted.nextSibling.tagName === "P"
        ? lastInserted.nextSibling
        : null;

  if (trailingParagraph) {
    cursor.selectNodeContents(trailingParagraph);
    cursor.collapse(true);
  } else {
    cursor.setStartAfter(lastInserted);
    cursor.collapse(true);
  }

  selection.removeAllRanges();
  selection.addRange(cursor);
}

export function getFigureFromEventTarget(
  target: EventTarget | null,
): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const figure = target.closest("figure[data-block-type]");
  return figure instanceof HTMLElement ? figure : null;
}

export function figureToBlock(figure: HTMLElement): BodyBlockInput | null {
  const type = figure.dataset.blockType;
  if (type !== "IMAGE" && type !== "VIDEO") return null;
  return {
    type,
    mediaUrl: figure.dataset.mediaUrl || undefined,
    filePath: figure.dataset.filePath || undefined,
    caption: figure.dataset.caption || undefined,
  };
}

export function caretRangeFromPoint(x: number, y: number): Range | null {
  const doc = document as Document & {
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
    caretPositionFromPoint?: (
      x: number,
      y: number,
    ) => { offsetNode: Node; offset: number } | null;
  };

  if (typeof doc.caretRangeFromPoint === "function") {
    return doc.caretRangeFromPoint(x, y);
  }

  const pos = doc.caretPositionFromPoint?.(x, y);
  if (!pos) return null;

  const range = document.createRange();
  range.setStart(pos.offsetNode, pos.offset);
  range.collapse(true);
  return range;
}

function resolveDropRange(
  editor: HTMLElement,
  figure: HTMLElement,
  clientX: number,
  clientY: number,
): Range {
  let range = caretRangeFromPoint(clientX, clientY);

  if (range && figure.contains(range.commonAncestorContainer)) {
    range = null;
  }

  if (range && !editor.contains(range.commonAncestorContainer)) {
    range = null;
  }

  if (range) return range;

  const fallback = document.createRange();
  const rect = figure.getBoundingClientRect();
  const dropBefore = clientY < rect.top + rect.height / 2;
  const prev = figure.previousSibling;
  const next = figure.nextSibling;

  if (dropBefore && prev) {
    fallback.setStartAfter(prev);
  } else if (!dropBefore && next) {
    fallback.setStartBefore(next);
  } else if (dropBefore && next) {
    fallback.setStartBefore(next);
  } else if (prev) {
    fallback.setStartAfter(prev);
  } else {
    fallback.selectNodeContents(editor);
    fallback.collapse(dropBefore);
    return fallback;
  }

  fallback.collapse(true);
  return fallback;
}

/** 드래그한 figure를 drop 위치로 이동(원본 제거 + 올바른 HTML 재삽입) */
export function moveFigureToDropPoint(
  editor: HTMLElement,
  figure: HTMLElement,
  clientX: number,
  clientY: number,
): boolean {
  const block = figureToBlock(figure);
  if (!block || !editor.contains(figure)) return false;

  const dropRange = resolveDropRange(editor, figure, clientX, clientY);
  const prev = figure.previousSibling;
  const next = figure.nextSibling;
  figure.remove();

  let range = dropRange;
  try {
    void range.commonAncestorContainer;
    if (!editor.contains(range.commonAncestorContainer)) {
      throw new Error("range outside editor");
    }
  } catch {
    range = document.createRange();
    if (prev && editor.contains(prev)) {
      range.setStartAfter(prev);
    } else if (next && editor.contains(next)) {
      range.setStartBefore(next);
    } else {
      range.selectNodeContents(editor);
      range.collapse(false);
    }
    range.collapse(true);
  }

  insertHtmlInEditor(
    editor,
    blockToHtml(block) + appendEditorParagraph(),
    range,
  );
  return true;
}

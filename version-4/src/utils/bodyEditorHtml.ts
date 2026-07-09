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
    return `<figure contenteditable="false" data-block-type="IMAGE" data-media-url="${block.mediaUrl ?? ""}" data-file-path="${block.filePath ?? ""}" data-caption="${escapeHtml(block.caption ?? "")}"><div class="overflow-hidden rounded-lg bg-ink-100"><img src="${src}" alt="${escapeHtml(block.caption ?? "")}" class="w-full object-cover" /></div></figure>`;
  }

  const src = blockSrc(block);
  if (isYoutubeUrl(block.mediaUrl ?? "") && block.mediaUrl) {
    const youtubeId = extractYoutubeId(block.mediaUrl) ?? "";
    return `<figure contenteditable="false" data-block-type="VIDEO" data-media-url="${block.mediaUrl}" data-file-path="" data-caption="${escapeHtml(block.caption ?? "")}"><div class="overflow-hidden rounded-lg bg-ink-100"><div class="aspect-video"><iframe src="https://www.youtube.com/embed/${youtubeId}" class="h-full w-full" allowfullscreen></iframe></div></div></figure>`;
  }

  return `<figure contenteditable="false" data-block-type="VIDEO" data-media-url="${block.mediaUrl ?? ""}" data-file-path="${block.filePath ?? ""}" data-caption="${escapeHtml(block.caption ?? "")}"><div class="overflow-hidden rounded-lg bg-ink-100"><video src="${src}" controls class="w-full"></video></div></figure>`;
}

export function blocksToHtml(blocks: BodyBlockInput[]): string {
  return blocks.map(blockToHtml).join("");
}

export function appendEditorParagraph(): string {
  return "<p><br></p>";
}

export function htmlToBlocks(container: HTMLElement): BodyBlockInput[] {
  const blocks: BodyBlockInput[] = [];

  container.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (text.trim()) blocks.push({ type: "TEXT", text });
      return;
    }

    if (!(node instanceof HTMLElement)) return;

    if (node.tagName === "FIGURE" && node.dataset.blockType) {
      const type = node.dataset.blockType as "IMAGE" | "VIDEO";
      blocks.push({
        type,
        mediaUrl: node.dataset.mediaUrl || undefined,
        filePath: node.dataset.filePath || undefined,
        caption: node.dataset.caption || undefined,
      });
      return;
    }

    if (node.tagName === "P" || node.tagName === "DIV") {
      const text = node.innerHTML
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"');
      if (text.trim()) blocks.push({ type: "TEXT", text });
    }
  });

  return blocks.length > 0 ? blocks : [{ type: "TEXT", text: "" }];
}

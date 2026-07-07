import { useEffect, useRef } from "react";
import type { BodyBlockInput } from "../../types/news";
import { uploadMedia } from "../../lib/admin";
import { resolveMediaUrl } from "../../utils/media";

interface Props {
  value: BodyBlockInput[];
  onChange: (blocks: BodyBlockInput[]) => void;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function blockSrc(block: Pick<BodyBlockInput, "mediaUrl" | "filePath">) {
  if (block.mediaUrl) return resolveMediaUrl(block.mediaUrl);
  if (block.filePath) {
    const path = block.filePath.startsWith("/uploads/")
      ? block.filePath
      : `/uploads/${block.filePath}`;
    return resolveMediaUrl(path);
  }
  return "";
}

export function blocksToHtml(blocks: BodyBlockInput[]): string {
  return blocks
    .map((block) => {
      if (block.type === "TEXT") {
        const text = block.text ?? "";
        if (!text.trim()) return "<p><br></p>";
        return `<p>${escapeHtml(text).replace(/\n/g, "<br>")}</p>`;
      }
      if (block.type === "IMAGE") {
        const src = blockSrc(block);
        return `<figure contenteditable="false" data-block-type="IMAGE" data-media-url="${block.mediaUrl ?? ""}" data-file-path="${block.filePath ?? ""}" data-caption="${escapeHtml(block.caption ?? "")}"><img src="${src}" alt="${escapeHtml(block.caption ?? "")}" class="max-w-full rounded-lg" /></figure>`;
      }
      const src = blockSrc(block);
      const isYoutube = /youtu\.be|youtube\.com/.test(block.mediaUrl ?? "");
      if (isYoutube && block.mediaUrl) {
        return `<figure contenteditable="false" data-block-type="VIDEO" data-media-url="${block.mediaUrl}" data-file-path="" data-caption="${escapeHtml(block.caption ?? "")}"><div class="rounded-lg bg-ink-100 px-3 py-2 text-sm text-ink-600">동영상 URL: ${escapeHtml(block.mediaUrl)}</div></figure>`;
      }
      return `<figure contenteditable="false" data-block-type="VIDEO" data-media-url="${block.mediaUrl ?? ""}" data-file-path="${block.filePath ?? ""}" data-caption="${escapeHtml(block.caption ?? "")}"><video src="${src}" controls class="max-w-full rounded-lg"></video></figure>`;
    })
    .join("");
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

export default function RichBodyEditor({ value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const skipRender = useRef(false);

  useEffect(() => {
    if (!editorRef.current || skipRender.current) return;
    editorRef.current.innerHTML = blocksToHtml(
      value.length > 0 ? value : [{ type: "TEXT", text: "" }],
    );
  }, [value]);

  function serialize() {
    if (!editorRef.current) return;
    skipRender.current = true;
    const blocks = htmlToBlocks(editorRef.current);
    onChange(blocks);
    requestAnimationFrame(() => {
      skipRender.current = false;
    });
  }

  async function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) return;
        const uploaded = await uploadMedia(file);
        document.execCommand(
          "insertHTML",
          false,
          `<figure contenteditable="false" data-block-type="IMAGE" data-media-url="" data-file-path="${uploaded.filePath}" data-caption=""><img src="${resolveMediaUrl(uploaded.url)}" alt="" class="max-w-full rounded-lg" /></figure><p><br></p>`,
        );
        serialize();
        return;
      }
    }
  }

  function insertMediaBlock(type: "IMAGE" | "VIDEO", source: "url" | "file") {
    if (source === "url") {
      const url = window.prompt(
        type === "IMAGE"
          ? "이미지 URL을 입력하세요"
          : "동영상 URL을 입력하세요",
      );
      if (!url?.trim()) return;
      const caption = window.prompt("캡션 (선택)") ?? "";
      const html =
        type === "IMAGE"
          ? `<figure contenteditable="false" data-block-type="IMAGE" data-media-url="${url}" data-file-path="" data-caption="${escapeHtml(caption)}"><img src="${resolveMediaUrl(url)}" alt="${escapeHtml(caption)}" class="max-w-full rounded-lg" /></figure><p><br></p>`
          : `<figure contenteditable="false" data-block-type="VIDEO" data-media-url="${url}" data-file-path="" data-caption="${escapeHtml(caption)}"><div class="rounded-lg bg-ink-100 px-3 py-2 text-sm text-ink-600">동영상 URL: ${escapeHtml(url)}</div></figure><p><br></p>`;
      document.execCommand("insertHTML", false, html);
      serialize();
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "IMAGE" ? "image/*" : "video/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const uploaded = await uploadMedia(file);
      const html =
        type === "IMAGE"
          ? `<figure contenteditable="false" data-block-type="IMAGE" data-media-url="" data-file-path="${uploaded.filePath}" data-caption=""><img src="${resolveMediaUrl(uploaded.url)}" alt="" class="max-w-full rounded-lg" /></figure><p><br></p>`
          : `<figure contenteditable="false" data-block-type="VIDEO" data-media-url="" data-file-path="${uploaded.filePath}" data-caption=""><video src="${resolveMediaUrl(uploaded.url)}" controls class="max-w-full rounded-lg"></video></figure><p><br></p>`;
      editorRef.current?.focus();
      document.execCommand("insertHTML", false, html);
      serialize();
    };
    input.click();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => insertMediaBlock("IMAGE", "url")}
          className="rounded border border-ink-900/15 px-2.5 py-1 text-xs font-semibold text-ink-700 hover:bg-paper-100"
        >
          이미지 URL
        </button>
        <button
          type="button"
          onClick={() => insertMediaBlock("IMAGE", "file")}
          className="rounded border border-ink-900/15 px-2.5 py-1 text-xs font-semibold text-ink-700 hover:bg-paper-100"
        >
          이미지 파일
        </button>
        <button
          type="button"
          onClick={() => insertMediaBlock("VIDEO", "url")}
          className="rounded border border-ink-900/15 px-2.5 py-1 text-xs font-semibold text-ink-700 hover:bg-paper-100"
        >
          동영상 URL
        </button>
        <button
          type="button"
          onClick={() => insertMediaBlock("VIDEO", "file")}
          className="rounded border border-ink-900/15 px-2.5 py-1 text-xs font-semibold text-ink-700 hover:bg-paper-100"
        >
          동영상 파일
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={serialize}
        onBlur={serialize}
        onPaste={handlePaste}
        className="min-h-[320px] w-full rounded-lg border border-ink-900/15 bg-white px-4 py-3 text-sm leading-relaxed text-ink-800 outline-none focus:border-flash-600 [&_figure]:my-4 [&_p]:min-h-[1.5em]"
        data-placeholder="본문을 입력하세요. Enter로 줄바꿈, 이미지는 붙여넣기 또는 버튼으로 삽입할 수 있습니다."
      />
      <p className="text-xs text-ink-500">
        텍스트는 한 입력창에서 작성되며, 줄바꿈(\n)이 그대로 반영됩니다.
        이미지·동영상은 원하는 위치에 삽입할 수 있습니다.
      </p>
    </div>
  );
}

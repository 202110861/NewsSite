import { useEffect, useRef } from "react";
import { uploadMedia } from "../../lib/admin";
import type { EditableBlock } from "../../utils/articleBlocks";
import { stripBlockKeys, withBlockKeys } from "../../utils/articleBlocks";
import { getApiErrorMessage } from "../../lib/errors";
import {
  appendEditorParagraph,
  blockToHtml,
  blocksToHtml,
  getFigureFromEventTarget,
  htmlToBlocks,
  insertHtmlInEditor,
  moveFigureToDropPoint,
  saveEditorSelection,
} from "../../utils/bodyEditorHtml";

interface Props {
  blocks: EditableBlock[];
  onChange: (blocks: EditableBlock[]) => void;
  subtitle?: string;
  onSubtitleChange?: (subtitle: string) => void;
}

function findAdjacentFigure(
  editor: HTMLElement,
  direction: "before" | "after",
): HTMLElement | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!range.collapsed) return null;

  const { startContainer, startOffset } = range;
  let node: Node | null = startContainer;

  if (node.nodeType === Node.TEXT_NODE) {
    if (direction === "before" && startOffset === 0) {
      node = node.previousSibling;
    } else if (
      direction === "after" &&
      startOffset === (node.textContent?.length ?? 0)
    ) {
      node = node.nextSibling;
    } else {
      return null;
    }
  } else if (node instanceof HTMLElement) {
    node =
      direction === "before"
        ? (node.childNodes[startOffset - 1] ?? null)
        : (node.childNodes[startOffset] ?? null);
  }

  if (
    node instanceof HTMLElement &&
    node.tagName === "FIGURE" &&
    node.dataset.blockType
  ) {
    return node;
  }

  if (
    node instanceof HTMLElement &&
    (node.tagName === "P" || node.tagName === "DIV")
  ) {
    const sibling =
      direction === "before"
        ? node.previousElementSibling
        : node.nextElementSibling;
    if (
      sibling instanceof HTMLElement &&
      sibling.tagName === "FIGURE" &&
      sibling.dataset.blockType
    ) {
      return sibling;
    }
  }

  if (startContainer instanceof HTMLElement && startContainer === editor) {
    const child =
      direction === "before"
        ? startContainer.childNodes[startOffset - 1]
        : startContainer.childNodes[startOffset];
    if (
      child instanceof HTMLElement &&
      child.tagName === "FIGURE" &&
      child.dataset.blockType
    ) {
      return child;
    }
  }

  return null;
}

export default function ArticleInlineEditBody({
  blocks,
  onChange,
  subtitle = "",
  onSubtitleChange,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const skipRender = useRef(false);
  const lastSelectionRef = useRef<Range | null>(null);
  const draggingFigureRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!editorRef.current || skipRender.current) return;
    const plainBlocks = stripBlockKeys(blocks);
    editorRef.current.innerHTML = blocksToHtml(
      plainBlocks.length > 0 ? plainBlocks : [{ type: "TEXT", text: "" }],
    );
  }, [blocks]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    function trackSelection() {
      const saved = saveEditorSelection(editor!);
      if (saved) {
        lastSelectionRef.current = saved;
      }
    }

    document.addEventListener("selectionchange", trackSelection);
    return () => document.removeEventListener("selectionchange", trackSelection);
  }, []);

  function serialize() {
    if (!editorRef.current) return;
    skipRender.current = true;
    const next = withBlockKeys(htmlToBlocks(editorRef.current));
    onChange(next);
    requestAnimationFrame(() => {
      skipRender.current = false;
    });
  }

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    const figure = getFigureFromEventTarget(e.target);
    if (!figure || !editorRef.current?.contains(figure)) return;
    draggingFigureRef.current = figure;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "figure-move");
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (!draggingFigureRef.current) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    const figure = draggingFigureRef.current;
    const editor = editorRef.current;
    draggingFigureRef.current = null;
    if (!figure || !editor) return;

    e.preventDefault();
    e.stopPropagation();

    if (moveFigureToDropPoint(editor, figure, e.clientX, e.clientY)) {
      serialize();
    }
  }

  function handleDragEnd() {
    draggingFigureRef.current = null;
  }

  async function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (!item.type.startsWith("image/")) continue;

      const editor = editorRef.current;
      if (!editor) return;

      const savedRange = saveEditorSelection(editor);
      e.preventDefault();

      const file = item.getAsFile();
      if (!file) return;

      try {
        const uploaded = await uploadMedia(file);
        insertHtmlInEditor(
          editor,
          blockToHtml({
            type: "IMAGE",
            filePath: uploaded.filePath,
          }) + appendEditorParagraph(),
          savedRange,
        );
        serialize();
      } catch (err) {
        console.error(getApiErrorMessage(err, "이미지 업로드에 실패했습니다."));
      }
      return;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Backspace" && e.key !== "Delete") return;
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    if (!range.collapsed) {
      const selectedFigures = editor.querySelectorAll("figure[data-block-type]");
      for (const figure of Array.from(selectedFigures)) {
        if (selection.containsNode(figure, true)) {
          e.preventDefault();
          figure.remove();
          serialize();
          return;
        }
      }
      return;
    }

    const direction = e.key === "Backspace" ? "before" : "after";
    const figure = findAdjacentFigure(editor, direction);
    if (!figure) return;

    e.preventDefault();
    figure.remove();
    serialize();
  }

  return (
    <div className="mt-7 space-y-4">
      {onSubtitleChange && (
        <input
          type="text"
          value={subtitle}
          onChange={(e) => onSubtitleChange(e.target.value)}
          placeholder="부제를 입력하세요 (선택)"
          className="w-full border-0 bg-transparent p-0 text-lg font-bold text-ink-900 outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-flash-600/20"
        />
      )}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={serialize}
        onBlur={serialize}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
        className="min-h-[200px] w-full text-base leading-[1.85] text-ink-800 outline-none focus:ring-2 focus:ring-flash-600/20 [&_figure]:my-4 [&_figure]:cursor-grab [&_figure]:active:cursor-grabbing [&_p]:min-h-[1.5em] [&_p]:whitespace-pre-line"
        data-placeholder="본문을 입력하세요. 이미지는 붙여넣기(Ctrl+V)로 추가할 수 있습니다."
      />
    </div>
  );
}

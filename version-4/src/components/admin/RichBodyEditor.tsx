import { useEffect, useRef, useState } from "react";

import type { BodyBlockInput } from "../../types/news";

import { getApiErrorMessage } from "../../lib/errors";

import { uploadMedia } from "../../lib/admin";

import {

  appendEditorParagraph,

  blockToHtml,

  blocksToHtml,

  htmlToBlocks,

  insertHtmlInEditor,

  saveEditorSelection,

} from "../../utils/bodyEditorHtml";



interface Props {

  value: BodyBlockInput[];

  onChange: (blocks: BodyBlockInput[]) => void;

}



export default function RichBodyEditor({ value, onChange }: Props) {

  const editorRef = useRef<HTMLDivElement>(null);

  const skipRender = useRef(false);

  const lastSelectionRef = useRef<Range | null>(null);

  const [uploadError, setUploadError] = useState("");



  useEffect(() => {

    if (!editorRef.current || skipRender.current) return;

    editorRef.current.innerHTML = blocksToHtml(

      value.length > 0 ? value : [{ type: "TEXT", text: "" }],

    );

  }, [value]);



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

    const blocks = htmlToBlocks(editorRef.current);

    onChange(blocks);

    requestAnimationFrame(() => {

      skipRender.current = false;

    });

  }



  function insertMediaHtml(html: string, savedRange?: Range | null) {

    const editor = editorRef.current;

    if (!editor) return;

    insertHtmlInEditor(editor, html, savedRange ?? lastSelectionRef.current);

    serialize();

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



      setUploadError("");

      try {

        const uploaded = await uploadMedia(file);

        insertMediaHtml(

          blockToHtml({

            type: "IMAGE",

            filePath: uploaded.filePath,

          }) + appendEditorParagraph(),

          savedRange,

        );

      } catch (err) {

        setUploadError(getApiErrorMessage(err, "이미지 업로드에 실패했습니다."));

      }

      return;

    }

  }



  function insertMediaBlock(type: "IMAGE" | "VIDEO", source: "url" | "file") {

    const savedRange = lastSelectionRef.current;



    if (source === "url") {

      const url = window.prompt(

        type === "IMAGE"

          ? "이미지 URL을 입력하세요"

          : "동영상 URL을 입력하세요",

      );

      if (!url?.trim()) return;



      const caption = window.prompt("캡션 (선택)") ?? "";

      insertMediaHtml(

        blockToHtml({

          type,

          mediaUrl: url.trim(),

          caption: caption || undefined,

        }) + appendEditorParagraph(),

        savedRange,

      );

      return;

    }



    const input = document.createElement("input");

    input.type = "file";

    input.accept = type === "IMAGE" ? "image/*" : "video/*";

    input.onchange = async () => {

      const file = input.files?.[0];

      if (!file) return;



      setUploadError("");

      try {

        const uploaded = await uploadMedia(file);

        insertMediaHtml(

          blockToHtml({

            type,

            filePath: uploaded.filePath,

          }) + appendEditorParagraph(),

          savedRange,

        );

      } catch (err) {

        setUploadError(

          getApiErrorMessage(err, "미디어 업로드에 실패했습니다."),

        );

      }

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

        className="min-h-[320px] w-full rounded-lg border border-ink-900/15 bg-white px-4 py-3 text-sm leading-relaxed text-ink-800 outline-none focus:border-flash-600 [&_figure]:my-4 [&_p]:min-h-[1.5em] [&_p]:whitespace-pre-line"

        data-placeholder="본문을 입력하세요. Enter로 줄바꿈, 이미지는 붙여넣기 또는 버튼으로 삽입할 수 있습니다."

      />

      {uploadError && <p className="text-xs text-flash-600">{uploadError}</p>}

      <p className="text-xs text-ink-500">

        텍스트는 한 입력창에서 작성되며, 줄바꿈(\n)이 그대로 반영됩니다.

        이미지·동영상은 원하는 위치에 삽입할 수 있습니다.

      </p>

    </div>

  );

}



"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Braces,
  Brush,
  Highlighter,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Table2,
  Trash2,
  UnderlineIcon,
  Undo2,
} from "lucide-react";

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;

type HeadingLevel = (typeof HEADING_LEVELS)[number];

type ToolButtonProps = {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
};

function sanitizePastedHtml(html: string) {
  if (typeof window === "undefined" || !html.trim()) return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, iframe, object, embed, link, meta").forEach((node) => node.remove());

  doc.body.querySelectorAll<HTMLElement>("*").forEach((node) => {
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim();

      if (name.startsWith("on")) node.removeAttribute(attr.name);
      if ((name === "href" || name === "src") && /^javascript:/i.test(value)) node.removeAttribute(attr.name);
    });

    const allowedStyles = [
      "color",
      "background-color",
      "font-weight",
      "font-style",
      "text-decoration",
      "text-align",
    ];
    const nextStyles = allowedStyles
      .map((property) => {
        const value = node.style.getPropertyValue(property);
        return value ? `${property}: ${value}` : "";
      })
      .filter(Boolean)
      .join("; ");

    if (nextStyles) node.setAttribute("style", nextStyles);
    else node.removeAttribute("style");
  });

  return doc.body.innerHTML;
}

function ToolButton({ label, onClick, active, disabled, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-md border text-neutral-700 transition",
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-transparent bg-white hover:border-neutral-200 hover:bg-neutral-50",
        "disabled:pointer-events-none disabled:opacity-40",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-6 w-px bg-neutral-200" aria-hidden="true" />;
}

function currentBlock(editor: Editor) {
  const headingLevel = HEADING_LEVELS.find((level) => editor.isActive("heading", { level }));
  if (headingLevel) return `h${headingLevel}`;
  if (editor.isActive("blockquote")) return "quote";
  if (editor.isActive("codeBlock")) return "codeBlock";
  return "paragraph";
}

function getToolbarState(editor: Editor) {
  return {
    block: currentBlock(editor),
    bold: editor.isActive("bold"),
    italic: editor.isActive("italic"),
    underline: editor.isActive("underline"),
    strike: editor.isActive("strike"),
    code: editor.isActive("code"),
    link: editor.isActive("link"),
    bulletList: editor.isActive("bulletList"),
    orderedList: editor.isActive("orderedList"),
    alignLeft: editor.isActive({ textAlign: "left" }),
    alignCenter: editor.isActive({ textAlign: "center" }),
    alignRight: editor.isActive({ textAlign: "right" }),
    blockquote: editor.isActive("blockquote"),
    highlight: editor.isActive("highlight"),
    canAddRow: editor.can().addRowAfter(),
    canDeleteTable: editor.can().deleteTable(),
    canUndo: editor.can().undo(),
    canRedo: editor.can().redo(),
  };
}

function normalizeLinkUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function RichEditor({
  value,
  onChange,
  minHeight = 220,
}: {
  value: string;
  onChange: (next: string) => void;
  minHeight?: number;
}) {
  const linkInputRef = useRef<HTMLInputElement | null>(null);
  const bubbleLinkInputRef = useRef<HTMLInputElement | null>(null);
  const [linkPanelOpen, setLinkPanelOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [bubbleLinkOpen, setBubbleLinkOpen] = useState(false);
  const [bubbleLinkUrl, setBubbleLinkUrl] = useState("");
  const [bubblePosition, setBubblePosition] = useState<{ left: number; top: number } | null>(null);

  const openLinkPanel = useCallback((targetEditor: Editor, href?: string) => {
    targetEditor.chain().focus().extendMarkRange("link").run();

    const current = href ?? (targetEditor.getAttributes("link").href as string | undefined);
    setLinkUrl(current || "https://");
    setLinkPanelOpen(true);
  }, []);

  const openBubbleLinkPanel = useCallback((targetEditor: Editor, href?: string) => {
    targetEditor.chain().focus().extendMarkRange("link").run();

    const current = href ?? (targetEditor.getAttributes("link").href as string | undefined);
    setBubbleLinkUrl(current || "https://");
    setBubbleLinkOpen(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [...HEADING_LEVELS],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: `min-height:${minHeight}px`,
      },
      transformPastedHTML: sanitizePastedHtml,
      handleClick: (view, pos, event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return false;

        const anchor = target.closest("a");
        if (!anchor) return false;

        event.preventDefault();
        editor?.commands.setTextSelection(pos);
        if (editor) openBubbleLinkPanel(editor, anchor.getAttribute("href") || "");
        view.focus();
        return true;
      },
    },
  });

  const toolbarState = useEditorState({
    editor,
    selector: ({ editor }) => (editor ? getToolbarState(editor) : null),
  });

  const updateBubblePosition = useCallback(() => {
    if (!editor || editor.state.selection.empty) {
      if (!bubbleLinkOpen) setBubblePosition(null);
      return;
    }

    const selection = window.getSelection();
    if (!selection?.rangeCount) {
      if (!bubbleLinkOpen) setBubblePosition(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const anchorNode = selection.anchorNode;
    if (!anchorNode || !editor.view.dom.contains(anchorNode)) {
      if (!bubbleLinkOpen) setBubblePosition(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) {
      if (!bubbleLinkOpen) setBubblePosition(null);
      return;
    }

    const width = bubbleLinkOpen ? 520 : 300;
    const left = Math.min(Math.max(rect.left + rect.width / 2, width / 2 + 12), window.innerWidth - width / 2 - 12);
    const top = Math.max(rect.top - 12, 72);
    setBubblePosition({ left, top });
  }, [bubbleLinkOpen, editor]);

  useEffect(() => {
    if (!editor || editor.isFocused) return;

    const html = editor.getHTML();
    if ((value || "") !== html) {
      editor.commands.setContent(value || "");
    }
  }, [editor, value]);

  useEffect(() => {
    if (!linkPanelOpen) return;
    const frame = window.requestAnimationFrame(() => linkInputRef.current?.focus());

    return () => window.cancelAnimationFrame(frame);
  }, [linkPanelOpen]);

  useEffect(() => {
    if (!bubbleLinkOpen) return;
    const frame = window.requestAnimationFrame(() => bubbleLinkInputRef.current?.focus());

    return () => window.cancelAnimationFrame(frame);
  }, [bubbleLinkOpen]);

  useEffect(() => {
    if (!editor) return;

    const update = () => window.requestAnimationFrame(updateBubblePosition);
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    window.addEventListener("mouseup", update);
    window.addEventListener("keyup", update);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
      window.removeEventListener("mouseup", update);
      window.removeEventListener("keyup", update);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [editor, updateBubblePosition]);

  if (!editor) {
    return <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm">Loading editor...</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-1 border-b border-neutral-200 bg-neutral-50/70 px-3 py-2">
        <select
          aria-label="Text style"
          value={toolbarState?.block ?? "paragraph"}
          onChange={(event) => {
            const next = event.target.value;

            if (next === "paragraph") editor.chain().focus().setParagraph().run();
            else if (next === "quote") editor.chain().focus().toggleBlockquote().run();
            else if (next === "codeBlock") editor.chain().focus().toggleCodeBlock().run();
            else editor.chain().focus().toggleHeading({ level: Number(next.replace("h", "")) as HeadingLevel }).run();
          }}
          className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800 outline-none transition hover:bg-neutral-50 focus:border-neutral-400"
        >
          <option value="paragraph">Normal</option>
          {HEADING_LEVELS.map((level) => (
            <option key={level} value={`h${level}`}>
              Heading {level}
            </option>
          ))}
          <option value="quote">Quote</option>
          <option value="codeBlock">Code block</option>
        </select>

        <Divider />

        <ToolButton label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={toolbarState?.bold}>
          <Bold size={17} />
        </ToolButton>
        <ToolButton label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={toolbarState?.italic}>
          <Italic size={17} />
        </ToolButton>
        <ToolButton
          label="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={toolbarState?.underline}
        >
          <UnderlineIcon size={17} />
        </ToolButton>
        <ToolButton label="Strike" onClick={() => editor.chain().focus().toggleStrike().run()} active={toolbarState?.strike}>
          <Strikethrough size={17} />
        </ToolButton>
        <ToolButton label="Inline code" onClick={() => editor.chain().focus().toggleCode().run()} active={toolbarState?.code}>
          <Braces size={17} />
        </ToolButton>
        <ToolButton label="Link" onClick={() => openLinkPanel(editor)} active={toolbarState?.link}>
          <LinkIcon size={17} />
        </ToolButton>

        <Divider />

        <ToolButton
          label="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={toolbarState?.bulletList}
        >
          <List size={18} />
        </ToolButton>
        <ToolButton
          label="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={toolbarState?.orderedList}
        >
          <ListOrdered size={18} />
        </ToolButton>

        <Divider />

        <ToolButton
          label="Align left"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={toolbarState?.alignLeft}
        >
          <AlignLeft size={18} />
        </ToolButton>
        <ToolButton
          label="Align center"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={toolbarState?.alignCenter}
        >
          <AlignCenter size={18} />
        </ToolButton>
        <ToolButton
          label="Align right"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={toolbarState?.alignRight}
        >
          <AlignRight size={18} />
        </ToolButton>

        <Divider />

        <ToolButton
          label="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={toolbarState?.blockquote}
        >
          <Quote size={17} />
        </ToolButton>
        <ToolButton label="Horizontal line" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={18} />
        </ToolButton>
        <ToolButton
          label="Highlight"
          onClick={() => editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run()}
          active={toolbarState?.highlight}
        >
          <Highlighter size={17} />
        </ToolButton>
        <ToolButton label="Clear highlight" onClick={() => editor.chain().focus().unsetHighlight().run()}>
          <Brush size={17} />
        </ToolButton>

        <Divider />

        <ToolButton
          label="Insert table"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          <Table2 size={17} />
        </ToolButton>
        <ToolButton
          label="Add table row"
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!toolbarState?.canAddRow}
        >
          <Pilcrow size={17} />
        </ToolButton>
        <ToolButton
          label="Delete table"
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!toolbarState?.canDeleteTable}
        >
          <Trash2 size={17} />
        </ToolButton>

        <Divider />

        <ToolButton label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!toolbarState?.canUndo}>
          <Undo2 size={17} />
        </ToolButton>
        <ToolButton label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!toolbarState?.canRedo}>
          <Redo2 size={17} />
        </ToolButton>
        <ToolButton label="Clear formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          <RemoveFormatting size={17} />
        </ToolButton>
      </div>

      {linkPanelOpen ? (
        <form
          className="flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-white px-3 py-3"
          onSubmit={(event) => {
            event.preventDefault();

            const href = normalizeLinkUrl(linkUrl);
            if (!href) editor.chain().focus().extendMarkRange("link").unsetLink().run();
            else editor.chain().focus().extendMarkRange("link").setLink({ href }).run();

            setLinkPanelOpen(false);
          }}
        >
          <label className="text-xs font-semibold text-neutral-600" htmlFor="rich-editor-link-url">
            Link
          </label>
          <input
            ref={linkInputRef}
            id="rich-editor-link-url"
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            placeholder="https://example.com"
            className="min-w-0 flex-1 rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
          />
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              setLinkPanelOpen(false);
            }}
            disabled={!toolbarState?.link}
            className="rounded-md border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-40"
          >
            Remove
          </button>
          <button
            type="button"
            onClick={() => setLinkPanelOpen(false)}
            className="rounded-md border border-transparent px-3 py-2 text-sm font-semibold text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-800"
          >
            Cancel
          </button>
        </form>
      ) : null}

      {bubblePosition ? bubbleLinkOpen ? (
          <form
            className="flex max-w-[min(92vw,520px)] items-center gap-2 rounded-lg border border-neutral-200 bg-white/95 p-2 shadow-lg backdrop-blur"
            style={{
              left: bubblePosition.left,
              position: "fixed",
              top: bubblePosition.top,
              transform: "translate(-50%, -100%)",
              zIndex: 60,
            }}
            onSubmit={(event) => {
              event.preventDefault();

              const href = normalizeLinkUrl(bubbleLinkUrl);
              if (!href) editor.chain().focus().extendMarkRange("link").unsetLink().run();
              else editor.chain().focus().extendMarkRange("link").setLink({ href }).run();

              setBubbleLinkOpen(false);
            }}
          >
            <input
              ref={bubbleLinkInputRef}
              value={bubbleLinkUrl}
              onChange={(event) => setBubbleLinkUrl(event.target.value)}
              placeholder="https://example.com"
              className="min-w-[220px] flex-1 rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
            <button type="submit" className="rounded-md bg-neutral-900 px-3 py-2 text-xs font-semibold text-white">
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                setBubbleLinkOpen(false);
              }}
              className="rounded-md border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-800"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={() => setBubbleLinkOpen(false)}
              className="rounded-md px-3 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-50"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div
            className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white/80 p-1 shadow-lg opacity-80 backdrop-blur transition hover:bg-white hover:opacity-100"
            style={{
              left: bubblePosition.left,
              position: "fixed",
              top: bubblePosition.top,
              transform: "translate(-50%, -100%)",
              zIndex: 60,
            }}
          >
            <button
              type="button"
              title="Bold"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={[
                "flex h-8 w-8 items-center justify-center rounded-md",
                toolbarState?.bold ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100",
              ].join(" ")}
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              title="Italic"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={[
                "flex h-8 w-8 items-center justify-center rounded-md",
                toolbarState?.italic ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100",
              ].join(" ")}
            >
              <Italic size={16} />
            </button>
            <button
              type="button"
              title="Heading 2"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={[
                "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-bold",
                toolbarState?.block === "h2" ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100",
              ].join(" ")}
            >
              H2
            </button>
            <button
              type="button"
              title="Heading 3"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={[
                "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-bold",
                toolbarState?.block === "h3" ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100",
              ].join(" ")}
            >
              H3
            </button>
            <button
              type="button"
              title="Bullet list"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={[
                "flex h-8 w-8 items-center justify-center rounded-md",
                toolbarState?.bulletList ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100",
              ].join(" ")}
            >
              <List size={17} />
            </button>
            <button
              type="button"
              title="Link"
              onClick={() => openBubbleLinkPanel(editor)}
              className={[
                "flex h-8 w-8 items-center justify-center rounded-md",
                toolbarState?.link ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100",
              ].join(" ")}
            >
              <LinkIcon size={16} />
            </button>
            <button
              type="button"
              title="Clear formatting"
              onClick={() => editor.chain().focus().unsetAllMarks().run()}
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100"
            >
              <RemoveFormatting size={16} />
            </button>
          </div>
        ) : null}

      <EditorContent className="rt-editor" editor={editor} />
    </div>
  );
}

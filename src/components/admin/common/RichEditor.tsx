"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
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

function ToolButton({
  label,
  onClick,
  active,
  disabled,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-xl border px-3 py-1 text-xs font-medium",
        active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white",
        "hover:bg-neutral-50 disabled:opacity-50 disabled:pointer-events-none",
      ].join(" ")}
    >
      {label}
    </button>
  );
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
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
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
        class: "prose prose-neutral max-w-none px-4 py-4 focus:outline-none [&_table]:border-collapse [&_table]:w-full [&_table]:border [&_table]:border-neutral-300 [&_td]:border [&_td]:border-neutral-300 [&_td]:p-2 [&_th]:border [&_th]:border-neutral-300 [&_th]:p-2 [&_th]:bg-neutral-100 [&_th]:font-semibold",
        style: `min-height:${minHeight}px`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const html = editor.getHTML();
    if ((value || "") !== html) {
      editor.commands.setContent(value || "");
    }
  }, [editor, value]);

  if (!editor) {
    return <div className="rounded-3xl border border-neutral-200 bg-white p-4 text-sm">Loading editor...</div>;
  }

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white">
      {/* Toolbar Row 1: Headings & Text Formatting */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 px-2">
          <span className="text-xs font-medium text-neutral-600">Headings:</span>
        </div>
        <ToolButton
          label="H1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
        />
        <ToolButton
          label="H2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        />
        <ToolButton
          label="H3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
        />
        <ToolButton
          label="H4"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          active={editor.isActive("heading", { level: 4 })}
        />
        <ToolButton
          label="Paragraph"
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph")}
        />
        
        <div className="w-px h-6 bg-neutral-200" />
        
        <ToolButton label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} />
        <ToolButton
          label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        />
        <ToolButton
          label="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
        />
        <ToolButton
          label="Strike"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
        />
        <ToolButton
          label="Code"
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
        />
      </div>

      {/* Toolbar Row 2: Lists, Links & Alignment */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 px-2">
          <span className="text-xs font-medium text-neutral-600">Lists:</span>
        </div>
        <ToolButton
          label="• Bullets"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        />
        <ToolButton
          label="1. Numbered"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        />
        
        <div className="w-px h-6 bg-neutral-200" />
        
        <ToolButton
          label="Link"
          onClick={() => {
            const current = editor.getAttributes("link").href as string | undefined;
            const url = window.prompt("Link URL", current || "");
            if (url === null) return;
            if (!url.trim()) {
              editor.chain().focus().unsetLink().run();
              return;
            }
            editor.chain().focus().setLink({ href: url }).run();
          }}
          active={editor.isActive("link")}
        />
        
        <div className="w-px h-6 bg-neutral-200" />
        
        <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 px-2">
          <span className="text-xs font-medium text-neutral-600">Align:</span>
        </div>
        <ToolButton
          label="← Left"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
        />
        <ToolButton
          label="⊞ Center"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
        />
        <ToolButton
          label="→ Right"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
        />
      </div>

      {/* Toolbar Row 3: Blocks & Table */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 px-2">
          <span className="text-xs font-medium text-neutral-600">Blocks:</span>
        </div>
        <ToolButton
          label="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        />
        <ToolButton
          label="Code Block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
        />
        <ToolButton
          label="Horizontal Line"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />
        
        <div className="w-px h-6 bg-neutral-200" />
        
        <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 px-2">
          <span className="text-xs font-medium text-neutral-600">Table:</span>
        </div>
        <ToolButton
          label="Insert Table"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        />
        <ToolButton
          label="Add Column"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          disabled={!editor.can().addColumnAfter()}
        />
        <ToolButton
          label="Add Row"
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!editor.can().addRowAfter()}
        />
        <ToolButton
          label="Delete Table"
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!editor.can().deleteTable()}
        />
      </div>

      {/* Toolbar Row 4: Colors & Utilities */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 px-2">
          <span className="text-xs font-medium text-neutral-600">Highlight:</span>
        </div>
        <ToolButton
          label="🟡 Yellow"
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
          active={editor.isActive("highlight", { color: '#fef08a' })}
        />
        <ToolButton
          label="🟢 Green"
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#bbf7d0' }).run()}
          active={editor.isActive("highlight", { color: '#bbf7d0' })}
        />
        <ToolButton
          label="🔵 Blue"
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#bfdbfe' }).run()}
          active={editor.isActive("highlight", { color: '#bfdbfe' })}
        />
        <ToolButton
          label="Clear"
          onClick={() => editor.chain().focus().unsetHighlight().run()}
        />
        
        <div className="w-px h-6 bg-neutral-200" />
        
        <ToolButton
          label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        />
        <ToolButton
          label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        />
        <ToolButton
          label="Clear Format"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

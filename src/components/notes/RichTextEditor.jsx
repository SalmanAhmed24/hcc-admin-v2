
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
// import TextStyle from "@tiptap/extension-text-style";
// import { Color } from "@tiptap/extension-color";
import * as TextStyle from "@tiptap/extension-text-style";
import * as Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Undo,
  Redo,
  Highlighter,
} from "lucide-react";

// ─────────────────────────────────────────────
// TEXT COLOURS
// These appear in the colour picker toolbar row.
// ─────────────────────────────────────────────
const TEXT_COLORS = [
  { label: "Default", value: "#e2e8f0" },
  { label: "Muted",   value: "#64748b" },
  { label: "Amber",   value: "#d97706" },
  { label: "Sky",     value: "#38bdf8" },
  { label: "Green",   value: "#34d399" },
  { label: "Red",     value: "#f87171" },
  { label: "Purple",  value: "#a78bfa" },
];

const HIGHLIGHT_COLORS = [
  { label: "Amber",  value: "#d9770620" },
  { label: "Sky",    value: "#38bdf820" },
  { label: "Green",  value: "#34d39920" },
  { label: "Red",    value: "#f8717120" },
];

// ─────────────────────────────────────────────
// TOOLBAR BUTTON
// A reusable styled button for the formatting toolbar.
// ─────────────────────────────────────────────
const ToolbarButton = ({ onClick, isActive, disabled, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className="flex items-center justify-center rounded-md transition-colors"
    style={{
      width: 28,
      height: 28,
      color: isActive ? "#d97706" : "#64748b",
      background: isActive ? "#d9770618" : "transparent",
      border: isActive ? "1px solid #d9770630" : "1px solid transparent",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
    }}
    onMouseEnter={(e) => {
      if (!isActive && !disabled) {
        e.currentTarget.style.background = "#ffffff08";
        e.currentTarget.style.color = "#94a3b8";
      }
    }}
    onMouseLeave={(e) => {
      if (!isActive && !disabled) {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#64748b";
      }
    }}
  >
    {children}
  </button>
);

// ─────────────────────────────────────────────
// TOOLBAR DIVIDER
// ─────────────────────────────────────────────
const Divider = () => (
  <div
    style={{
      width: 1,
      height: 18,
      background: "#1e2538",
      margin: "0 4px",
      flexShrink: 0,
    }}
  />
);

// ─────────────────────────────────────────────
// FORMATTING TOOLBAR
// ─────────────────────────────────────────────
const FormattingToolbar = ({ editor }) => {
  if (!editor) return null;

  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", prev || "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 px-3 py-2"
      style={{
        background: "#0f1218",
        borderBottom: "1px solid #1a2035",
        minHeight: 46,
      }}
    >
      {/* History */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo (⌘Z)" disabled={!editor.can().undo()}>
        <Undo size={13} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo (⌘⇧Z)" disabled={!editor.can().redo()}>
        <Redo size={13} />
      </ToolbarButton>

      <Divider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={13} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={13} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 size={13} />
      </ToolbarButton>

      <Divider />

      {/* Inline marks */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold (⌘B)"
      >
        <Bold size={13} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic (⌘I)"
      >
        <Italic size={13} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline (⌘U)"
      >
        <UnderlineIcon size={13} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough size={13} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        title="Inline code"
      >
        <Code size={13} />
      </ToolbarButton>

      <Divider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="Align left"
      >
        <AlignLeft size={13} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="Align center"
      >
        <AlignCenter size={13} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="Align right"
      >
        <AlignRight size={13} />
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet list"
      >
        <List size={13} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Numbered list"
      >
        <ListOrdered size={13} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote size={13} />
      </ToolbarButton>

      <Divider />

      {/* Link & horizontal rule */}
      <ToolbarButton
        onClick={setLink}
        isActive={editor.isActive("link")}
        title="Add link"
      >
        <LinkIcon size={13} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal rule"
      >
        <Minus size={13} />
      </ToolbarButton>

      <Divider />

      {/* Text colour dots */}
      <div className="flex items-center gap-1.5 px-1">
        {TEXT_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={`Text: ${c.label}`}
            onClick={() => editor.chain().focus().setColor(c.value).run()}
            className="rounded-full transition-transform hover:scale-110"
            style={{
              width: 13,
              height: 13,
              background: c.value,
              border:
                editor.isActive("textStyle", { color: c.value })
                  ? "2px solid #d97706"
                  : "1px solid #2a3045",
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      <Divider />

      {/* Highlight dots */}
      <div className="flex items-center gap-1 px-1">
        <Highlighter size={11} style={{ color: "#475569" }} />
        {HIGHLIGHT_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={`Highlight: ${c.label}`}
            onClick={() =>
              editor.chain().focus().toggleHighlight({ color: c.value }).run()
            }
            className="rounded transition-transform hover:scale-110"
            style={{
              width: 13,
              height: 13,
              background: c.value,
              border: "1px solid #2a3045",
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// RICH TEXT EDITOR (MAIN EXPORT)
//
// Uses forwardRef so NoteEditor can hold a ref to this component
// and call insertText(text) imperatively when a voice transcript
// arrives — without needing to pass the transcript through props
// and re-render the entire editor tree.
//
// WHY useImperativeHandle INSTEAD OF A PROP?
//   The transcript arrives asynchronously from the voice hook.
//   Inserting via a prop would require lifting state up through
//   NoteEditor, potentially re-rendering RichTextEditor and
//   causing the cursor to jump. The imperative approach inserts
//   text directly into Tiptap's internal state at the cursor
//   position without triggering a React re-render cycle.
// ─────────────────────────────────────────────
const RichTextEditor = forwardRef(function RichTextEditor(
  { content, onChange, editable = true },
  ref
) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({
        placeholder: "Start writing your note…",
      }),
      CharacterCount,
    ],
    content: content || null,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
  });

  // ── IMPERATIVE HANDLE ────────────────────────
  // Exposes insertText() to parent components via a ref.
  // NoteEditor calls richTextEditorRef.current.insertText(transcript)
  // when a voice recording ends.
  //
  // insertText behaviour:
  //   - Focuses the editor (required before inserting)
  //   - Moves cursor to end if nothing is selected
  //   - Inserts the text at the current cursor position
  //   - Adds a trailing space so the next typed character
  //     doesn't run directly into the transcript text
  useImperativeHandle(ref, () => ({
    insertText: (text) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .insertContent(text.trim() + " ")
        .run();
    },
  }), [editor]);

  // Sync content when it changes externally (e.g. note loaded from DB)
  useEffect(() => {
    if (!editor) return;
    const currentJson = JSON.stringify(editor.getJSON());
    const incomingJson = JSON.stringify(content);
    // Only update if content is meaningfully different (avoids cursor jump)
    if (content && currentJson !== incomingJson) {
      editor.commands.setContent(content, false); // false = don't add to history
    }
  }, [content, editor]);

  // Update editable state when prop changes
  useEffect(() => {
    if (editor) editor.setEditable(editable);
  }, [editable, editor]);

  const wordCount = editor?.storage.characterCount.words() ?? 0;
  const charCount = editor?.storage.characterCount.characters() ?? 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {editable && <FormattingToolbar editor={editor} />}

      {/* Editor content area */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <EditorContent
          editor={editor}
          className="tiptap-editor h-full"
        />
      </div>

      {/* Word count footer */}
      <div
        className="flex items-center gap-4 px-8 py-2"
        style={{
          borderTop: "1px solid #1a2035",
          color: "#334155",
          fontSize: "11px",
        }}
      >
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>
    </div>
  );
});

export default RichTextEditor;
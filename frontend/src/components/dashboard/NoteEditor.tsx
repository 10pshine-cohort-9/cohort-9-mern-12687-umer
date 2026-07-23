import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { ExcalidrawNode } from "../../extensions/ExcalidrawNode";

interface NoteEditorProps {
  title: string;
  content: JSONContent;
  onTitleChange: (title: string) => void;
  onContentChange: (content: JSONContent) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

// Map of Tailwind Typography sizes and matching Title sizes
const proseSizes = ["prose-sm", "prose-base", "prose-lg", "prose-xl", "prose-2xl"];
const titleSizes = ["text-2xl", "text-3xl", "text-4xl", "text-5xl", "text-6xl"];

// The standard Catppuccin Latte text colors applied to all sizes
const baseEditorClasses =
  "max-w-none focus:outline-none min-h-[calc(100vh-220px)] text-[#4c4f69] prose-headings:text-[#4c4f69] prose-p:text-[#4c4f69] prose-strong:text-[#4c4f69] prose-blockquote:text-[#6c6f85] prose-blockquote:border-[#ccd0da] prose-code:text-[#4c4f69] prose-code:bg-[#e6e9ef] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none";

export default function NoteEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave,
  onCancel,
  saving,
}: NoteEditorProps) {
  // sizeIndex: 1 maps to "prose-base" & "text-3xl" (Default size)
  const [sizeIndex, setSizeIndex] = useState(1);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: "Start writing…" }),
      ExcalidrawNode,
    ],
    content,
    editorProps: {
      attributes: {
        class: `prose ${proseSizes[sizeIndex]} ${baseEditorClasses}`,
      },
    },
    onUpdate: ({ editor }) => onContentChange(editor.getJSON()),
  });

  // Sync editor when a different document is selected
  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(content);
    if (current !== incoming) editor.commands.setContent(content, { emitUpdate: false });
  }, [editor, content]);

  // Dynamically update the editor's Tailwind prose class when the font size changes
  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            class: `prose ${proseSizes[sizeIndex]} ${baseEditorClasses}`,
          },
        },
      });
    }
  }, [sizeIndex, editor]);

  if (!editor) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center gap-1 border-b border-[#ccd0da] bg-[#eff1f5]/90 backdrop-blur px-8 py-3">
        <ToolbarButton active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} label="H1" />
        <ToolbarButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="H2" />
        <ToolbarButton active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} label="H3" />
        <Divider />
        <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} label="B" className="font-bold" />
        <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} label="I" className="italic" />
        <ToolbarButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} label="S" className="line-through" />
        <ToolbarButton active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} label="</>" />
        <Divider />
        <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} label="• List" />
        <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="1. List" />
        <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="❝" />
        <ToolbarButton active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} label="{ }" />
        
        <Divider />
        
        {/* Font Sizing Buttons */}
        <ToolbarButton 
          onClick={() => setSizeIndex((s) => Math.max(0, s - 1))} 
          disabled={sizeIndex === 0} 
          label="A-" 
          title="Decrease font size"
        />
        <ToolbarButton 
          onClick={() => setSizeIndex((s) => Math.min(proseSizes.length - 1, s + 1))} 
          disabled={sizeIndex === proseSizes.length - 1} 
          label="A+" 
          title="Increase font size"
        />

        <Divider />
        <ToolbarButton 
          active={editor.isActive("excalidraw")} 
          onClick={() => editor.chain().focus().insertContent({ type: 'excalidraw' }).run()} 
          label="🎨 Whiteboard" 
        />
        
        <div className="ml-auto flex items-center gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-semibold text-[#6c6f85] hover:bg-[#e6e9ef] hover:text-[#4c4f69] transition-colors">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-lg bg-[#8aadf4] px-5 py-2 text-sm font-bold text-[#181926] shadow-sm hover:bg-[#7dc4e4] disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-10 py-12">
          {/* Dynamically size the Title based on sizeIndex */}
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled"
            className={`w-full border-none bg-transparent font-extrabold text-[#4c4f69] placeholder:text-[#9ca0b0] focus:outline-none transition-all ${titleSizes[sizeIndex]}`}
          />
          <div className="mt-8 transition-all">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Updated ToolbarButton to handle disabled state
function ToolbarButton({ 
  active = false, 
  onClick, 
  label, 
  className = "",
  disabled = false,
  title
}: { 
  active?: boolean; 
  onClick: () => void; 
  label: string; 
  className?: string;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
        disabled 
          ? "opacity-40 cursor-not-allowed text-[#6c6f85]" 
          : active 
            ? "bg-[#e6e9ef] text-[#4c4f69]" 
            : "text-[#6c6f85] hover:bg-[#e6e9ef] hover:text-[#4c4f69]"
      } ${className}`}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <div className="mx-2 h-6 w-px bg-[#ccd0da]" />;
}
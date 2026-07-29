// src/components/dashboard/Sidebar.tsx
import type { Document } from '../../types/document';

interface SidebarProps {
  documents: Document[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
  onDelete: (id: number) => void;
}

export default function Sidebar({
  documents,
  selectedId,
  onSelect,
  onNew,
  onDelete,
}: SidebarProps) {
  return (
    <div className="w-64 bg-[#181825] border-r border-[#313244] p-4 flex flex-col h-full shrink-0">
      <button
        onClick={onNew}
        className="mb-6 w-full rounded-xl bg-[#cba6f7] px-4 py-3 font-bold text-[#11111b] shadow-sm transition hover:bg-[#b4befe]"
      >
        + New Note
      </button>

      <ul className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
        {documents.map((doc) => (
          <li
            key={doc.id}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(doc.id);
              }
            }}
            className={`flex items-center justify-between rounded-xl px-4 py-2.5 cursor-pointer text-sm transition-all outline-none ${
              selectedId === doc.id
                ? 'bg-[#313244] text-[#89b4fa] font-semibold ring-1 ring-[#45475a]'
                : 'text-[#bac2de] hover:bg-[#313244] hover:text-[#cdd6f4] focus-visible:ring-1 focus-visible:ring-[#89b4fa]'
            }`}
            onClick={() => onSelect(doc.id)}
          >
            <span className="truncate flex-1">{doc.title || 'Untitled'}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(doc.id);
              }}
              className="ml-2 text-[#f38ba8] opacity-60 hover:opacity-100 hover:text-[#eba0ac] transition-all"
              title="Delete note"
              aria-label="Delete note"
            >
              🗑
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
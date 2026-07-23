// Sidebar.tsx
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
    <div className="w-64 bg-[#1e2030] p-4 flex flex-col h-full shrink-0">
      <button
        onClick={onNew}
        className="mb-6 w-full rounded-xl bg-[#c6a0f6] px-4 py-3 font-bold text-[#181926] shadow-sm transition hover:bg-[#b7bdf8]"
      >
        + New Note
      </button>

      <ul className="flex-1 space-y-1 overflow-y-auto pr-2">
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
            className={`flex items-center justify-between rounded-xl px-4 py-2.5 cursor-pointer text-sm transition-all ${
              selectedId === doc.id
                ? 'bg-[#24273a] text-[#8aadf4] font-semibold shadow-sm ring-1 ring-[#363a4f]'
                : 'text-[#a5adcb] hover:bg-[#363a4f] hover:text-[#cad3f5]'
            }`}
            onClick={() => onSelect(doc.id)}
          >
            <span className="truncate flex-1">{doc.title || 'Untitled'}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(doc.id);
              }}
              className="ml-2 text-[#ed8796] hover:text-[#d20f39] transition-colors"
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
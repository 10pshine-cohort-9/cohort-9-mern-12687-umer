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
    <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col h-full">
      <button
        onClick={onNew}
        className="mb-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        + New Note
      </button>

      <ul className="flex-1 space-y-1 overflow-y-auto">
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
            className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer text-sm ${
              selectedId === doc.id
                ? 'bg-blue-50 text-blue-700'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            onClick={() => onSelect(doc.id)}
          >
            <span className="truncate flex-1">{doc.title || 'Untitled'}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(doc.id);
              }}
              className="ml-2 text-red-400 hover:text-red-600"
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
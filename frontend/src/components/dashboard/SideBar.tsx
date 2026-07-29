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
    <div className="w-64 bg-[#181825] border-r border-[#313244] p-3 flex flex-col h-full shrink-0">
      <div className="mb-4 mt-2 px-2">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#cba6f7]/30 bg-[#cba6f7]/10 px-4 py-2 font-mono text-sm text-[#cba6f7] transition-all hover:bg-[#cba6f7]/20 hover:border-[#cba6f7]"
        >
          <span>+</span> New Note
        </button>
      </div>

      <div className="px-2 mb-2 font-mono text-[10px] tracking-widest text-[#585b70] uppercase">
        Explorer
      </div>

      <ul className="flex-1 space-y-0.5 overflow-y-auto custom-scrollbar pr-1">
        {documents.map((doc) => {
          const isActive = selectedId === doc.id;
          return (
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
              className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-all outline-none ${
                isActive
                  ? 'bg-[#313244]/50 text-[#cba6f7] font-medium'
                  : 'text-[#a6adc8] hover:bg-[#313244]/30 hover:text-[#cdd6f4]'
              }`}
              onClick={() => onSelect(doc.id)}
            >
              <div className="flex items-center gap-2 truncate">
                <span className={`text-xs ${isActive ? 'text-[#cba6f7]' : 'text-[#45475a]'}`}>
                  {isActive ? '○' : '•'}
                </span>
                <span className="truncate">{doc.title || 'untitled.md'}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(doc.id);
                }}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-[#f38ba8] hover:text-[#ffb3c6] transition-all font-mono text-xs"
                title="Delete note"
              >
                x
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
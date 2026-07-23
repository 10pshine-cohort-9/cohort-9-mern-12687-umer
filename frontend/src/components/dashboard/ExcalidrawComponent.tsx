import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useEffect, useRef, useCallback } from "react";

export default function ExcalidrawComponent({
  node,
  updateAttributes,
  deleteNode,
}: NodeViewProps) {
  const initialData = useRef({
    elements: node.attrs.elements || [],
    appState: node.attrs.appState || {},
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      containerRef.current?.focus();
    });
  }, []);

  const onChange = useCallback(
    (elements: readonly any[], appState: any) => {
      updateAttributes({
        elements,
        appState: {
          viewBackgroundColor: appState.viewBackgroundColor,
          currentItemStrokeColor: appState.currentItemStrokeColor,
          currentItemBackgroundColor: appState.currentItemBackgroundColor,
        },
      });
    },
    [updateAttributes],
  );

  return (
    <NodeViewWrapper className="not-prose relative my-8 overflow-hidden rounded-lg border-2 border-slate-200 group">
      <div
        ref={containerRef}
        tabIndex={0}
        className="h-[500px] w-full outline-none"
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
        onKeyUp={(e) => {
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          containerRef.current?.focus();
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Excalidraw initialData={initialData.current} onChange={onChange} />
      </div>
      <button
        onClick={deleteNode}
        className="absolute top-4 right-4 z-50 rounded bg-red-500/90 px-3 py-1.5 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600 shadow-md"
      >
        Delete Whiteboard
      </button>
    </NodeViewWrapper>
  );
}

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useEffect, useRef, useCallback } from "react";

export default function ExcalidrawComponent({
  node,
  updateAttributes,
  deleteNode,
}: NodeViewProps) {
  // Ensure Excalidraw canvas blends perfectly with the Latte background
  const initialData = useRef({
    elements: node.attrs.elements || [],
    appState: node.attrs.appState?.viewBackgroundColor 
      ? node.attrs.appState 
      : { ...node.attrs.appState, viewBackgroundColor: "#eff1f5" },
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
    <NodeViewWrapper className="not-prose relative my-8 overflow-hidden rounded-2xl border-2 border-[#ccd0da] group transition-all hover:border-[#8aadf4]">
      <div
        ref={containerRef}
        tabIndex={0}
        className="h-[500px] w-full outline-none bg-[#eff1f5]"
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
        className="absolute top-4 right-4 z-50 rounded-lg bg-[#ed8796] px-4 py-2 text-sm font-bold text-[#181926] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#d20f39] shadow-lg"
      >
        Delete Whiteboard
      </button>
    </NodeViewWrapper>
  );
}
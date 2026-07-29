// src/components/dashboard/ExcalidrawComponent.tsx
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useEffect, useRef, useCallback } from "react";

export default function ExcalidrawComponent({
  node,
  updateAttributes,
  deleteNode,
}: NodeViewProps) {
  // Syncing with Mocha: Force dark theme explicitly inside the payload
  const initialData = useRef({
    elements: node.attrs.elements || [],
    appState: { 
      ...(node.attrs.appState || {}), 
      theme: "dark", 
      viewBackgroundColor: "#1e1e2e" // Base
    },
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
          theme: "dark",
          viewBackgroundColor: "#1e1e2e",
          currentItemStrokeColor: appState.currentItemStrokeColor,
          currentItemBackgroundColor: appState.currentItemBackgroundColor,
        },
      });
    },
    [updateAttributes],
  );

  return (
    <NodeViewWrapper className="not-prose relative my-8 overflow-hidden rounded-xl border-2 border-[#313244] bg-[#1e1e2e] group transition-all hover:border-[#cba6f7]">
      <div
        ref={containerRef}
        tabIndex={0}
        className="h-[500px] w-full outline-none"
        onKeyDown={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
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
        className="absolute top-4 right-4 z-50 rounded-lg bg-[#f38ba8] px-4 py-2 text-sm font-bold text-[#11111b] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#eba0ac] shadow-lg"
      >
        Delete Whiteboard
      </button>
    </NodeViewWrapper>
  );
}
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useRef, useCallback } from "react";

export default function ExcalidrawComponent({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const initialData = useRef({
    elements: node.attrs.elements || [],
    appState: node.attrs.appState || {},
  });

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
    [updateAttributes]
  );

  return (
    <NodeViewWrapper className="not-prose relative my-8 overflow-hidden rounded-lg border-2 border-slate-200 group"
    >
            <div 
        className="h-[500px] w-full"
        onKeyDown={(e) => e.stopPropagation()} 
      >
        <Excalidraw
          initialData={initialData.current}
          onChange={onChange}
        />
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
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ExcalidrawComponent from "../components/dashboard/ExcalidrawComponent";

export const ExcalidrawNode = Node.create({
  name: "excalidraw",
  group: "block",
  atom: true, // Treated as a single, unbreakable unit in Tiptap
  draggable: true,

  addAttributes() {
    return {
      elements: { default: [] },
      appState: { default: {} },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="excalidraw"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "excalidraw" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ExcalidrawComponent);
  },
});
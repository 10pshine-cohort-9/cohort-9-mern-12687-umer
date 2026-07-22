// src/types/document.ts
import type { JSONContent } from "@tiptap/react";
export interface Document {
  id: number;
  title: string;
  content: JSONContent;      // will become JSONContent later
  createdAt: string;
  updatedAt: string;
}
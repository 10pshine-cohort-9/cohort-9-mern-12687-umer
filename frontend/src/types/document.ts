// src/types/document.ts
export interface Document {
  id: number;
  title: string;
  content: string;      // will become JSONContent later
  createdAt: string;
  updatedAt: string;
}
// src/handlers/documentHandler.ts
import api from "../api/axios";
import type { Document } from "../types/document";
import type { JSONContent } from "@tiptap/react";


export const getDocuments = async (): Promise<Document[]> => {
  const response = await api.get("/documents");
  return response.data.documents;
};


export const getDocument = async (id: number): Promise<Document> => {
  const response = await api.get(`/documents/${id}`);
  return response.data.document;
};


export const createDocument = async (title: string): Promise<Document> => {
  const response = await api.post("/documents", { title });
  return response.data.document;
};


export const updateDocument = async (
  id: number,
  title: string,
  content: JSONContent
): Promise<Document> => {
  const response = await api.put(`/documents/${id}`, { title, content });
  return response.data.document;
};


export const deleteDocument = async (id: number): Promise<void> => {
  await api.delete(`/documents/${id}`);
};
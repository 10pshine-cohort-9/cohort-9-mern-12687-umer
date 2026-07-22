// src/handlers/documentHandler.ts
import api from "../api/axios";
import type { Document } from "../types/document";

/**
 * Fetch all documents for the current user.
 * Backend returns: { success: true, documents: Document[] }
 */
export const getDocuments = async (): Promise<Document[]> => {
  const response = await api.get("/documents");
  return response.data.documents;
};

/**
 * Fetch a single document by ID.
 * Backend returns: { success: true, document: Document }
 */
export const getDocument = async (id: number): Promise<Document> => {
  const response = await api.get(`/documents/${id}`);
  return response.data.document;
};

/**
 * Create a new document with the given title.
 * Backend returns: { success: true, message: string, document: Document }
 */
export const createDocument = async (title: string): Promise<Document> => {
  const response = await api.post("/documents", { title });
  return response.data.document;
};

/**
 * Update an existing document's title and/or content.
 * Backend returns: { success: true, message: string, document: Document }
 */
export const updateDocument = async (
  id: number,
  title: string,
  content: any
): Promise<Document> => {
  const response = await api.put(`/documents/${id}`, { title, content });
  return response.data.document;
};

/**
 * Delete a document.
 * Backend returns: { success: true, msg: string }
 * We don't need the response data, only that the request succeeded.
 */
export const deleteDocument = async (id: number): Promise<void> => {
  await api.delete(`/documents/${id}`);
};
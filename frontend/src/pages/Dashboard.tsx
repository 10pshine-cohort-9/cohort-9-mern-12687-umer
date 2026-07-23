// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import type { JSONContent } from "@tiptap/react";
import Navbar from "../components/dashboard/navbar";
import Sidebar from "../components/dashboard/SideBar";
import NoteEditor from "../components/dashboard/NoteEditor";
import type { Document } from "../types/document";
import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../handlers/documentHandler";

const EMPTY_CONTENT: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState<JSONContent>(EMPTY_CONTENT);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setDocuments(await getDocuments());
      } catch (err) {
        console.error("Failed to load documents", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handleSelect = async (id: number) => {
    if (id === selectedId) return;
    try {
      const doc = await getDocument(id);
      setSelectedDocument(doc);
      setSelectedId(doc.id);
      setTitle(doc.title ?? "");
      setContent((doc.content) ?? EMPTY_CONTENT);
    } catch (err) {
      console.error("Failed to load document", err);
    }
  };

  const handleNewNote = async () => {
    try {
      const newDoc = await createDocument("Untitled");
      setDocuments((prev) => [newDoc, ...prev]);
      setSelectedDocument(newDoc);
      setSelectedId(newDoc.id);
      setTitle(newDoc.title ?? "Untitled");
      setContent((newDoc.content) ?? EMPTY_CONTENT);
    } catch (err) {
      console.error("Failed to create note", err);
    }
  };

  const handleSave = async () => {
    if (!selectedDocument) return;
    setSaving(true);
    try {
      const updated = await updateDocument(selectedDocument.id, title, content);
      setSelectedDocument(updated);
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    } catch (err) {
      console.error("Failed to save", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (selectedDocument) {
      setTitle(selectedDocument.title ?? "");
      setContent((selectedDocument.content as unknown as JSONContent) ?? EMPTY_CONTENT);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedId === id) {
        setSelectedDocument(null);
        setSelectedId(null);
        setTitle("");
        setContent(EMPTY_CONTENT);
      }
    } catch (err) {
      console.error("Failed to delete note", err);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#1e2030] font-sans">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          documents={documents}
          selectedId={selectedId}
          onSelect={handleSelect}
          onNew={handleNewNote}
          onDelete={handleDelete}
        />
        {/* Soft Latte Canvas */}
        <main className="flex-1 bg-[#eff1f5] overflow-hidden rounded-tl-[2rem] border-t border-l border-[#363a4f] shadow-[-10px_10px_30px_rgba(0,0,0,0.2)]">
          {loading ? (
            <div className="flex items-center justify-center h-full text-[#6c6f85] font-medium">Loading…</div>
          ) : selectedDocument ? (
            <NoteEditor
              title={title}
              content={content}
              onTitleChange={setTitle}
              onContentChange={setContent}
              onSave={handleSave}
              onCancel={handleCancel}
              saving={saving}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#6c6f85] font-medium">
              Select or create a note to start writing.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
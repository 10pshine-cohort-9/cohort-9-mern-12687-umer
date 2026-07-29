// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import type { JSONContent } from "@tiptap/react";
import Navbar from "../components/dashboard/Navbar";
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
    // The "Screen" with Crust background and useless gaps
    <div className="h-screen w-screen flex flex-col gap-4 bg-[#11111b] p-4 font-sans text-[#cdd6f4] selection:bg-[#cba6f7] selection:text-[#11111b]">
      <Navbar />
      
      {/* The main "Tiled Window" */}
      <div className="flex flex-1 overflow-hidden rounded-2xl border border-[#313244] bg-[#1e1e2e] shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
        <Sidebar
          documents={documents}
          selectedId={selectedId}
          onSelect={handleSelect}
          onNew={handleNewNote}
          onDelete={handleDelete}
        />
        
        <main className="flex-1 overflow-hidden relative flex flex-col bg-[#1e1e2e]">
          {loading ? (
            <div className="flex items-center justify-center h-full text-[#7f849c] font-mono text-sm animate-pulse">
              [ loading_buffer... ]
            </div>
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
            <div className="flex flex-col items-center justify-center h-full text-[#585b70]">
              <span className="font-mono text-xl text-[#6c7086] mb-2">~/notes</span>
              <span className="font-mono text-sm">Select a note to edit</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Dashboard from "../pages/Dashboard";
import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../handlers/documentHandler";
import { describe, it, expect, vi, beforeEach } from "vitest";



// Mock child components to isolate Dashboard logic
vi.mock("../components/dashboard/navbar", () => ({
  default: () => <div>Navbar</div>,
}));
vi.mock("../components/dashboard/SideBar", () => ({
  default: ({ documents, selectedId, onSelect, onNew, onDelete }: any) => (
  <div>
    <button onClick={onNew}>New Note</button>
    <ul>
      {documents.map((doc: any) => (
        <li key={doc.id}>
          <span onClick={() => onSelect(doc.id)}>{doc.title}</span>
          <button onClick={() => onDelete(doc.id)}>Delete</button>
        </li>
      ))}
    </ul>
    <div>Selected: {selectedId}</div>
  </div>
)}));


vi.mock("../components/dashboard/NoteEditor", () => ({ 
  default: ({title, content, onTitleChange, onContentChange, onSave, onCancel, saving }: any) => (
  <div>
    <input value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Title" />
    <textarea value={JSON.stringify(content)} onChange={(e) => onContentChange(JSON.parse(e.target.value))} />
    <button onClick={onSave} disabled={saving}>Save</button>
    <button onClick={onCancel}>Cancel</button>
    {saving && <span>Saving...</span>}
  </div>
)}));

// Mock document handlers
vi.mock("../handlers/documentHandler", () => ({
  getDocuments: vi.fn(),
  getDocument: vi.fn(),
  createDocument: vi.fn(),
  updateDocument: vi.fn(),
  deleteDocument: vi.fn(),
}));

// Mock console.error to avoid noise in tests (optional)
const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => {});

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDocuments = [
    { id: 1, title: "Doc1", content: { type: "doc", content: [{ type: "paragraph", content: [{ text: "Hello" }] }] } },
    { id: 2, title: "Doc2", content: { type: "doc", content: [{ type: "paragraph" }] } },
  ];

  const mockDocDetail = { id: 1, title: "Doc1", content: { type: "doc", content: [{ type: "paragraph", content: [{ text: "Hello" }] }] } };

  test("fetches documents on mount and shows loading state", async () => {
    (getDocuments as vi.Mock).mockResolvedValue(mockDocuments);

    render(<Dashboard />);

    // Initially shows loading
    expect(screen.getByText("Loading…")).toBeInTheDocument();

    // After fetch, loading disappears and documents are shown
    await waitFor(() => {
      expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Doc1")).toBeInTheDocument();
    expect(screen.getByText("Doc2")).toBeInTheDocument();
    expect(getDocuments).toHaveBeenCalledTimes(1);
  });

  test("handles fetch error gracefully", async () => {
    (getDocuments as vi.Mock).mockRejectedValue(new Error("Network error"));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
    });
    // No documents are shown
    expect(screen.queryByText("Doc1")).not.toBeInTheDocument();
    expect(consoleErrorMock).toHaveBeenCalledWith("Failed to load documents", expect.any(Error));
  });

  test("selects a document and loads its content", async () => {
    (getDocuments as vi.Mock).mockResolvedValue(mockDocuments);
    (getDocument as vi.Mock).mockResolvedValue(mockDocDetail);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
    });

    // Click on document title
    fireEvent.click(screen.getByText("Doc1"));

    await waitFor(() => {
      expect(getDocument).toHaveBeenCalledWith(1);
    });

    // Editor shows title and content
    expect(screen.getByPlaceholderText("Title")).toHaveValue("Doc1");
    expect(screen.getAllByRole("textbox")[1]).toHaveValue(JSON.stringify(mockDocDetail.content));
    // Sidebar shows selected id
    expect(screen.getByText("Selected: 1")).toBeInTheDocument();
  });

  test("does not refetch document if same id is selected", async () => {
    (getDocuments as vi.Mock).mockResolvedValue(mockDocuments);
    (getDocument as vi.Mock).mockResolvedValue(mockDocDetail);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
    });

    // Select Doc1 twice
    fireEvent.click(screen.getByText("Doc1"));
    await waitFor(() => {
      expect(getDocument).toHaveBeenCalledTimes(1);
    });
    fireEvent.click(screen.getByText("Doc1"));
    // No additional call
    expect(getDocument).toHaveBeenCalledTimes(1);
  });

  test("creates a new note", async () => {
    const newDoc = { id: 3, title: "Untitled", content: { type: "doc", content: [{ type: "paragraph" }] } };
    (getDocuments as vi.Mock).mockResolvedValue(mockDocuments);
    (createDocument as vi.Mock).mockResolvedValue(newDoc);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("New Note"));

    await waitFor(() => {
      expect(createDocument).toHaveBeenCalledWith("Untitled");
    });

    // New document appears in list and is selected
    expect(screen.getByText("Untitled")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Title")).toHaveValue("Untitled");
    // Check selected id in sidebar
    expect(screen.getByText("Selected: 3")).toBeInTheDocument();
  });

  test("saves the current document", async () => {
    const updatedDoc = { ...mockDocDetail, title: "Updated Title" };
    (getDocuments as vi.Mock).mockResolvedValue(mockDocuments);
    (getDocument as vi.Mock).mockResolvedValue(mockDocDetail);
    (updateDocument as vi.Mock).mockResolvedValue(updatedDoc);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
    });

    // Select Doc1
    fireEvent.click(screen.getByText("Doc1"));
    await waitFor(() => {
      expect(getDocument).toHaveBeenCalled();
    });

    // Change title and content
    const titleInput = screen.getByPlaceholderText("Title");
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });
const contentTextarea = screen.getAllByRole("textbox")[1];
    const newContent = { type: "doc", content: [{ type: "paragraph", content: [{ text: "New content" }] }] };
    fireEvent.change(contentTextarea, { target: { value: JSON.stringify(newContent) } });

    // Click Save
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(updateDocument).toHaveBeenCalledWith(1, "Updated Title", newContent);
    });

    // Saving indicator disappears
    expect(screen.queryByText("Saving...")).not.toBeInTheDocument();
    // Document list updated (we mocked the update, but we don't check list here)
  });

  test("cancels edits and reverts to original document state", async () => {
    (getDocuments as vi.Mock).mockResolvedValue(mockDocuments);
    (getDocument as vi.Mock).mockResolvedValue(mockDocDetail);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Doc1"));
    await waitFor(() => {
      expect(getDocument).toHaveBeenCalled();
    });

    const titleInput = screen.getByPlaceholderText("Title");
    fireEvent.change(titleInput, { target: { value: "Changed" } });
    const contentTextarea =screen.getAllByRole("textbox")[1];
    const originalContent = mockDocDetail.content;
    fireEvent.change(contentTextarea, { target: { value: JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ text: "Changed" }] }] }) } });

    // Click Cancel
    fireEvent.click(screen.getByText("Cancel"));

    // Values revert
    expect(titleInput).toHaveValue("Doc1");
    expect(contentTextarea).toHaveValue(JSON.stringify(originalContent));
  });

  test("deletes a document", async () => {
    (getDocuments as vi.Mock).mockResolvedValue(mockDocuments);
    (deleteDocument as vi.Mock).mockResolvedValue(undefined);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
    });

    // Click delete on Doc1
    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteDocument).toHaveBeenCalledWith(1);
    });

    // Doc1 is removed from list
    expect(screen.queryByText("Doc1")).not.toBeInTheDocument();
    expect(screen.getByText("Doc2")).toBeInTheDocument();
    // Selected is cleared (assuming Doc1 was selected? But we didn't select it, so it's null)
    // We can test selection clearing by selecting first then deleting.
  });

  test("clears selected document after deletion", async () => {
    (getDocuments as vi.Mock).mockResolvedValue(mockDocuments);
    (getDocument as vi.Mock).mockResolvedValue(mockDocDetail);
    (deleteDocument as vi.Mock).mockResolvedValue(undefined);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
    });

    // Select Doc1
    fireEvent.click(screen.getByText("Doc1"));
    await waitFor(() => {
      expect(getDocument).toHaveBeenCalled();
    });

    // Delete Doc1
    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteDocument).toHaveBeenCalledWith(1);
    });

    // Editor should show placeholder
    expect(screen.getByText("Select or create a note to start writing.")).toBeInTheDocument();
    // Title and content cleared
    expect(screen.queryByPlaceholderText("Title")).not.toBeInTheDocument();
  });

  test("handles delete error gracefully", async () => {
    (getDocuments as vi.Mock).mockResolvedValue(mockDocuments);
    (deleteDocument as vi.Mock).mockRejectedValue(new Error("Delete failed"));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteDocument).toHaveBeenCalled();
    });
    // Document should still be there (no state change)
    expect(screen.getByText("Doc1")).toBeInTheDocument();
    expect(consoleErrorMock).toHaveBeenCalledWith("Failed to delete note", expect.any(Error));
  });
});
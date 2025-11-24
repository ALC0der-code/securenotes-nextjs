
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Search, Trash2, Edit2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PouchDBService, VaultItem } from "@/lib/pouchdb-client";
import { EncryptionService } from "@/lib/encryption";

export function NotesTab() {
  const { data: session } = useSession() || {};
  const [notes, setNotes] = useState<VaultItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<VaultItem | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      initializeAndLoadNotes();
    }
  }, [session?.user?.id]);

  const initializeAndLoadNotes = async () => {
    try {
      await PouchDBService.initialize(session?.user?.id ?? "");
      await loadNotes();
    } catch (error) {
      console.error("Error initializing:", error);
      toast.error("Failed to initialize database");
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const items = await PouchDBService.getItems(session?.user?.id ?? "", "note");
      setNotes(items);
    } catch (error) {
      console.error("Error loading notes:", error);
      toast.error("Failed to load notes");
    }
  };

  const handleSave = async () => {
    try {
      const masterPassword = sessionStorage.getItem("masterPassword");
      if (!masterPassword) {
        toast.error("Master password not found");
        return;
      }

      const encryptedContent = await EncryptionService.encrypt(content, masterPassword);

      if (editingNote) {
        await PouchDBService.updateItem({
          ...editingNote,
          title,
          encryptedContent,
        });
        toast.success("Note updated successfully!");
      } else {
        await PouchDBService.addItem({
          userId: session?.user?.id ?? "",
          type: "note",
          title,
          encryptedContent,
        });
        toast.success("Note created successfully!");
      }

      await loadNotes();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    }
  };

  const handleEdit = async (note: VaultItem) => {
    try {
      const masterPassword = sessionStorage.getItem("masterPassword");
      if (!masterPassword) {
        toast.error("Master password not found");
        return;
      }

      const decryptedContent = await EncryptionService.decrypt(note.encryptedContent, masterPassword);
      setEditingNote(note);
      setTitle(note.title);
      setContent(decryptedContent);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error decrypting note:", error);
      toast.error("Failed to decrypt note");
    }
  };

  const handleDelete = async (note: VaultItem) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await PouchDBService.deleteItem(note._id, note._rev ?? "");
      toast.success("Note deleted successfully!");
      await loadNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingNote(null);
    setTitle("");
    setContent("");
  };

  const filteredNotes = searchQuery
    ? notes.filter((note) => note.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : notes;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading notes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingNote(null);
                setTitle("");
                setContent("");
              }}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingNote ? "Edit Note" : "Create New Note"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter note title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter note content (will be encrypted)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!title || !content}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {editingNote ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
          <p className="text-gray-600 mb-6">Create your first encrypted note to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card
              key={note._id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{note.title}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Updated: {new Date(note.updatedAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(note)}
                  className="flex-1"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(note)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

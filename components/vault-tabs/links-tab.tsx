
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Search, Trash2, Edit2, Link as LinkIcon, ExternalLink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface LinkData {
  url: string;
  description: string;
}

export function LinksTab() {
  const { data: session } = useSession() || {};
  const [links, setLinks] = useState<VaultItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<VaultItem | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      initializeAndLoadLinks();
    }
  }, [session?.user?.id]);

  const initializeAndLoadLinks = async () => {
    try {
      await PouchDBService.initialize(session?.user?.id ?? "");
      await loadLinks();
    } catch (error) {
      console.error("Error initializing:", error);
      toast.error("Failed to initialize database");
    } finally {
      setIsLoading(false);
    }
  };

  const loadLinks = async () => {
    try {
      const items = await PouchDBService.getItems(session?.user?.id ?? "", "link");
      setLinks(items);
    } catch (error) {
      console.error("Error loading links:", error);
      toast.error("Failed to load links");
    }
  };

  const handleSave = async () => {
    try {
      const masterPassword = sessionStorage.getItem("masterPassword");
      if (!masterPassword) {
        toast.error("Master password not found");
        return;
      }

      const linkData: LinkData = {
        url,
        description,
      };

      const encryptedContent = await EncryptionService.encrypt(
        JSON.stringify(linkData),
        masterPassword
      );

      if (editingLink) {
        await PouchDBService.updateItem({
          ...editingLink,
          title,
          encryptedContent,
        });
        toast.success("Link updated successfully!");
      } else {
        await PouchDBService.addItem({
          userId: session?.user?.id ?? "",
          type: "link",
          title,
          encryptedContent,
        });
        toast.success("Link created successfully!");
      }

      await loadLinks();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving link:", error);
      toast.error("Failed to save link");
    }
  };

  const handleEdit = async (item: VaultItem) => {
    try {
      const masterPassword = sessionStorage.getItem("masterPassword");
      if (!masterPassword) {
        toast.error("Master password not found");
        return;
      }

      const decryptedContent = await EncryptionService.decrypt(
        item.encryptedContent,
        masterPassword
      );
      const linkData: LinkData = JSON.parse(decryptedContent);

      setEditingLink(item);
      setTitle(item.title);
      setUrl(linkData.url);
      setDescription(linkData.description);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error decrypting link:", error);
      toast.error("Failed to decrypt link");
    }
  };

  const handleDelete = async (item: VaultItem) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      await PouchDBService.deleteItem(item._id, item._rev ?? "");
      toast.success("Link deleted successfully!");
      await loadLinks();
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Failed to delete link");
    }
  };

  const handleOpenLink = async (item: VaultItem) => {
    try {
      const masterPassword = sessionStorage.getItem("masterPassword");
      if (!masterPassword) {
        toast.error("Master password not found");
        return;
      }

      const decryptedContent = await EncryptionService.decrypt(
        item.encryptedContent,
        masterPassword
      );
      const linkData: LinkData = JSON.parse(decryptedContent);

      window.open(linkData.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error opening link:", error);
      toast.error("Failed to open link");
    }
  };

  const handleCopyUrl = async (item: VaultItem) => {
    try {
      const masterPassword = sessionStorage.getItem("masterPassword");
      if (!masterPassword) {
        toast.error("Master password not found");
        return;
      }

      const decryptedContent = await EncryptionService.decrypt(
        item.encryptedContent,
        masterPassword
      );
      const linkData: LinkData = JSON.parse(decryptedContent);

      await navigator.clipboard.writeText(linkData.url);
      toast.success("URL copied to clipboard!");
    } catch (error) {
      console.error("Error copying URL:", error);
      toast.error("Failed to copy URL");
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLink(null);
    setTitle("");
    setUrl("");
    setDescription("");
  };

  const filteredLinks = searchQuery
    ? links.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : links;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading links...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingLink(null);
                setTitle("");
                setUrl("");
                setDescription("");
              }}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Link
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingLink ? "Edit Link" : "Create New Link"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Important Documentation, Project Resources"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Add a description for this link"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!title || !url}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {editingLink ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filteredLinks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <LinkIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No links yet</h3>
          <p className="text-gray-600 mb-6">Save your first important link</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLinks.map((item) => (
            <Card
              key={item._id}
              className="p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{item.title}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Updated: {new Date(item.updatedAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenLink(item)}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyUrl(item)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(item)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(item)}
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


"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Search, Trash2, Edit2, Key, Copy, RefreshCw, Eye, EyeOff } from "lucide-react";
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

interface PasswordData {
  username: string;
  password: string;
  website: string;
  notes: string;
}

export function PasswordsTab() {
  const { data: session } = useSession() || {};
  const [passwords, setPasswords] = useState<VaultItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<VaultItem | null>(null);
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      initializeAndLoadPasswords();
    }
  }, [session?.user?.id]);

  const initializeAndLoadPasswords = async () => {
    try {
      await PouchDBService.initialize(session?.user?.id ?? "");
      await loadPasswords();
    } catch (error) {
      console.error("Error initializing:", error);
      toast.error("Failed to initialize database");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPasswords = async () => {
    try {
      const items = await PouchDBService.getItems(session?.user?.id ?? "", "password");
      setPasswords(items);
    } catch (error) {
      console.error("Error loading passwords:", error);
      toast.error("Failed to load passwords");
    }
  };

  const handleSave = async () => {
    try {
      const masterPassword = sessionStorage.getItem("masterPassword");
      if (!masterPassword) {
        toast.error("Master password not found");
        return;
      }

      const passwordData: PasswordData = {
        username,
        password,
        website,
        notes,
      };

      const encryptedContent = await EncryptionService.encrypt(
        JSON.stringify(passwordData),
        masterPassword
      );

      if (editingPassword) {
        await PouchDBService.updateItem({
          ...editingPassword,
          title,
          encryptedContent,
        });
        toast.success("Password updated successfully!");
      } else {
        await PouchDBService.addItem({
          userId: session?.user?.id ?? "",
          type: "password",
          title,
          encryptedContent,
        });
        toast.success("Password created successfully!");
      }

      await loadPasswords();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving password:", error);
      toast.error("Failed to save password");
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
      const passwordData: PasswordData = JSON.parse(decryptedContent);

      setEditingPassword(item);
      setTitle(item.title);
      setUsername(passwordData.username);
      setPassword(passwordData.password);
      setWebsite(passwordData.website);
      setNotes(passwordData.notes);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error decrypting password:", error);
      toast.error("Failed to decrypt password");
    }
  };

  const handleDelete = async (item: VaultItem) => {
    if (!confirm("Are you sure you want to delete this password?")) return;

    try {
      await PouchDBService.deleteItem(item._id, item._rev ?? "");
      toast.success("Password deleted successfully!");
      await loadPasswords();
    } catch (error) {
      console.error("Error deleting password:", error);
      toast.error("Failed to delete password");
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPassword(null);
    setTitle("");
    setUsername("");
    setPassword("");
    setWebsite("");
    setNotes("");
    setShowPassword(false);
  };

  const handleGeneratePassword = () => {
    const generated = EncryptionService.generatePassword(16);
    setPassword(generated);
    toast.success("Strong password generated!");
  };

  const handleCopyPassword = async (item: VaultItem) => {
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
      const passwordData: PasswordData = JSON.parse(decryptedContent);

      await navigator.clipboard.writeText(passwordData.password);
      toast.success("Password copied to clipboard!");
    } catch (error) {
      console.error("Error copying password:", error);
      toast.error("Failed to copy password");
    }
  };

  const filteredPasswords = searchQuery
    ? passwords.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : passwords;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading passwords...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search passwords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingPassword(null);
                setTitle("");
                setUsername("");
                setPassword("");
                setWebsite("");
                setNotes("");
              }}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Password
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPassword ? "Edit Password" : "Create New Password"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title / Service Name</Label>
                <Input
                  id="title"
                  placeholder="e.g., Gmail, Netflix, Work Email"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website / URL</Label>
                <Input
                  id="website"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username / Email</Label>
                <Input
                  id="username"
                  placeholder="your@email.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button type="button" variant="outline" onClick={handleGeneratePassword}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Additional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!title || !password}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {editingPassword ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filteredPasswords.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Key className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No passwords yet</h3>
          <p className="text-gray-600 mb-6">Store your first password securely</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPasswords.map((item) => (
            <Card
              key={item._id}
              className="p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{item.title}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Updated: {new Date(item.updatedAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyPassword(item)}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
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

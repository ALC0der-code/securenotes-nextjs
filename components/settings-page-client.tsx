
"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "./dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User, Lock, Bell, Smartphone, Trash2, Download, Upload, Database, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";

export default function SettingsPageClient() {
  const { data: session } = useSession() || {};
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  const handleChangeMasterPassword = () => {
    sessionStorage.removeItem("masterPassword");
    toast.success("Master password cleared. You'll be prompted to set a new one.");
    window.location.reload();
  };

  const handleExportData = async () => {
    try {
      const PouchDB = (await import("pouchdb-browser")).default;
      const db = new PouchDB("securenotes");
      
      // Get all documents from the database
      const result = await db.allDocs({ include_docs: true });
      const documents = result.rows.map(row => row.doc);
      
      // Create export data object
      const exportData = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        data: documents
      };
      
      // Create a blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `securenotes-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${documents.length} items successfully!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      // Validate the import data structure
      if (!importData.data || !Array.isArray(importData.data)) {
        toast.error("Invalid import file format");
        return;
      }

      const PouchDB = (await import("pouchdb-browser")).default;
      const db = new PouchDB("securenotes");
      
      let imported = 0;
      let skipped = 0;
      
      // Import each document
      for (const doc of importData.data) {
        try {
          // Check if document already exists
          try {
            const existing = await db.get(doc._id);
            // Document exists, update it
            await db.put({ ...doc, _rev: existing._rev });
            imported++;
          } catch (err) {
            // Document doesn't exist, create it
            await db.put(doc);
            imported++;
          }
        } catch (error) {
          console.error(`Failed to import document ${doc._id}:`, error);
          skipped++;
        }
      }
      
      toast.success(`Imported ${imported} items successfully! ${skipped > 0 ? `(${skipped} skipped)` : ''}`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Reload to reflect changes
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import data. Please check the file format.");
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      
      // Parse CSV using PapaParse
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const PouchDB = (await import("pouchdb-browser")).default;
            const db = new PouchDB("securenotes");
            
            let imported = 0;
            let skipped = 0;
            
            // Process each row from Evernote CSV
            for (const row of results.data as any[]) {
              try {
                // Evernote CSV typically has columns like: Title, Content, Created, Updated, Tags, URL
                const title = row.Title || row.title || row.Name || row.name || "Untitled";
                const content = row.Content || row.content || row.Body || row.body || "";
                const tags = row.Tags || row.tags || "";
                const url = row.URL || row.url || row.Link || row.link || "";
                
                // Determine type based on content
                let docType = "note";
                if (url && url.trim()) {
                  docType = "link";
                }
                
                // Create document in PouchDB format
                const doc = {
                  _id: `${docType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  type: docType,
                  title: title,
                  content: content,
                  url: url || undefined,
                  tags: tags ? tags.split(",").map((t: string) => t.trim()).filter((t: string) => t) : [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  favorite: false
                };
                
                // Save to database
                await db.put(doc);
                imported++;
              } catch (error) {
                console.error("Failed to import row:", row, error);
                skipped++;
              }
            }
            
            toast.success(`Imported ${imported} items from CSV! ${skipped > 0 ? `(${skipped} skipped)` : ''}`);
            
            // Reset file input
            if (csvFileInputRef.current) {
              csvFileInputRef.current.value = '';
            }
            
            // Reload to reflect changes
            setTimeout(() => window.location.reload(), 1500);
          } catch (error) {
            console.error("CSV import error:", error);
            toast.error("Failed to import CSV data");
            
            // Reset file input
            if (csvFileInputRef.current) {
              csvFileInputRef.current.value = '';
            }
          }
        },
        error: (error: any) => {
          console.error("CSV parsing error:", error);
          toast.error("Failed to parse CSV file. Please check the format.");
          
          // Reset file input
          if (csvFileInputRef.current) {
            csvFileInputRef.current.value = '';
          }
        }
      });
    } catch (error) {
      console.error("CSV import error:", error);
      toast.error("Failed to import CSV file");
      
      // Reset file input
      if (csvFileInputRef.current) {
        csvFileInputRef.current.value = '';
      }
    }
  };

  const handleClearData = async () => {
    if (confirm("Are you sure you want to clear all your data? This cannot be undone.")) {
      try {
        const PouchDB = (await import("pouchdb-browser")).default;
        const db = new PouchDB("securenotes");
        await db.destroy();
        toast.success("All data cleared successfully");
        window.location.reload();
      } catch (error) {
        toast.error("Failed to clear data");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input 
                  type="email" 
                  value={session?.user?.email || ""} 
                  disabled 
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Name</Label>
                <Input 
                  type="text" 
                  value={session?.user?.name || ""} 
                  disabled 
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <Switch 
                  checked={twoFactor}
                  onCheckedChange={setTwoFactor}
                />
              </div>
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleChangeMasterPassword}
                  className="w-full"
                >
                  Change Master Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Notifications</p>
                  <p className="text-sm text-gray-500">Receive updates about your vault</p>
                </div>
                <Switch 
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Management
              </CardTitle>
              <CardDescription>Import and export your vault data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-start gap-2 mb-2">
                  <Download className="w-5 h-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">Export Data</p>
                    <p className="text-sm text-gray-500">Download all your notes, passwords, and links as a JSON file</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleExportData}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All Data
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-start gap-2 mb-2">
                  <Upload className="w-5 h-5 text-green-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">Import Data (JSON)</p>
                    <p className="text-sm text-gray-500">Restore your data from a previously exported JSON file</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import JSON File
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-start gap-2 mb-2">
                  <FileSpreadsheet className="w-5 h-5 text-teal-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">Import from Evernote (CSV)</p>
                    <p className="text-sm text-gray-500">Import notebooks from Evernote CSV export files</p>
                  </div>
                </div>
                <input
                  ref={csvFileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => csvFileInputRef.current?.click()}
                  className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Import CSV from Evernote
                </Button>
                <p className="text-xs text-gray-400 mt-2">
                  Supports standard Evernote CSV format with Title, Content, Tags, and URL columns
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={handleClearData}
                className="w-full"
              >
                Clear All Data
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                This will permanently delete all your notes, passwords, and links from this device.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

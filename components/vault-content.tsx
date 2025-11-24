
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Key, Link as LinkIcon } from "lucide-react";
import { NotesTab } from "./vault-tabs/notes-tab";
import { PasswordsTab } from "./vault-tabs/passwords-tab";
import { LinksTab } from "./vault-tabs/links-tab";

interface VaultContentProps {
  defaultTab?: "notes" | "passwords" | "links";
}

export function VaultContent({ defaultTab = "notes" }: VaultContentProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Encrypted Vault</h1>
        <p className="text-gray-600 mt-2">All your data is encrypted and secure</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="passwords" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">Passwords</span>
          </TabsTrigger>
          <TabsTrigger value="links" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Links</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <NotesTab />
        </TabsContent>

        <TabsContent value="passwords">
          <PasswordsTab />
        </TabsContent>

        <TabsContent value="links">
          <LinksTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

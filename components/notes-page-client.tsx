
"use client";

import { DashboardLayout } from "./dashboard-layout";
import { VaultContent } from "./vault-content";

export default function NotesPageClient() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Notes</h1>
        <VaultContent defaultTab="notes" />
      </div>
    </DashboardLayout>
  );
}

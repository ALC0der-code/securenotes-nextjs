
"use client";

import { DashboardLayout } from "./dashboard-layout";
import { VaultContent } from "./vault-content";

export default function LinksPageClient() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Links</h1>
        <VaultContent defaultTab="links" />
      </div>
    </DashboardLayout>
  );
}

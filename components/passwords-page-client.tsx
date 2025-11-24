
"use client";

import { DashboardLayout } from "./dashboard-layout";
import { VaultContent } from "./vault-content";

export default function PasswordsPageClient() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Passwords</h1>
        <VaultContent defaultTab="passwords" />
      </div>
    </DashboardLayout>
  );
}

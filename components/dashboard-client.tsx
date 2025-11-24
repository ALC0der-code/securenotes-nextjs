"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MasterPasswordSetup } from "./master-password-setup";
import { DashboardHeader } from "./dashboard-header";

const VaultContent = dynamic(() => import("./vault-content").then(mod => ({ default: mod.VaultContent })), {
  ssr: false,
  loading: () => (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading vault...</p>
    </div>
  ),
});

export default function DashboardClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [hasMasterPassword, setHasMasterPassword] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    // Check if master password is already set
    const storedMasterPassword = sessionStorage.getItem("masterPassword");
    if (storedMasterPassword) {
      setHasMasterPassword(true);
    }
    setIsChecking(false);
  }, [status, router]);

  const handleMasterPasswordComplete = () => {
    setHasMasterPassword(true);
  };

  if (status === "loading" || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasMasterPassword) {
    return <MasterPasswordSetup onComplete={handleMasterPasswordComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <DashboardHeader />
      <VaultContent />
    </div>
  );
}

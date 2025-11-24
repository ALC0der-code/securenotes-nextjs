"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MasterPasswordSetup } from "./master-password-setup";
import { DashboardLayout } from "./dashboard-layout";
import { DashboardOverview } from "./dashboard-overview";

export default function DashboardClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [hasMasterPassword, setHasMasterPassword] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [counts, setCounts] = useState({
    notes: 0,
    passwords: 0,
    links: 0
  });

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

  useEffect(() => {
    // Load counts from PouchDB
    const loadCounts = async () => {
      try {
        if (typeof window !== "undefined" && hasMasterPassword) {
          const PouchDB = (await import("pouchdb-browser")).default;
          const db = new PouchDB("securenotes");
          
          const result = await db.allDocs({ include_docs: true });
          const docs = result.rows.map(row => row.doc);
          
          const notesCount = docs.filter((doc: any) => doc?.type === "note").length;
          const passwordsCount = docs.filter((doc: any) => doc?.type === "password").length;
          const linksCount = docs.filter((doc: any) => doc?.type === "link").length;
          
          setCounts({
            notes: notesCount,
            passwords: passwordsCount,
            links: linksCount
          });
        }
      } catch (error) {
        console.error("Error loading counts:", error);
      }
    };

    loadCounts();
    
    // Refresh counts every 5 seconds
    const interval = setInterval(loadCounts, 5000);
    return () => clearInterval(interval);
  }, [hasMasterPassword]);

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
    <DashboardLayout>
      <DashboardOverview 
        notesCount={counts.notes}
        passwordsCount={counts.passwords}
        linksCount={counts.links}
      />
    </DashboardLayout>
  );
}

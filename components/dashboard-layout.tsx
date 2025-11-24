
"use client";

import { useEffect, useState } from "react";
import { SidebarNav } from "./sidebar-nav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [counts, setCounts] = useState({
    notes: 0,
    passwords: 0,
    links: 0
  });

  useEffect(() => {
    // Load counts from PouchDB
    const loadCounts = async () => {
      try {
        if (typeof window !== "undefined") {
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
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SidebarNav 
        notesCount={counts.notes}
        passwordsCount={counts.passwords}
        linksCount={counts.links}
      />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

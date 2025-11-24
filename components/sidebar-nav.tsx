
"use client";

import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { 
  LayoutDashboard, 
  FileText, 
  Lock, 
  Link as LinkIcon, 
  Plus, 
  RefreshCw, 
  Settings,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SidebarNavProps {
  notesCount?: number;
  passwordsCount?: number;
  linksCount?: number;
}

export function SidebarNav({ notesCount = 0, passwordsCount = 0, linksCount = 0 }: SidebarNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { 
      icon: LayoutDashboard, 
      label: "Dashboard", 
      path: "/dashboard",
      count: null 
    },
    { 
      icon: FileText, 
      label: "Notes", 
      path: "/dashboard/notes",
      count: notesCount 
    },
    { 
      icon: Lock, 
      label: "Passwords", 
      path: "/dashboard/passwords",
      count: passwordsCount 
    },
    { 
      icon: LinkIcon, 
      label: "Links", 
      path: "/dashboard/links",
      count: linksCount 
    },
  ];

  const handleSync = () => {
    // Trigger sync functionality
    window.location.reload();
  };

  const handleSignOut = async () => {
    sessionStorage.removeItem("masterPassword");
    await signOut({ callbackUrl: "/signin" });
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="SecureNotes Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SecureNotes</h1>
            <p className="text-xs text-gray-500">Your secure vault</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.count !== null && (
                <Badge 
                  variant={isActive ? "secondary" : "outline"}
                  className={isActive ? "bg-blue-500 text-white" : ""}
                >
                  {item.count}
                </Badge>
              )}
            </button>
          );
        })}

        {/* Create New Button */}
        <Button 
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => router.push("/dashboard")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New
        </Button>

        {/* Sync Button */}
        <Button 
          variant="outline"
          className="w-full mt-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          onClick={handleSync}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync
        </Button>
      </nav>

      {/* Settings & Logout */}
      <div className="p-3 border-t border-gray-200 space-y-1">
        <button
          onClick={() => router.push("/dashboard/settings")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

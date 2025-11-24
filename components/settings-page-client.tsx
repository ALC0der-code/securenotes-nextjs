
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "./dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User, Lock, Bell, Smartphone, Trash2 } from "lucide-react";

export default function SettingsPageClient() {
  const { data: session } = useSession() || {};
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleChangeMasterPassword = () => {
    sessionStorage.removeItem("masterPassword");
    toast.success("Master password cleared. You'll be prompted to set a new one.");
    window.location.reload();
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

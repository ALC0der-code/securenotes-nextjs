
"use client";

import { useState, useEffect } from "react";
import { FileText, Lock, Link as LinkIcon, BarChart3, Upload, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DashboardOverviewProps {
  notesCount: number;
  passwordsCount: number;
  linksCount: number;
  recentItems?: any[];
}

export function DashboardOverview({ 
  notesCount = 0, 
  passwordsCount = 0, 
  linksCount = 0,
  recentItems = []
}: DashboardOverviewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const totalItems = notesCount + passwordsCount + linksCount;

  const stats = [
    { icon: FileText, label: "Notes", count: notesCount, color: "text-pink-500 bg-pink-50" },
    { icon: Lock, label: "Passwords", count: passwordsCount, color: "text-orange-500 bg-orange-50" },
    { icon: LinkIcon, label: "Links", count: linksCount, color: "text-purple-500 bg-purple-50" },
    { icon: BarChart3, label: "All Items", count: totalItems, color: "text-blue-500 bg-blue-50" },
  ];

  return (
    <div className="flex-1 overflow-auto">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 p-8 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to SecureNotes</h1>
            <p className="text-blue-50">Your secure vault for notes, passwords, and links</p>
          </div>
          <Button 
            variant="secondary" 
            className="bg-white text-gray-700 hover:bg-gray-100"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search everything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-lg"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.count}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Items</h2>
          {recentItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">No items yet. Create your first item!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentItems.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.type}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{item.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";

export function GmailApp() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <div className="text-xl font-normal text-gray-600">Gmail</div>
          </div>

          {/* Search bar */}
          <div className="relative mx-4 flex-1 max-w-2xl">
            <Input
              placeholder="Search mail"
              className="h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-64 bg-white p-4">
            <Button className="w-full mb-4">作成</Button>
            <div className="space-y-2">
              <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">受信トレイ</div>
              <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">送信済み</div>
              <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">下書き</div>
            </div>
          </div>

          {/* Email list */}
          <div className="flex-1">
            <ScrollArea className="h-full">
              <div className="p-4">
                <div className="space-y-2">
                  <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <div className="font-medium">テストメール</div>
                    <div className="text-sm text-gray-600">これはテストメールです</div>
                  </div>
                  <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <div className="font-medium">重要なメール</div>
                    <div className="text-sm text-gray-600">重要な内容が含まれています</div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
} 
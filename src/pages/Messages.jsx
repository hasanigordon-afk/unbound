import React from "react";
import { MessageCircle } from "lucide-react";

export default function Messages() {
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Messages</h1>
        <p className="text-slate-500 text-sm">Your conversations</p>
      </div>
      <div className="px-5">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <MessageCircle className="w-7 h-7 text-blue-400" />
          </div>
          <p className="text-slate-500 font-medium">No messages yet</p>
          <p className="text-slate-400 text-sm mt-1">Connect with a mentor to start chatting</p>
        </div>
      </div>
    </div>
  );
}
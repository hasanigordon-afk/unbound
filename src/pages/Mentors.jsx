import React from "react";
import { Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Mentors() {
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Mentors</h1>
        <p className="text-slate-500 text-sm">Find someone who understands</p>
      </div>
      <div className="px-5">
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search mentors..." className="pl-10 h-12 rounded-xl bg-white" />
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-teal-400" />
          </div>
          <p className="text-slate-500 font-medium">Mentor matching coming soon</p>
          <p className="text-slate-400 text-sm mt-1">We're building your perfect match system</p>
        </div>
      </div>
    </div>
  );
}
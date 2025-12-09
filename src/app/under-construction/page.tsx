"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function UnderConstruction() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 text-zinc-900 px-4">
      <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-10 max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-zinc-800">
          🚧 Page Under Construction
        </h1>
        <p className="text-zinc-600 mb-6">
          Sorry, this page is not ready yet. We are working hard to bring it to
          you soon!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}

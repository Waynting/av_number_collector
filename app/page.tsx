import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-6">
          AV Playlist Manager
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Organize your video code collections with ease. Create playlists, share with friends,
          and auto-complete with your preferred sources.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold text-lg mb-2">📋 ID-First Management</h3>
            <p className="text-slate-600 text-sm">
              Organize by video codes, not URLs. Independent of any single source.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold text-lg mb-2">🔗 Smart Auto-Complete</h3>
            <p className="text-slate-600 text-sm">
              Set your preferred sources and auto-generate full URLs from codes.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold text-lg mb-2">🚀 Easy Sharing</h3>
            <p className="text-slate-600 text-sm">
              Export as text or share public playlists with custom URLs.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

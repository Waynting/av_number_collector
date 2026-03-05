import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-6">
          AV Number Collector
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          輕鬆管理你的番號收藏。建立播放清單、分享給朋友，
          並自動生成你偏好的影片網址。
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold text-lg mb-2">📋 番號優先管理</h3>
            <p className="text-slate-600 text-sm">
              以番號為核心整理收藏，不依賴特定影片網站，永久保存你的清單。
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold text-lg mb-2">🔗 智慧網址生成</h3>
            <p className="text-slate-600 text-sm">
              設定你喜歡的影片網站，一鍵從番號生成完整網址。
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold text-lg mb-2">🚀 輕鬆分享</h3>
            <p className="text-slate-600 text-sm">
              匯出文字清單或生成公開分享連結，與朋友分享你的收藏。
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

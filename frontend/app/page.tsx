import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 p-6 text-center">
      <div className="max-w-2xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-zinc-900">
            Test Kak Kak
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 max-w-lg mx-auto">
            ระบบการมอบหมายและรายงานผลที่ทันสมัย เรียบง่าย รวดเร็ว และมีประสิทธิภาพ
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50"
          >
            เริ่มต้นใช้งาน
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/about"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50"
          >
            เรียนรู้เพิ่มเติม
          </Link>
        </div>
      </div>
      
      <footer className="absolute bottom-6 text-zinc-400 text-sm">
        © 2569 Test Kak Kak สงวนลิขสิทธิ์
      </footer>
    </div>
  )
}

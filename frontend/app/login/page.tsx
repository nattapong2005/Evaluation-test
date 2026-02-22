"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  Sparkles,
  ClipboardCheck,
  BarChart3,
  Shield,
} from "lucide-react"
import Cookies from "js-cookie"
import { cn } from "@/lib/utils"
import { Toast } from "@/components/SweetAlert"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email")
    const password = formData.get("password")

    try {
      const response = await fetch(`http://localhost:5000/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || "Something went wrong")
      }

      Cookies.set("token", data.token, { expires: 1 })
      Cookies.set("role", data.role, { expires: 1 })
      Cookies.set("name", data.name, { expires: 1 })

      Toast.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
      })

      router.push("/dashboard")
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ═══════════════ LEFT — Login Form ═══════════════ */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Logo / brand */}
          <Link href="/" className="inline-flex items-center gap-2.5 mb-12 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900">
              EvalPro
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
              ยินดีต้อนรับกลับ
            </h1>
            <p className="text-[15px] text-zinc-500 mt-2">
              เข้าสู่ระบบเพื่อจัดการการประเมินบุคลากร
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-zinc-700"
              >
                อีเมล
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400" />
                <input
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  className={cn(
                    "flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2 pl-11 text-sm text-zinc-900",
                    "placeholder:text-zinc-400",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "transition-all duration-200"
                  )}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-zinc-700"
                >
                  รหัสผ่าน
                </label>
                <a
                  href="#"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  ลืมรหัสผ่าน?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={isLoading}
                  className={cn(
                    "flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2 pl-11 pr-11 text-sm text-zinc-900",
                    "placeholder:text-zinc-400",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "transition-all duration-200"
                  )}
                  placeholder="************"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
            </div>



            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={isLoading}
              className={cn(
                "inline-flex w-full items-center justify-center rounded-xl text-[15px] font-semibold transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                "disabled:pointer-events-none disabled:opacity-50",
                "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40",
                "h-12 px-4"
              )}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              เข้าสู่ระบบ
            </button>
          </form>

          {/* Register link */}
          <div className="mt-8 text-center text-sm">
            <span className="text-zinc-500">ยังไม่มีบัญชี? </span>
            <Link
              href="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════ RIGHT — Branded Panel ═══════════════ */}
      <div className="hidden lg:flex flex-1 relative bg-indigo-600 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700" />

          {/* Decorative circles */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/[0.07]" />
          <div className="absolute top-1/3 -left-20 w-64 h-64 rounded-full bg-white/[0.05]" />
          <div className="absolute -bottom-24 right-1/4 w-80 h-80 rounded-full bg-white/[0.06]" />
          <div className="absolute top-2/3 right-10 w-40 h-40 rounded-full bg-white/[0.04]" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center px-12 xl:px-20 w-full">
          {/* Main text */}
          <div className="text-center max-w-md">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <span className="text-sm font-medium text-white/90">ระบบพร้อมใช้งาน</span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              ระบบประเมินบุคลากร
              <br />
              <span className="text-indigo-200">ที่ทันสมัยและง่ายดาย</span>
            </h2>
            <p className="mt-5 text-indigo-100/80 text-[15px] leading-relaxed">
              จัดการการประเมินผลบุคลากรอย่างเป็นระบบ
              มีประสิทธิภาพ โปร่งใส และตรวจสอบได้
            </p>
          </div>

          {/* Feature highlights */}
          <div className="mt-12 grid gap-4 w-full max-w-sm">
            {[
              {
                icon: ClipboardCheck,
                title: "ประเมินออนไลน์",
                desc: "สร้างแบบประเมินได้อย่างยืดหยุ่น",
              },
              {
                icon: BarChart3,
                title: "รายงานเรียลไทม์",
                desc: "ดูผลคะแนนและวิเคราะห์ข้อมูลทันที",
              },
              {
                icon: Shield,
                title: "ปลอดภัยสูง",
                desc: "เข้ารหัสข้อมูลและแบ่งสิทธิ์การเข้าถึง",
              },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.1] hover:bg-white/[0.12] transition-colors duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="text-xs text-indigo-200/70 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom text */}
          <p className="mt-12 text-xs text-indigo-200/50 font-medium">
            © {new Date().getFullYear()} EvalPro — ระบบประเมินบุคลากรออนไลน์
          </p>
        </div>
      </div>
    </div>
  )
}

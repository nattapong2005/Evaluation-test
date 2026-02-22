"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Loader2,
  AlertCircle,
  Sparkles,
  Users,
  CheckCircle2,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name")
    const email = formData.get("email")
    const password = formData.get("password")
    const role = formData.get("role")

    try {
      const response = await fetch(`http://localhost:5000/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: role || "EVALUATEE",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      router.push("/login?registered=true")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ═══════════════ LEFT — Register Form ═══════════════ */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Logo / brand */}
          <Link href="/" className="inline-flex items-center gap-2.5 mb-10 group">
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
              สร้างบัญชีใหม่
            </h1>
            <p className="text-[15px] text-zinc-500 mt-2">
              เข้าร่วมกับเราเพื่อเริ่มจัดการการประเมินบุคลากร
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-semibold text-zinc-700"
              >
                ชื่อ-นามสกุล
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400" />
                <input
                  id="name"
                  name="name"
                  placeholder="สมชาย รักดี"
                  type="text"
                  autoComplete="name"
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

            {/* Role */}
            <div className="space-y-2">
              <label
                htmlFor="role"
                className="text-sm font-semibold text-zinc-700"
              >
                ตำแหน่ง
              </label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400 pointer-events-none" />
                <select
                  id="role"
                  name="role"
                  disabled={isLoading}
                  className={cn(
                    "flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2 pl-11 text-sm text-zinc-900 appearance-none",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "transition-all duration-200"
                  )}
                  required
                >
                  <option value="EVALUATEE">ผู้ถูกประเมิน</option>
                  <option value="EVALUATOR">ผู้ประเมิน</option>
                  <option value="ADMIN">ผู้ดูแลระบบ</option>
                </select>
                {/* Custom dropdown arrow */}
                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-zinc-700"
              >
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
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

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="register-submit"
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
              สมัครสมาชิก
            </button>
          </form>

          {/* Login link */}
          <div className="mt-8 text-center text-sm">
            <span className="text-zinc-500">มีบัญชีอยู่แล้ว? </span>
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              เข้าสู่ระบบ
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
              <Zap className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white/90">เริ่มต้นใน 1 นาที</span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              เข้าร่วมกับเรา
              <br />
              <span className="text-indigo-200">เพื่อการประเมินที่ดีกว่า</span>
            </h2>
            <p className="mt-5 text-indigo-100/80 text-[15px] leading-relaxed">
              สมัครเพื่อเข้าถึงระบบประเมินบุคลากรที่ครบครัน
              ใช้งานง่าย และมีประสิทธิภาพสูง
            </p>
          </div>

          {/* Benefits */}
          <div className="mt-12 space-y-4 w-full max-w-sm">
            {[
              "ลงทะเบียนฟรี ไม่มีค่าใช้จ่ายเพิ่ม",
              "เข้าถึงรายงานและวิเคราะห์ได้ทันที",
              "รองรับทุกบทบาท — ผู้ประเมิน, ผู้ถูกประเมิน, ผู้ดูแล",
              "ข้อมูลปลอดภัยด้วยระบบเข้ารหัส",
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.1]"
              >
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-medium text-white/90">{text}</p>
              </div>
            ))}
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

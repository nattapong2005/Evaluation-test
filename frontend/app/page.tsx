"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  ArrowRight,
  ClipboardCheck,
  BarChart3,
  Users,
  Shield,
  Sparkles,
  ChevronDown,
} from "lucide-react"

/* ───────────────────────────── animated counter ───────────────────────────── */
function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const start = 0
          const startTime = performance.now()

          const animate = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
            setCount(Math.floor(start + (end - start) * eased))
            if (progress < 1) requestAnimationFrame(animate)
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

/* ───────────────────────── fade‑in on scroll wrapper ──────────────────────── */
function FadeInSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/* ═══════════════════════════════ MAIN PAGE ═══════════════════════════════ */
export default function Home() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /* ────── features data ────── */
  const features = [
    {
      icon: ClipboardCheck,
      title: "ประเมินออนไลน์",
      desc: "สร้างแบบประเมินได้อย่างยืดหยุ่น กำหนดตัวชี้วัดและเกณฑ์การให้คะแนนตามต้องการ",
      color: "from-indigo-500 to-violet-500",
      bg: "bg-indigo-50",
      text: "text-indigo-600",
    },
    {
      icon: BarChart3,
      title: "รายงานผลแบบเรียลไทม์",
      desc: "ดูสรุปผลคะแนนและวิเคราะห์ข้อมูลแบบเรียลไทม์ พร้อมกราฟและแผนภูมิที่เข้าใจง่าย",
      color: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      icon: Users,
      title: "จัดการบุคลากร",
      desc: "บริหารจัดการรายชื่อผู้ประเมินและผู้ถูกประเมิน พร้อมมอบหมายงานได้อย่างง่ายดาย",
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    {
      icon: Shield,
      title: "ปลอดภัย & น่าเชื่อถือ",
      desc: "ระบบรักษาความปลอดภัยข้อมูลด้วยการเข้ารหัสและแบ่งระดับสิทธิ์การเข้าถึง",
      color: "from-rose-500 to-pink-500",
      bg: "bg-rose-50",
      text: "text-rose-600",
    },
  ]

  const stats = [
    { value: 100, suffix: "+", label: "บุคลากรในระบบ" },
    { value: 50, suffix: "+", label: "แบบประเมิน" },
    { value: 99, suffix: "%", label: "ความพึงพอใจ" },
    { value: 24, suffix: "/7", label: "พร้อมให้บริการ" },
  ]

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* ═══════════════ NAVBAR ═══════════════ */}
      <nav
        className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrollY > 50 ? "rgba(255,255,255,.85)" : "transparent",
          backdropFilter: scrollY > 50 ? "blur(16px) saturate(180%)" : "none",
          borderBottom: scrollY > 50 ? "1px solid rgba(0,0,0,.06)" : "1px solid transparent",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900">
              EvalPro
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors rounded-xl hover:bg-zinc-100"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10 hover:shadow-zinc-900/20"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
        {/* background decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* gradient orbs */}
          <div
            className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-[0.12]"
            style={{
              background: "radial-gradient(circle, #818cf8, transparent 70%)",
              transform: `translateY(${scrollY * 0.08}px)`,
            }}
          />
          <div
            className="absolute top-1/2 -left-60 w-[500px] h-[500px] rounded-full opacity-[0.1]"
            style={{
              background: "radial-gradient(circle, #a78bfa, transparent 70%)",
              transform: `translateY(${scrollY * -0.05}px)`,
            }}
          />
          <div
            className="absolute bottom-0 right-1/3 w-[350px] h-[350px] rounded-full opacity-[0.08]"
            style={{
              background: "radial-gradient(circle, #f472b6, transparent 70%)",
              transform: `translateY(${scrollY * -0.03}px)`,
            }}
          />
          {/* grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)
              `,
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* badge */}
          <FadeInSection>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              <span className="text-sm font-medium text-indigo-700">ระบบประเมินบุคลากรออนไลน์ เวอร์ชันใหม่</span>
            </div>
          </FadeInSection>

          {/* heading */}
          <FadeInSection delay={100}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-900 leading-[1.1]">
              ประเมินบุคลากร
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                อย่างมีประสิทธิภาพ
              </span>
            </h1>
          </FadeInSection>

          {/* description */}
          <FadeInSection delay={200}>
            <p className="mt-6 text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              ระบบประเมินผลที่ออกแบบมาเพื่อให้การประเมินบุคลากรเป็นเรื่องง่าย
              <br className="hidden sm:block" />
              รวดเร็ว โปร่งใส และตรวจสอบได้ ด้วยเทคโนโลยีที่ทันสมัย
            </p>
          </FadeInSection>

          {/* CTA buttons */}
          <FadeInSection delay={300}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                id="hero-cta-primary"
                className="group inline-flex h-14 items-center justify-center rounded-2xl bg-zinc-900 px-8 text-[15px] font-semibold text-white shadow-2xl shadow-zinc-900/20 hover:shadow-zinc-900/30 hover:bg-zinc-800 transition-all"
              >
                เริ่มต้นใช้งาน
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#features"
                id="hero-cta-secondary"
                className="inline-flex h-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white/80 backdrop-blur-sm px-8 text-[15px] font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 transition-all"
              >
                ดูฟีเจอร์ทั้งหมด
              </Link>
            </div>
          </FadeInSection>

          {/* scroll indicator */}
          <FadeInSection delay={600}>
            <div className="mt-16 flex flex-col items-center gap-2 animate-bounce">
              <span className="text-xs text-zinc-400 font-medium tracking-wider uppercase">เลื่อนลง</span>
              <ChevronDown className="w-5 h-5 text-zinc-300" />
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="features" className="relative py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <span className="text-sm font-bold tracking-widest uppercase text-indigo-500">ฟีเจอร์</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                ทุกสิ่งที่คุณต้องการ
              </h2>
              <p className="mt-4 text-zinc-500 max-w-lg mx-auto">
                ครบครันด้วยเครื่องมือที่ช่วยให้การประเมินบุคลากรเป็นเรื่องง่ายและมีประสิทธิภาพ
              </p>
            </div>
          </FadeInSection>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <FadeInSection key={i} delay={i * 100}>
                  <div className="group relative p-8 rounded-3xl bg-white border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-500 hover:-translate-y-1 cursor-default">
                    {/* glow on hover */}
                    <div
                      className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`}
                    />

                    <div className="relative">
                      <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-5`}>
                        <Icon className={`w-7 h-7 ${f.text}`} />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 mb-2">{f.title}</h3>
                      <p className="text-zinc-500 leading-relaxed text-[15px]">{f.desc}</p>
                    </div>
                  </div>
                </FadeInSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="py-24 px-6 bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                ตัวเลขที่พูดแทน
              </h2>
              <p className="mt-4 text-zinc-400 max-w-lg mx-auto">
                เรามุ่งมั่นในการพัฒนาระบบให้ตอบโจทย์ทุกความต้องการ
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <FadeInSection key={i} delay={i * 100}>
                <div className="text-center">
                  <p className="text-4xl sm:text-5xl font-black text-white">
                    <AnimatedCounter end={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-2 text-sm text-zinc-500 font-medium">{s.label}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <span className="text-sm font-bold tracking-widest uppercase text-indigo-500">ขั้นตอน</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                ใช้งานง่ายใน 3 ขั้นตอน
              </h2>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "สร้างแบบประเมิน",
                desc: "กำหนดหัวข้อ ตัวชี้วัด และเกณฑ์การให้คะแนนตามความต้องการ",
              },
              {
                step: "02",
                title: "มอบหมายผู้ประเมิน",
                desc: "เลือกผู้ประเมินและผู้ถูกประเมิน จากนั้นกำหนดช่วงเวลา",
              },
              {
                step: "03",
                title: "ดูผลลัพธ์",
                desc: "รับผลการประเมินแบบเรียลไทม์ พร้อมรายงานสรุปและกราฟวิเคราะห์",
              },
            ].map((item, i) => (
              <FadeInSection key={i} delay={i * 150}>
                <div className="relative text-center px-6 py-10">
                  {/* step number */}
                  <span className="text-7xl font-black text-zinc-100 select-none">{item.step}</span>
                  <h3 className="mt-4 text-xl font-bold text-zinc-900">{item.title}</h3>
                  <p className="mt-3 text-zinc-500 text-[15px] leading-relaxed">{item.desc}</p>

                  {/* connector line */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-zinc-200" />
                  )}
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <section className="py-24 px-6">
        <FadeInSection>
          <div className="max-w-4xl mx-auto relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-12 md:p-16 text-center shadow-2xl shadow-indigo-600/20">
            {/* decorative circles */}
            <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/10" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                พร้อมเริ่มต้นใช้งานแล้วหรือยัง?
              </h2>
              <p className="mt-4 text-indigo-100 max-w-lg mx-auto text-lg">
                เข้าสู่ระบบเพื่อเริ่มต้นประเมินบุคลากรอย่างมืออาชีพ
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/login"
                  id="cta-get-started"
                  className="group inline-flex h-14 items-center justify-center rounded-2xl bg-white px-8 text-[15px] font-bold text-indigo-700 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
                >
                  เข้าสู่ระบบ
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/register"
                  id="cta-register"
                  className="inline-flex h-14 items-center justify-center rounded-2xl border-2 border-white/30 px-8 text-[15px] font-bold text-white hover:bg-white/10 transition-all"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-zinc-100 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-zinc-900">EvalPro</span>
          </div>
          <p className="text-sm text-zinc-400">
            © {new Date().getFullYear()} EvalPro — ระบบประเมินบุคลากรออนไลน์
          </p>
        </div>
      </footer>
    </div>
  )
}

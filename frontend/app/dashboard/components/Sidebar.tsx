"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, UserCheck, ClipboardList, Users, ShieldAlert, BadgeCheck, User } from "lucide-react"
import { cn } from "@/lib/utils"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation" 

const adminNavs = [
    { name: "ภาพรวมระบบ", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "จัดการการประเมิน", href: "/dashboard/admin/evaluations", icon: BookOpen },
    { name: "จัดการผู้ใช้งาน", href: "/dashboard/admin/users", icon: Users },
]

const evaluatorNavs = [
    { name: "ภาพรวมการประเมิน", href: "/dashboard/evaluator", icon: LayoutDashboard },
    { name: "ประเมินผู้ถูกประเมิน", href: "/dashboard/evaluator/assignments", icon: UserCheck },
]

const evaluateeNavs = [
    { name: "ภาพรวมของฉัน", href: "/dashboard/evaluatee", icon: LayoutDashboard },
    { name: "การประเมินของฉัน", href: "/dashboard/evaluatee/assignments", icon: ClipboardList },
]

export default function Sidebar({ role, setSidebarOpen }: { role: string, setSidebarOpen: (open: boolean) => void }) {
    const pathname = usePathname()
    const navs = role === "ADMIN" ? adminNavs : role === "EVALUATOR" ? evaluatorNavs : evaluateeNavs

    const getRoleInfo = () => {
        switch (role) {
            case "ADMIN": return { label: "ผู้ดูแลระบบ", icon: ShieldAlert, color: "text-purple-600", bg: "bg-purple-100" };
            case "EVALUATOR": return { label: "ผู้ประเมิน", icon: BadgeCheck, color: "text-blue-600", bg: "bg-blue-100" };
            default: return { label: "ผู้ถูกประเมิน", icon: User, color: "text-amber-600", bg: "bg-amber-100" };
        }
    }

    const roleInfo = getRoleInfo()


        const router = useRouter()
    const handleLogout = () => {
        Cookies.remove("token")
        Cookies.remove("user")
        Cookies.remove("role")
        Cookies.remove("name")
        router.push("/login")
    }

    return (
        <aside className="w-full h-full flex flex-col bg-zinc-50/50 border-r border-zinc-200">
            {/* Header / Brand Area */}
            <div className="p-6">
                <div className="flex items-center gap-3 px-2 mb-8">
                    <div className={cn("p-2.5 rounded-lg", roleInfo.bg)}>
                        <roleInfo.icon className={cn("h-5 w-5", roleInfo.color)} />
                    </div>
                    <div>
                        <h2 className="font-black text-zinc-900 text-md tracking-tight leading-none">ระบบประเมินบุคลากร</h2>
                        <p className={cn("text-[10px] font-bold uppercase tracking-wider mt-1", roleInfo.color)}>
                            {roleInfo.label}
                        </p>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-2">
                    {navs.map((item) => {
                        const isActive = item.name.includes("ภาพรวม") ? pathname === item.href : pathname.startsWith(item.href)

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3.5 rounded-lg text-sm font-bold transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                        : "text-zinc-500 hover:bg-white hover:text-zinc-900 hover:shadow"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20 rounded-r-full" />
                                )}
                                <item.icon className={cn(
                                    "h-5 w-5 transition-transform duration-300",
                                    isActive ? "text-indigo-100" : "text-zinc-400 group-hover:scale-110 group-hover:text-indigo-500"
                                )} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6">
                    <button onClick={handleLogout} className="w-full py-2 bg-white rounded-xl text-xs font-bold text-red-600 shadow-sm border border-red-100 hover:bg-red-600 hover:text-white transition-colors duration-200">
                       ออกจากระบบ
                    </button>
            </div>
        </aside>
    )
}

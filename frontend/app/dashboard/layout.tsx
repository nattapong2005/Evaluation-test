"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, User, LayoutDashboard, Menu } from "lucide-react"
import Cookies from "js-cookie"
import Sidebar from "./components/Sidebar"

interface UserData {
    id: string
    name: string
    email: string
    role: string
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [user, setUser] = useState<UserData | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        const token = Cookies.get("token")
        if (!token) {
            router.push("/login")
            return
        }

        const role = Cookies.get("role")
        const name = Cookies.get("name")

        if (role && name) {
            setUser({ id: "1", role, name, email: "" })
        }
    }, [router])

    const handleLogout = () => {
        Cookies.remove("token")
        Cookies.remove("user")
        Cookies.remove("role")
        Cookies.remove("name")
        router.push("/login")
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="animate-pulse text-zinc-500 font-medium">กำลังโหลดเซสชัน...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex">
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/30 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <div className={`fixed inset-y-0 left-0 z-50 md:relative md:flex w-64 flex-shrink-0 flex-col bg-white transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
                <Sidebar role={user.role} setSidebarOpen={setSidebarOpen} />
            </div>
            <div className="flex-1 flex flex-col">
                <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
                    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="md:hidden mr-4 text-zinc-500 hover:text-zinc-700"
                                >
                                    <Menu className="h-6 w-6" />
                                </button>
                                <LayoutDashboard className="h-6 w-6 text-indigo-600 mr-2" />
                                <span className="font-bold text-lg text-zinc-900">
                                    ระบบประเมินผล
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-zinc-600">
                                    <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="font-semibold leading-none">{user.name}</p>
                                        <p className="text-[10px] uppercase font-bold text-indigo-500 mt-1">{user.role}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center justify-center p-2 rounded-md text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="ออกจากระบบ"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-8 bg-zinc-50">
                    {children}
                </main>
            </div>
        </div>
    )
}

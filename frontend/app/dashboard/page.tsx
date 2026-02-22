"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

export default function DashboardRoot() {
  const router = useRouter()

  useEffect(() => {
    const role = Cookies.get("role")
    if (role) {
      router.replace(`/dashboard/${role.toLowerCase()}`)
    } else {
      router.replace("/login")
    }
  }, [router])

  return (
    <div className="flex justify-center text-zinc-500 py-20">
      กำลังเปลี่ยนเส้นทาง...
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { FileText } from "lucide-react"
import Cookies from "js-cookie"
import api from "@/lib/api"

export default function DashboardOverview() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const role = Cookies.get("role")

    if (role) {
      let url = "/results"
      if (role === "EVALUATEE") url = "/results/me"
      if (role === "EVALUATOR") url = "/results/my-evaluations"

      api.get(url)
        .then((res) => setResults(res.data))
        .catch((err) => console.error("Failed to fetch results", err))
        .finally(() => setLoading(false))
    }
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900">สรุปผลการประเมิน</h2>
      {loading ? (
        <div className="flex justify-center text-zinc-500 py-20">กำลังโหลดผลลัพธ์...</div>
      ) : results.length === 0 ? (
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-zinc-200 p-12 text-center">
          <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500">ยังไม่พบผลการประเมิน</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((res, i) => (
            <div key={i} className="bg-white overflow-hidden shadow-sm rounded-2xl border border-zinc-200 p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-xl bg-indigo-50">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-bold text-zinc-900 truncate">
                    {res.evaluation}
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase font-medium">
                    {res.evaluatee}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100 flex justify-between items-end">
                <div>
                  <p className="text-xs text-zinc-400 uppercase font-bold tracking-tighter">คะแนนรวม</p>
                  <p className="text-3xl font-black text-indigo-600">
                    {res.totalScore.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-zinc-100 rounded text-[10px] font-bold text-zinc-500">
                    {res.details?.length || 0} ตัวชี้วัด
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Toast } from "@/components/SweetAlert";
import { ClipboardCheck, Star, FileCheck, AlertCircle } from "lucide-react"
import api from "@/lib/api"
import { cn } from "@/lib/utils"

export default function EvaluatorView() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [scoring, setScoring] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/assignments/my")
      setAssignments(res.data)
    } catch (err) {
      console.error("Failed to fetch assignments", err)
    } finally {
      setLoading(false)
    }
  }

  const handleScoreChange = (indicatorId: number, value: number) => {
    setScoring(prev => ({ ...prev, [indicatorId]: value }))
  }

  const submitScore = async (indicatorId: number) => {
    const score = scoring[indicatorId]
    if (score === undefined) return

    try {
      await api.post(`/assignments/${selectedAssignment.id}/score`, {
        indicatorId,
        score
      })
      // Refresh assignments to get updated scores
      fetchAssignments()
      Toast.fire({ icon: 'success', title: 'ส่งคะแนนสำเร็จ' })
    } catch (err: any) {
      Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการส่งคะแนน" })
    }
  }

  if (loading) return <div className="text-center py-10">กำลังโหลดการมอบหมาย...</div>

  if (selectedAssignment) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedAssignment(null)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          ← กลับไปที่การมอบหมาย
        </button>
        
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="text-xl font-bold mb-2">การให้คะแนน: {selectedAssignment.evaluatee.name}</h2>
          <p className="text-sm text-zinc-500 mb-6">{selectedAssignment.evaluation.name}</p>

          <div className="space-y-8">
            {selectedAssignment.evaluation.topics.map((topic: any) => (
              <div key={topic.id} className="space-y-4">
                <h3 className="font-semibold text-zinc-900 border-l-4 border-indigo-500 pl-3">
                  {topic.name}
                </h3>
                <div className="grid gap-4">
                  {topic.indicators.map((ind: any) => {
                    const existingScore = ind.scores?.[0]
                    const hasEvidence = ind.evidences?.length > 0
                    
                    return (
                      <div key={ind.id} className="p-4 rounded-lg bg-zinc-50 border border-zinc-100">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-sm font-medium">{ind.name}</p>
                            <p className="text-[10px] text-zinc-500 uppercase mt-1">
                              ประเภท: {ind.indicatorType} | น้ำหนัก: {ind.weight}
                            </p>
                          </div>
                          {ind.requireEvidence && (
                            <div className={cn(
                              "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded",
                              hasEvidence ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}>
                              {hasEvidence ? <FileCheck className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                              {hasEvidence ? "อัปโหลดหลักฐานแล้ว" : "ไม่มีหลักฐาน"}
                            </div>
                          )}
                        </div>

                        {ind.indicatorType === "SCALE_1_4" ? (
                          <div className="flex items-center gap-4">
                            {[1, 2, 3, 4].map(num => (
                              <button
                                key={num}
                                onClick={() => handleScoreChange(ind.id, num)}
                                className={cn(
                                  "w-10 h-10 rounded-full border flex items-center justify-center transition-all",
                                  (scoring[ind.id] || existingScore?.rawScore) === num
                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                    : "border-zinc-300 hover:border-indigo-400"
                                )}
                              >
                                {num}
                              </button>
                            ))}
                            <button
                              onClick={() => submitScore(ind.id)}
                              disabled={scoring[ind.id] === undefined}
                              className="ml-auto px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                            >
                              ส่ง
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            {[0, 1].map(val => (
                              <button
                                key={val}
                                onClick={() => handleScoreChange(ind.id, val)}
                                className={cn(
                                  "px-4 py-2 rounded-lg border transition-all text-xs font-bold",
                                  (scoring[ind.id] ?? existingScore?.rawScore) === val
                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                    : "border-zinc-300 hover:border-indigo-400"
                                )}
                              >
                                {val === 1 ? "ใช่" : "ไม่ใช่"}
                              </button>
                            ))}
                            <button
                              onClick={() => submitScore(ind.id)}
                              disabled={scoring[ind.id] === undefined}
                              className="ml-auto px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                            >
                              ส่ง
                            </button>
                          </div>
                        )}
                        {existingScore && (
                          <p className="text-[10px] text-zinc-500 mt-2">
                            คะแนนปัจจุบัน: {existingScore.rawScore} (คำนวณ: {existingScore.calculatedScore.toFixed(2)})
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900">การประเมินที่ได้รับมอบหมาย</h2>
      
      {assignments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-300">
          <ClipboardCheck className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500">ยังไม่มีผู้ถูกประเมินที่ได้รับมอบหมาย</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((as) => (
            <div key={as.id} className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {as.evaluatee.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">{as.evaluatee.name}</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{as.evaluation.name}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">ความคืบหน้า</span>
                    <span className="font-bold">
                      {as.scores?.length || 0} / {as.evaluation.topics.reduce((acc: number, t: any) => acc + t.indicators.length, 0)}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full transition-all" 
                      style={{ width: `${((as.scores?.length || 0) / (as.evaluation.topics.reduce((acc: number, t: any) => acc + t.indicators.length, 0) || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedAssignment(as)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  ให้คะแนนผู้ถูกประเมิน
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

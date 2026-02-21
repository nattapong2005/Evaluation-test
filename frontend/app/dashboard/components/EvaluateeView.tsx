"use client"

import { useState, useEffect } from "react"
import { Upload, FileText, CheckCircle, AlertCircle, Link as LinkIcon } from "lucide-react"
import api from "@/lib/api"
import { Toast } from "@/components/SweetAlert";
import { cn } from "@/lib/utils"

export default function EvaluateeView() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [uploading, setUploading] = useState<Record<string, string>>({})

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

  const handleUrlChange = (indicatorId: number, url: string) => {
    setUploading(prev => ({ ...prev, [indicatorId]: url }))
  }

  const submitEvidence = async (indicatorId: number) => {
    const fileUrl = uploading[indicatorId]
    if (!fileUrl) return

    try {
      await api.post(`/indicators/${indicatorId}/evidence`, { fileUrl })
      fetchAssignments()
      Toast.fire({ icon: 'success', title: 'ส่งหลักฐานสำเร็จ' })
    } catch (err: any) {
      Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการส่งหลักฐาน" })
    }
  }

  if (loading) return <div className="text-center py-10">กำลังโหลดการประเมินของคุณ...</div>

  if (selectedAssignment) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedAssignment(null)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          ← กลับไปที่การประเมิน
        </button>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="text-xl font-bold mb-2">{selectedAssignment.evaluation.name}</h2>
          <p className="text-sm text-zinc-500 mb-6">ผู้ประเมินที่ได้รับมอบหมาย: {selectedAssignment.evaluator.name}</p>

          <div className="space-y-8">
            {selectedAssignment.evaluation.topics.map((topic: any) => (
              <div key={topic.id} className="space-y-4">
                <h3 className="font-semibold text-zinc-900 border-l-4 border-indigo-500 pl-3">
                  {topic.name}
                </h3>
                <div className="grid gap-4">
                  {topic.indicators.map((ind: any) => {
                    const evidence = ind.evidences?.[0]
                    const score = ind.scores?.[0]
                    
                    return (
                      <div key={ind.id} className="p-4 rounded-lg bg-zinc-50 border border-zinc-100">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm font-medium">{ind.name}</p>
                            <div className="flex gap-2 mt-1">
                                <span className="text-[10px] text-zinc-500 uppercase">น้ำหนัก: {ind.weight}</span>
                                {ind.requireEvidence && (
                                    <span className="text-[10px] text-amber-600 font-bold uppercase tracking-tighter bg-amber-50 px-1 rounded">ต้องการหลักฐาน</span>
                                )}
                            </div>
                          </div>
                          {score && (
                            <div className="text-right">
                                <p className="text-xs font-bold text-indigo-600">คะแนน: {score.rawScore}</p>
                                <p className="text-[10px] text-zinc-400">คำนวณ: {score.calculatedScore.toFixed(2)}</p>
                            </div>
                          )}
                        </div>

                        {ind.requireEvidence && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="ป้อน URL หลักฐาน (เช่น ลิงก์ Google Drive)"
                                        value={uploading[ind.id] ?? evidence?.fileUrl ?? ""}
                                        onChange={(e) => handleUrlChange(ind.id, e.target.value)}
                                        className="flex-1 px-3 py-1.5 text-xs rounded border border-zinc-300 bg-white"
                                    />
                                    <button 
                                        onClick={() => submitEvidence(ind.id)}
                                        className="px-3 py-1.5 bg-zinc-900 text-white rounded text-xs font-bold flex items-center gap-1"
                                    >
                                        <Upload className="h-3 w-3" />
                                        บันทึก
                                    </button>
                                </div>
                                {evidence && (
                                    <div className="flex items-center gap-2 text-[10px] text-green-600 font-medium">
                                        <CheckCircle className="h-3 w-3" />
                                        ส่งหลักฐานเมื่อ {new Date(evidence.uploadedAt).toLocaleString()}
                                    </div>
                                )}
                            </div>
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
      <h2 className="text-2xl font-bold text-zinc-900">การประเมินของคุณ</h2>

      {assignments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-300">
          <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500">ยังไม่มีการประเมินที่ได้รับมอบหมาย</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((as) => (
            <div key={as.id} className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-lg bg-indigo-50">
                            <FileText className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold uppercase",
                            as.evaluation.isOpen ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-600"
                        )}>
                            {as.evaluation.isOpen ? "ใช้งาน" : "ปิด"}
                        </div>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{as.evaluation.name}</h3>
                    <p className="text-xs text-zinc-500 mb-4 line-clamp-1">{as.evaluation.description}</p>
                    
                    <div className="text-xs text-zinc-500 mb-6 space-y-1">
                        <p>ผู้ประเมิน: <span className="font-medium text-zinc-900">{as.evaluator.name}</span></p>
                        <p>สิ้นสุด: {new Date(as.evaluation.endDate).toLocaleDateString()}</p>
                    </div>

                    <button 
                        onClick={() => setSelectedAssignment(as)}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        <LinkIcon className="h-4 w-4" />
                        ดูและอัปโหลดหลักฐาน
                    </button>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

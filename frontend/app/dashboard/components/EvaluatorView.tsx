"use client"

import { useState, useEffect } from "react"
import { Toast, confirmDelete } from "@/components/SweetAlert";
import { ClipboardCheck, Star, FileCheck, AlertCircle, Send, MessageSquare, CheckCircle, Filter, History, Clock } from "lucide-react"
import api from "@/lib/api"
import { cn } from "@/lib/utils"

export default function EvaluatorView() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [scoring, setScoring] = useState<Record<string, number>>({})
  const [remarks, setRemarks] = useState<Record<string, string>>({})
  
  // Filter States
  const [filterEvaluationId, setFilterEvaluationId] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("")

  // History States
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyData, setHistoryData] = useState<any[]>([])

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/assignments/my")
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : []
      setAssignments(data)
      if (selectedAssignment) {
        const updatedAssignment = data.find((a: any) => a.id === selectedAssignment.id)
        if (updatedAssignment) {
          setSelectedAssignment(updatedAssignment)
        }
      }
    } catch (err) {
      console.error("Failed to fetch assignments", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async (assignmentId: number) => {
    try {
      const res = await api.get(`/assignments/${assignmentId}/history`)
      setHistoryData(res.data)
      setShowHistoryModal(true)
    } catch (err) {
      Toast.fire({ icon: 'error', title: 'ไม่สามารถโหลดประวัติได้' })
    }
  }

  // Extract unique evaluations for filter dropdown
  const uniqueEvaluations = Array.from(new Map(assignments.map(a => [a.evaluation.id, a.evaluation])).values());

  // Filter logic
  const filteredAssignments = assignments.filter(a => {
    const matchEval = filterEvaluationId ? a.evaluation.id.toString() === filterEvaluationId : true;
    const matchStatus = filterStatus ? 
        (filterStatus === 'SUBMITTED' ? (a.status === 'SUBMITTED' || a.status === 'LOCKED') : a.status === filterStatus) 
        : true;
    return matchEval && matchStatus;
  });

  const handleScoreChange = (indicatorId: number, value: number) => {
    setScoring(prev => ({ ...prev, [indicatorId]: value }))
  }

  const handleRemarkChange = (indicatorId: number, value: string) => {
    setRemarks(prev => ({ ...prev, [indicatorId]: value }))
  }

  const submitScore = async (indicatorId: number) => {
    const score = scoring[indicatorId]
    const remarkText = remarks[indicatorId]

    // Find the existing score to determine if a score value is already set
    const indicator = selectedAssignment.evaluation.topics
      .flatMap((t: any) => t.indicators)
      .find((i: any) => i.id === indicatorId);
    const existingScoreValue = indicator?.scores?.[0]?.rawScore;

    if (score === undefined && existingScoreValue === undefined) {
      Toast.fire({ icon: 'warning', title: 'กรุณาให้คะแนนก่อนส่ง' })
      return
    }

    try {
      await api.post(`/assignments/${selectedAssignment.id}/score`, {
        indicatorId,
        score: score, // Send the new score, can be undefined if only remark is updated
        remarks: remarkText
      })
      await fetchAssignments()
      Toast.fire({ icon: 'success', title: 'บันทึกคะแนนและหมายเหตุสำเร็จ' })
    } catch (err: any) {
      Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการบันทึก" })
    }
  }

  const handleFinalSubmit = async (assignmentId: number) => {
    confirmDelete(async () => {
      try {
        await api.post(`/assignments/${assignmentId}/submit`)
        await fetchAssignments()
        setSelectedAssignment(null) // Go back to the list
        Toast.fire({ icon: 'success', title: 'ยืนยันการส่งการประเมินสำเร็จ!' })
      } catch (err: any) {
        Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการส่งการประเมิน" })
      }
    }, {
      title: "ยืนยันการส่ง?",
      text: "เมื่อส่งแล้ว คุณจะไม่สามารถแก้ไขคะแนนได้อีก",
      confirmButtonText: "ใช่, ยืนยันการส่ง",
    })
  }

  if (loading) return <div className="text-center py-10">กำลังโหลดการมอบหมาย...</div>

  if (selectedAssignment) {
    const isSubmitted = selectedAssignment.status === 'SUBMITTED' || selectedAssignment.status === 'LOCKED'

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            <button
                onClick={() => setSelectedAssignment(null)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 self-center"
            >
                ← กลับไปที่การมอบหมาย
            </button>
            <button
                onClick={() => fetchHistory(selectedAssignment.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg text-xs font-medium transition-colors"
            >
                <History className="h-3.5 w-3.5" />
                ประวัติการแก้ไข
            </button>
          </div>
          
          {!isSubmitted && (
            <button
              onClick={() => handleFinalSubmit(selectedAssignment.id)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-green-600/25"
            >
              <Send className="h-4 w-4" />
              ยืนยันและส่งผลการประเมิน
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-xl font-bold mb-2">การให้คะแนน: {selectedAssignment.evaluatee.name}</h2>
            <div className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
              isSubmitted ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
            )}>
              {isSubmitted ? 'ส่งแล้ว' : 'ฉบับร่าง'}
            </div>
          </div>
          <p className="text-sm text-zinc-500 mb-6">{selectedAssignment.evaluation.name}</p>

          {isSubmitted && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-800 text-sm flex items-center gap-3">
              <CheckCircle className="h-5 w-5" />
              <span>การประเมินนี้ถูกส่งเรียบร้อยแล้วและไม่สามารถแก้ไขได้</span>
            </div>
          )}

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
                    const currentScore = scoring[ind.id] ?? existingScore?.rawScore
                    const isChanged = scoring[ind.id] !== undefined || remarks[ind.id] !== undefined;

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
                            <a
                              href={hasEvidence ? `http://localhost:5000/${ind.evidences[0].fileUrl}` : '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded transition-colors",
                                hasEvidence ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 cursor-default"
                              )}>
                              {hasEvidence ? <FileCheck className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                              {hasEvidence ? "ดูหลักฐาน" : "ไม่มีหลักฐาน"}
                            </a>
                          )}
                        </div>

                        <div className="space-y-3">
                          {/* Scoring buttons */}
                          <div className="flex items-center gap-4">
                            {ind.indicatorType === "SCALE_1_4" ? (
                              [1, 2, 3, 4].map(num => (
                                <button
                                  key={num}
                                  disabled={isSubmitted}
                                  onClick={() => handleScoreChange(ind.id, num)}
                                  className={cn(
                                    "w-10 h-10 rounded-full border flex items-center justify-center transition-all",
                                    currentScore === num
                                      ? "bg-indigo-600 border-indigo-600 text-white"
                                      : "border-zinc-300 hover:border-indigo-400",
                                    isSubmitted && "opacity-50 cursor-not-allowed"
                                  )}
                                >
                                  {num}
                                </button>
                              ))
                            ) : (
                              [1, 0].map(val => ( // Changed order to Yes then No
                                <button
                                  key={val}
                                  disabled={isSubmitted}
                                  onClick={() => handleScoreChange(ind.id, val)}
                                  className={cn(
                                    "px-4 py-2 rounded-lg border transition-all text-xs font-bold",
                                    currentScore === val
                                      ? "bg-indigo-600 border-indigo-600 text-white"
                                      : "border-zinc-300 hover:border-indigo-400",
                                    val === 1 && (currentScore === val ? "bg-green-600 border-green-600" : "hover:border-green-400"),
                                    val === 0 && (currentScore === val ? "bg-red-600 border-red-600" : "hover:border-red-400"),
                                    isSubmitted && "opacity-50 cursor-not-allowed"
                                  )}
                                >
                                  {val === 1 ? "ใช่" : "ไม่ใช่"}
                                </button>
                              ))
                            )}
                          </div>

                          {/* Remarks Textarea */}
                          <div className="flex items-start gap-3">
                            <div className="relative flex-1">
                              <MessageSquare className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                              <textarea
                                placeholder={isSubmitted ? "ไม่มีหมายเหตุ" : "เพิ่มหมายเหตุ (ถ้ามี)..."}
                                rows={2}
                                disabled={isSubmitted}
                                value={remarks[ind.id] ?? existingScore?.remarks ?? ''}
                                onChange={(e) => handleRemarkChange(ind.id, e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white resize-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-zinc-50"
                              />
                            </div>
                            {!isSubmitted && (
                              <button
                                onClick={() => submitScore(ind.id)}
                                disabled={!isChanged}
                                className="px-3 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 transition-opacity"
                              >
                                บันทึก
                              </button>
                            )}
                          </div>
                          {existingScore && !isChanged && (
                            <p className="text-[10px] text-zinc-500">
                              คะแนนปัจจุบัน: {existingScore.rawScore} | หมายเหตุ: {existingScore.remarks || 'ไม่มี'}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History Modal */}
        {showHistoryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white w-full max-w-2xl rounded-2xl border border-zinc-200 shadow-xl overflow-hidden max-h-[80vh] flex flex-col">
                    <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <History className="h-5 w-5 text-indigo-600" />
                            ประวัติการแก้ไขคะแนน
                        </h3>
                        <button onClick={() => setShowHistoryModal(false)} className="text-zinc-400 hover:text-zinc-600">
                            <CheckCircle className="h-5 w-5 rotate-45" /> {/* Close icon substitution */}
                        </button>
                    </div>
                    <div className="p-0 overflow-y-auto flex-1">
                        {historyData.length === 0 ? (
                            <p className="text-center py-10 text-zinc-500 text-sm">ยังไม่มีประวัติการแก้ไข</p>
                        ) : (
                            <div className="divide-y divide-zinc-100">
                                {historyData.map((h: any) => (
                                    <div key={h.id} className="p-4 hover:bg-zinc-50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-zinc-700">{h.topic} / {h.indicator}</span>
                                            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(h.updatedAt).toLocaleString('th-TH')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs mt-2">
                                            <div className="flex-1 p-2 bg-red-50 rounded border border-red-100 text-red-700">
                                                <p className="font-bold mb-0.5">ข้อมูลเดิม</p>
                                                <p>คะแนน: {h.oldScore}</p>
                                                {h.oldRemarks && <p>หมายเหตุ: {h.oldRemarks}</p>}
                                            </div>
                                            <div className="text-zinc-300">→</div>
                                            <div className="flex-1 p-2 bg-green-50 rounded border border-green-100 text-green-700">
                                                <p className="font-bold mb-0.5">ข้อมูลใหม่</p>
                                                <p>คะแนน: {h.newScore}</p>
                                                {h.newRemarks && <p>หมายเหตุ: {h.newRemarks}</p>}
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 mt-2 text-right">แก้ไขโดย: {h.updatedBy}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-zinc-900">การประเมินที่ได้รับมอบหมาย</h2>
        
        {/* Filters */}
        <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <select 
                    value={filterEvaluationId}
                    onChange={(e) => setFilterEvaluationId(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                    <option value="">ทุกรอบการประเมิน</option>
                    {uniqueEvaluations.map((ev: any) => (
                        <option key={ev.id} value={ev.id}>{ev.name}</option>
                    ))}
                </select>
            </div>
            <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
                <option value="">ทุกสถานะ</option>
                <option value="DRAFT">ฉบับร่าง (Draft)</option>
                <option value="SUBMITTED">ส่งแล้ว (Submitted)</option>
            </select>
        </div>
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-300">
          <ClipboardCheck className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500">
              {assignments.length === 0 ? "ยังไม่มีผู้ถูกประเมินที่ได้รับมอบหมาย" : "ไม่พบรายการที่ตรงกับเงื่อนไข"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssignments.map((as) => {
            const totalIndicators = as.evaluation.topics.reduce((acc: number, t: any) => acc + t.indicators.length, 0)
            const progress = totalIndicators > 0 ? (as.scores?.length || 0) / totalIndicators * 100 : 0
            const isSubmitted = as.status === 'SUBMITTED' || as.status === 'LOCKED'

            return (
              <div key={as.id} className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {as.evaluatee.name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900">{as.evaluatee.name}</h3>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{as.evaluation.name}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase",
                      isSubmitted ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {isSubmitted ? 'ส่งแล้ว' : 'ฉบับร่าง'}
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">ความคืบหน้า</span>
                      <span className="font-bold">
                        {as.scores?.length || 0} / {totalIndicators}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full transition-all", isSubmitted ? 'bg-green-600' : 'bg-indigo-600')}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedAssignment(as)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Star className="h-4 w-4" />
                    {isSubmitted ? 'ดูผลการประเมิน' : 'ให้คะแนนผู้ถูกประเมิน'}
                  </button>
                </div>
              </div>
            )
          }
          )}
        </div>
      )}
    </div>
  )
}

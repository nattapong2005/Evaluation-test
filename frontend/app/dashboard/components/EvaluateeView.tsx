"use client"

import { useState, useEffect } from "react"
import { Upload, FileText, CheckCircle, Paperclip, X, Link as LinkIcon, Download } from "lucide-react"
import api from "@/lib/api"
import { Toast } from "@/components/SweetAlert";
import { cn } from "@/lib/utils"

export default function EvaluateeView() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({})

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

  const handleFileChange = (indicatorId: number, file: File | null) => {
    setSelectedFiles(prev => ({ ...prev, [indicatorId]: file }))
  }

  const submitEvidence = async (indicatorId: number) => {
    const file = selectedFiles[indicatorId]
    if (!file) {
      Toast.fire({ icon: 'warning', title: 'กรุณาเลือกไฟล์ก่อนอัปโหลด' })
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post(`/indicators/${indicatorId}/evidence`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      await fetchAssignments() // Refresh data to show new evidence
      handleFileChange(indicatorId, null) // Clear the file input after successful upload
      Toast.fire({ icon: 'success', title: 'อัปโหลดหลักฐานสำเร็จ' })
    } catch (err: any) {
      Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการอัปโหลด" })
    }
  }

  const handleDownloadPDF = async (assignmentId: number) => {
    try {
      const res = await api.get(`/results/${assignmentId}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Evaluation_Report_${assignmentId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      Toast.fire({ icon: 'error', title: 'ไม่สามารถดาวน์โหลดรายงานได้' })
    }
  }

  if (loading) return <div className="text-center py-10">กำลังโหลดการประเมินของคุณ...</div>

  if (selectedAssignment) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <button
            onClick={() => setSelectedAssignment(null)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
            ← กลับไปที่การประเมิน
            </button>
            {(selectedAssignment.status === 'SUBMITTED' || selectedAssignment.status === 'LOCKED') && (
                <button
                    onClick={() => handleDownloadPDF(selectedAssignment.id)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-medium transition-colors"
                >
                    <FileText className="h-4 w-4" />
                    ดาวน์โหลดรายงาน PDF
                </button>
            )}
        </div>

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
                    const currentFile = selectedFiles[ind.id]

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
                              <label htmlFor={`file-${ind.id}`} className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-2 w-full px-3 py-1.5 text-xs rounded border border-zinc-300 bg-white hover:border-indigo-400 transition-colors">
                                  <Paperclip className="h-3.5 w-3.5 text-zinc-400" />
                                  <span className="text-zinc-600 truncate">
                                    {currentFile ? currentFile.name : "เลือกไฟล์หลักฐาน"}
                                  </span>
                                </div>
                              </label>
                              <input
                                id={`file-${ind.id}`}
                                type="file"
                                onChange={(e) => handleFileChange(ind.id, e.target.files ? e.target.files[0] : null)}
                                className="hidden"
                              />
                              {currentFile && (
                                <button
                                  onClick={() => handleFileChange(ind.id, null)}
                                  className="p-1.5 text-zinc-400 hover:text-red-600"
                                  title="ยกเลิก"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => submitEvidence(ind.id)}
                                disabled={!currentFile}
                                className="px-3 py-1.5 bg-zinc-900 text-white rounded text-xs font-bold flex items-center gap-1.5 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Upload className="h-3 w-3" />
                                อัปโหลด
                              </button>
                            </div>
                            {evidence && (
                              <div className="flex items-center gap-2 text-[10px] text-green-700 font-medium bg-green-50 border border-green-100 px-3 py-1.5 rounded-md">
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>ส่งหลักฐานล่าสุดเมื่อ: {new Date(evidence.uploadedAt).toLocaleString('th-TH')}</span>
                                <a
                                  href={`http://localhost:5000/${evidence.fileUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-auto inline-flex items-center gap-1 text-indigo-600 hover:underline"
                                >
                                  <Download className="h-3 w-3" />
                                  ดาวน์โหลด
                                </a>
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
          {assignments.map((as) => {
            const isSubmitted = as.status === 'SUBMITTED' || as.status === 'LOCKED';
            return (
              <div key={as.id} className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg bg-indigo-50">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                        isSubmitted ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-600"
                      )}>
                        {as.status}
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                        as.evaluation.isOpen ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-600"
                      )}>
                        {as.evaluation.isOpen ? "ใช้งาน" : "ปิด"}
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{as.evaluation.name}</h3>
                  <p className="text-xs text-zinc-500 mb-4 line-clamp-1">{as.evaluation.description}</p>

                  <div className="text-xs text-zinc-500 mb-6 space-y-1">
                    <p>ผู้ประเมิน: <span className="font-medium text-zinc-900">{as.evaluator.name}</span></p>
                    <p>สิ้นสุด: {new Date(as.evaluation.endDate).toLocaleDateString('th-TH')}</p>
                  </div>

                                      <div className="flex gap-2">
                                          <button
                                              onClick={() => setSelectedAssignment(as)}
                                              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                          >
                                              <LinkIcon className="h-4 w-4" />
                                              {isSubmitted ? 'ดูผลการประเมิน' : 'ดูและอัปโหลดหลักฐาน'}
                                          </button>
                                          {isSubmitted && (
                                              <button
                                                  onClick={() => handleDownloadPDF(as.id)}
                                                  className="px-3 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center"
                                                  title="ดาวน์โหลดรายงาน PDF"
                                              >
                                                  <Download className="h-4 w-4" />
                                              </button>
                                          )}
                                      </div>                </div>
              </div>
            )
          })}        </div>
      )}
    </div>
  )
}

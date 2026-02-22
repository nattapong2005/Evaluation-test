"use client"

import { useState, useEffect } from "react"
import { Toast, confirmDelete } from "@/components/SweetAlert";
import { Plus, Settings, Users, BookOpen, CheckCircle, XCircle, BarChart3, PieChart as PieChartIcon, ClipboardList, Pencil, Trash2, X, ChevronRight, Building, Check, Activity } from "lucide-react"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const COLORS = ['#4f46e5', '#3b82f6', '#14b8a6', '#f59e0b', '#ef4444'];


import { usePathname } from "next/navigation"

export default function AdminView() {
  const pathname = usePathname()
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateEval, setShowCreateEval] = useState(false)
  const [selectedEval, setSelectedEval] = useState<any>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editingEval, setEditingEval] = useState<any>(null)
  const [showEditEvalModal, setShowEditEvalModal] = useState(false)
  const [editingTopic, setEditingTopic] = useState<any>(null)
  const [showEditTopicModal, setShowEditTopicModal] = useState(false)
  const [editingIndicator, setEditingIndicator] = useState<any>(null)
  const [showEditIndicatorModal, setShowEditIndicatorModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<any>(null)
  const [showEditAssignmentModal, setShowEditAssignmentModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [evalRes, userRes] = await Promise.all([
        api.get("/evaluations", { params: { pageSize: 999 } }),
        api.get("/users", { params: { pageSize: 999 } })
      ])
      const evalData = evalRes.data
      const userData = userRes.data
      setEvaluations(Array.isArray(evalData) ? evalData : Array.isArray(evalData.data) ? evalData.data : [])
      setUsers(Array.isArray(userData) ? userData : Array.isArray(userData.data) ? userData.data : [])
    } catch (err) {
      console.error("Failed to fetch admin data", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: any = {
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
      department: formData.get("department"),
    }
    const password = formData.get("password")
    if (password) data.password = password

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, data)
        Toast.fire({ icon: 'success', title: 'อัปเดตผู้ใช้สำเร็จ' })
      } else {
        await api.post("/users", data)
        Toast.fire({ icon: 'success', title: 'สร้างผู้ใช้สำเร็จ' })
      }
      setShowUserModal(false)
      setEditingUser(null)
      fetchData()
    } catch (err: any) {
      Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการบันทึกผู้ใช้" })
    }
  }

  const handleDeleteUser = async (id: number) => {
    confirmDelete(async () => {
      try {
        await api.delete(`/users/${id}`)
        fetchData()
        Toast.fire({ icon: 'success', title: 'ลบผู้ใช้สำเร็จ' })
      } catch (err: any) {
        Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการลบผู้ใช้" })
      }
    })
  }

  const fetchEvalDetails = async (id: number) => {
    setLoading(true)
    try {
      const res = await api.get(`/evaluations/${id}`)
      setSelectedEval(res.data)
    } catch (err) {
      console.error("Failed to fetch evaluation details", err)
    } finally {
      setLoading(false)
    }
  }

  // ─── Evaluation CRUD ───
  const handleCreateEvaluation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      isOpen: formData.get("isOpen") === "on"
    }

    try {
      await api.post("/evaluations", data)
      setShowCreateEval(false)
      fetchData()
      Toast.fire({ icon: 'success', title: 'สร้างการประเมินสำเร็จ' })
    } catch (err: any) {
      Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการสร้างการประเมิน" })
    }
  }

  const handleUpdateEvaluation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      isOpen: formData.get("isOpen") === "on"
    }

    try {
      await api.put(`/evaluations/${editingEval.id}`, data)
      setShowEditEvalModal(false)
      setEditingEval(null)
      await fetchData()
      if (selectedEval?.id === editingEval.id) {
        await fetchEvalDetails(editingEval.id)
      }
      Toast.fire({ icon: 'success', title: 'อัปเดตการประเมินสำเร็จ' })
    } catch (err: any) {
      Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการอัปเดตการประเมิน" })
    }
  }

  const handleDeleteEvaluation = async (id: number) => {
    confirmDelete(async () => {
      try {
        await api.delete(`/evaluations/${id}`)
        await fetchData()
        if (selectedEval?.id === id) setSelectedEval(null)
        Toast.fire({ icon: 'success', title: 'ลบการประเมินสำเร็จ' })
      } catch (err: any) {
        Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการลบการประเมิน" })
      }
    })
  }

  // ─── Topic CRUD ───
  const handleAddTopic = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
        name: formData.get("name"),
        weight: parseFloat(formData.get("weight") as string),
        isActive: formData.get("isActive") === "on"
    }
    try {
      await api.post(`/evaluations/${selectedEval.id}/topics`, data)
      await fetchEvalDetails(selectedEval.id)
      Toast.fire({ icon: 'success', title: 'เพิ่มหัวข้อสำเร็จ' })
      ;(e.target as HTMLFormElement).reset()
    } catch (err: any) {
      Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการเพิ่มหัวข้อ" })
    }
  }
  
  const handleUpdateTopic = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
     const data = {
      name: formData.get("name"),
      weight: parseFloat(formData.get("weight") as string),
      isActive: formData.get("isActive") === "on"
    }
    
    try {
      await api.put(`/topics/${editingTopic.id}`, data)
      setShowEditTopicModal(false)
      setEditingTopic(null)
      await fetchEvalDetails(selectedEval.id)
      Toast.fire({ icon: 'success', title: 'อัปเดตหัวข้อสำเร็จ' })
    } catch(err: any) {
       Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการอัปเดตหัวข้อ" })
    }
  }

  const handleDeleteTopic = async (topicId: number) => {
    confirmDelete(async () => {
      try {
        await api.delete(`/topics/${topicId}`)
        await fetchEvalDetails(selectedEval.id)
        Toast.fire({ icon: 'success', title: 'ลบหัวข้อสำเร็จ' })
      } catch (err: any) {
        Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการลบหัวข้อ" })
      }
    })
  }

  // ─── Indicator CRUD ───
  const handleAddIndicator = async (topicId: number, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      indicatorType: formData.get("indicatorType"),
      weight: parseFloat(formData.get("weight") as string),
      requireEvidence: formData.get("requireEvidence") === "on"
    }
    try {
      await api.post(`/topics/${topicId}/indicators`, data)
      await fetchEvalDetails(selectedEval.id)
      Toast.fire({ icon: 'success', title: 'เพิ่มตัวชี้วัดสำเร็จ' })
      ;(e.target as HTMLFormElement).reset()
    } catch (err: any) {
      Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการเพิ่มตัวชี้วัด" })
    }
  }
  
  const handleUpdateIndicator = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      indicatorType: formData.get("indicatorType"),
      weight: parseFloat(formData.get("weight") as string),
      requireEvidence: formData.get("requireEvidence") === "on"
    }
    try {
      await api.put(`/indicators/${editingIndicator.id}`, data)
      setShowEditIndicatorModal(false)
      setEditingIndicator(null)
      await fetchEvalDetails(selectedEval.id)
      Toast.fire({ icon: 'success', title: 'อัปเดตตัวชี้วัดสำเร็จ' })
    } catch (err: any) {
       Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการอัปเดตตัวชี้วัด" })
    }
  }

  const handleDeleteIndicator = async (indicatorId: number) => {
    confirmDelete(async () => {
      try {
        await api.delete(`/indicators/${indicatorId}`)
        await fetchEvalDetails(selectedEval.id)
        Toast.fire({ icon: 'success', title: 'ลบตัวชี้วัดสำเร็จ' })
      } catch (err: any) {
        Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการลบตัวชี้วัด" })
      }
    })
  }

  // ─── Assignment ───
  const handleCreateAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      evaluationId: selectedEval.id,
      evaluatorId: parseInt(formData.get("evaluatorId") as string),
      evaluateeId: parseInt(formData.get("evaluateeId") as string)
    }
    try {
      await api.post(`/assignments`, data)
      await fetchEvalDetails(selectedEval.id)
      await fetchData()
      Toast.fire({ icon: 'success', title: 'มอบหมายสำเร็จ' })
    } catch (err: any) {
      Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการมอบหมาย" })
    }
  }

  const handleUpdateAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      evaluatorId: parseInt(formData.get("evaluatorId") as string),
      evaluateeId: parseInt(formData.get("evaluateeId") as string)
    }
    try {
      await api.put(`/assignments/${editingAssignment.id}`, data)
      setShowEditAssignmentModal(false)
      setEditingAssignment(null)
      await fetchEvalDetails(selectedEval.id)
      await fetchData()
      Toast.fire({ icon: 'success', title: 'แก้ไขการมอบหมายสำเร็จ' })
    } catch (err: any) {
      Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการแก้ไขการมอบหมาย" })
    }
  }

  const handleDeleteAssignment = async (assignmentId: number) => {
    confirmDelete(async () => {
      try {
        await api.delete(`/assignments/${assignmentId}`)
        await fetchEvalDetails(selectedEval.id)
        await fetchData()
        Toast.fire({ icon: 'success', title: 'ลบการมอบหมายสำเร็จ' })
      } catch (err: any) {
        Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการลบการมอบหมาย" })
      }
    })
  }

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await api.patch(`/evaluations/${id}/status`, { isOpen: !currentStatus })
      await fetchData()
      if (selectedEval?.id === id) await fetchEvalDetails(id)
      Toast.fire({ icon: 'success', title: `${!currentStatus ? 'เปิด' : 'ปิด'}การประเมินสำเร็จ` })
    } catch (err) {
      console.error("Failed to toggle status", err)
    }
  }

  // Helper: format date string for input[type="date"]
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return ""
    return new Date(dateStr).toISOString().split("T")[0]
  }

  if (loading) return <div className="text-center py-10">กำลังโหลดแดชบอร์ดผู้ดูแล...</div>

  // ═══════════════ EVALUATION DETAIL VIEW ═══════════════
  if (selectedEval) {
    return (
      <div className="space-y-8">
        <button onClick={() => setSelectedEval(null)} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">← กลับไปที่การประเมินทั้งหมด</button>

        <div className="bg-white p-8 rounded-2xl border border-zinc-200">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-black mb-2">{selectedEval.name}</h2>
              <p className="text-zinc-500">{selectedEval.description}</p>
              <div className="flex items-center gap-3 mt-3">
                {selectedEval.status === 'CANCELLED' ? (
                   <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                      ยกเลิกแล้ว
                   </span>
                ) : (
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                    selectedEval.isOpen ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-600"
                  )}>
                    {selectedEval.isOpen ? "เปิดอยู่" : "ปิดอยู่"}
                  </span>
                )}
                <span className="text-xs text-zinc-400">
                  {formatDateForInput(selectedEval.startDate)} — {formatDateForInput(selectedEval.endDate)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {selectedEval.status !== 'CANCELLED' && (
                <>
                  <button
                    onClick={() => {
                      setEditingEval(selectedEval)
                      setShowEditEvalModal(true)
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDeleteEvaluation(selectedEval.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    ยกเลิก
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* ── Topics & Indicators ── */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">หัวข้อ & ตัวชี้วัด</h3>
              </div>

              <form onSubmit={handleAddTopic} className="p-4 rounded-xl border border-dashed space-y-3">
                 <p className="text-xs font-bold uppercase text-zinc-500">เพิ่มหัวข้อใหม่</p>
                 <input name="name" placeholder="ชื่อหัวข้อใหม่" required className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500" />
                 <div className="grid grid-cols-2 gap-3">
                    <input name="weight" type="number" step="1" placeholder="น้ำหนัก" required className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500" />
                    <div className="flex items-center gap-2">
                         <input type="checkbox" name="isActive" id="add-isActive" defaultChecked className="rounded h-4 w-4" />
                         <label htmlFor="add-isActive" className="text-sm text-zinc-600">ใช้งานทันที</label>
                    </div>
                 </div>
                <button type="submit" className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors">เพิ่มหัวข้อ</button>
              </form>

              <div className="space-y-4">
                {selectedEval.topics?.length === 0 && (
                  <p className="text-sm text-zinc-400 text-center py-6">ยังไม่มีหัวข้อ</p>
                )}
                {selectedEval.topics.map((topic: any) => (
                  <div key={topic.id} className="p-4 rounded-xl border border-zinc-200 bg-white">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-indigo-600">{topic.name}</h4>
                        <div className="flex items-center gap-4 mt-1">
                           <span className="text-xs text-zinc-500">น้ำหนัก: <span className="font-semibold">{topic.weight}</span></span>
                           <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold", topic.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500")}>
                               {topic.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                           </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                         <button
                            onClick={() => { setEditingTopic(topic); setShowEditTopicModal(true); }}
                            className="p-1.5 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="แก้ไขหัวข้อ"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="ลบหัวข้อ"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {topic.indicators?.length === 0 && (
                        <p className="text-xs text-zinc-400 text-center py-2 italic">ยังไม่มีตัวชี้วัด</p>
                      )}
                      {topic.indicators.map((ind: any) => (
                        <div key={ind.id} className="flex justify-between items-center text-xs p-2.5 bg-zinc-50/80 rounded-lg border border-zinc-100 group">
                          <div>
                            <span className="font-medium text-zinc-800">{ind.name}</span>
                            <span className="text-zinc-400 ml-1.5">({ind.indicatorType === 'SCALE_1_4' ? '1-4' : 'Y/N'})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-600">W: {ind.weight}</span>
                            {ind.requireEvidence && <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">ต้องมีหลักฐาน</span>}
                            <button
                              onClick={() => { setEditingIndicator(ind); setShowEditIndicatorModal(true); }}
                              className="p-1 text-zinc-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all"
                              title="แก้ไขตัวชี้วัด"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteIndicator(ind.id)}
                              className="p-1 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                              title="ลบตัวชี้วัด"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={(e) => handleAddIndicator(topic.id, e)} className="grid grid-cols-2 gap-2 pt-3 border-t border-dashed">
                      <input name="name" placeholder="ชื่อตัวชี้วัด" required className="col-span-2 px-2.5 py-1.5 rounded-lg border text-xs bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500/40" />
                      <select name="indicatorType" className="px-2.5 py-1.5 rounded-lg border text-xs bg-transparent">
                        <option value="SCALE_1_4">มาตราส่วน 1-4</option>
                        <option value="YES_NO">ใช่/ไม่ใช่</option>
                      </select>
                      <input name="weight" type="number" step="0.1" placeholder="น้ำหนัก" required className="px-2.5 py-1.5 rounded-lg border text-xs bg-transparent" />
                      <div className="flex items-center gap-1.5 col-span-2">
                        <input type="checkbox" name="requireEvidence" id={`ev-${topic.id}`} className="rounded" />
                        <label htmlFor={`ev-${topic.id}`} className="text-[11px] text-zinc-500">ต้องการหลักฐาน</label>
                        <button type="submit" className="ml-auto px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[11px] font-bold hover:bg-indigo-700 transition-colors">เพิ่มตัวชี้วัด</button>
                      </div>
                    </form>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Assignments ── */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold">การมอบหมาย</h3>

              <form onSubmit={handleCreateAssignment} className="space-y-3 p-4 bg-indigo-50 rounded-xl">
                <p className="text-xs font-bold uppercase text-indigo-600">การมอบหมายใหม่</p>
                <select name="evaluatorId" required className="w-full px-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                  <option value="">เลือกผู้ประเมิน</option>
                  {users.filter(u => u.role === "EVALUATOR").map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <select name="evaluateeId" required className="w-full px-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                  <option value="">เลือกผู้ถูกประเมิน</option>
                  {users.filter(u => u.role === "EVALUATEE").map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">มอบหมาย</button>
              </form>

              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="p-3 font-semibold">ผู้ประเมิน</th>
                      <th className="p-3 font-semibold">ผู้ถูกประเมิน</th>
                      <th className="p-3 font-semibold text-right">การกระทำ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEval.assignments?.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-zinc-400 text-sm">ยังไม่มีการมอบหมาย</td>
                      </tr>
                    )}
                    {selectedEval.assignments.map((as: any) => (
                      <tr key={as.id} className="border-t border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                        <td className="p-3">{as.evaluator.name}</td>
                        <td className="p-3">{as.evaluatee.name}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => { setEditingAssignment(as); setShowEditAssignmentModal(true); }}
                            className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors mr-1"
                            title="แก้ไขการมอบหมาย"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(as.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="ลบการมอบหมาย"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Evaluation Modal */}
        {showEditEvalModal && editingEval && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl border border-zinc-200 shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">แก้ไขการประเมิน</h3>
                  <button onClick={() => { setShowEditEvalModal(false); setEditingEval(null); }} className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleUpdateEvaluation} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">ชื่อการประเมิน</label>
                    <input name="name" defaultValue={editingEval.name} required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">คำอธิบาย</label>
                    <textarea name="description" defaultValue={editingEval.description} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">วันที่เริ่มต้น</label>
                      <input name="startDate" type="date" defaultValue={formatDateForInput(editingEval.startDate)} required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">วันที่สิ้นสุด</label>
                      <input name="endDate" type="date" defaultValue={formatDateForInput(editingEval.endDate)} required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input name="isOpen" type="checkbox" id="editIsOpen" defaultChecked={editingEval.isOpen} className="rounded" />
                    <label htmlFor="editIsOpen" className="text-sm font-medium text-zinc-700">เปิดการประเมิน</label>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => { setShowEditEvalModal(false); setEditingEval(null); }} className="px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors">ยกเลิก</button>
                    <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25">อัปเดตการประเมิน</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Topic Modal */}
        {showEditTopicModal && editingTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl border border-zinc-200 shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">แก้ไขหัวข้อ</h3>
                  <button onClick={() => { setShowEditTopicModal(false); setEditingTopic(null); }} className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleUpdateTopic} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">ชื่อหัวข้อ</label>
                    <input name="name" defaultValue={editingTopic.name} required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">น้ำหนัก</label>
                      <input name="weight" type="number" step="1" defaultValue={editingTopic.weight} required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white" />
                    </div>
                     <div className="flex items-end pb-2">
                        <div className="flex items-center gap-2">
                            <input name="isActive" type="checkbox" id="edit-isActive" defaultChecked={editingTopic.isActive} className="rounded h-4 w-4" />
                            <label htmlFor="edit-isActive" className="text-sm font-medium text-zinc-700">ใช้งาน</label>
                        </div>
                     </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => { setShowEditTopicModal(false); setEditingTopic(null); }} className="px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors">ยกเลิก</button>
                    <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25">อัปเดตหัวข้อ</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Indicator Modal */}
        {showEditIndicatorModal && editingIndicator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl border border-zinc-200 shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">แก้ไขตัวชี้วัด</h3>
                  <button onClick={() => { setShowEditIndicatorModal(false); setEditingIndicator(null); }} className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleUpdateIndicator} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">ชื่อตัวชี้วัด</label>
                        <input name="name" defaultValue={editingIndicator.name} required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white" />
                    </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">ประเภท</label>
                      <select name="indicatorType" defaultValue={editingIndicator.indicatorType} className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white">
                        <option value="SCALE_1_4">มาตราส่วน 1-4</option>
                        <option value="YES_NO">ใช่/ไม่ใช่</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">น้ำหนัก</label>
                      <input name="weight" type="number" step="0.1" defaultValue={editingIndicator.weight} required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input name="requireEvidence" type="checkbox" id="edit-requireEvidence" defaultChecked={editingIndicator.requireEvidence} className="rounded" />
                    <label htmlFor="edit-requireEvidence" className="text-sm font-medium text-zinc-700">ต้องการหลักฐาน</label>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => { setShowEditIndicatorModal(false); setEditingIndicator(null); }} className="px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors">ยกเลิก</button>
                    <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25">อัปเดตตัวชี้วัด</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Assignment Modal */}
        {showEditAssignmentModal && editingAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl border border-zinc-200 shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">แก้ไขการมอบหมาย</h3>
                  <button onClick={() => { setShowEditAssignmentModal(false); setEditingAssignment(null); }} className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleUpdateAssignment} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">ผู้ประเมิน</label>
                    <select name="evaluatorId" defaultValue={editingAssignment.evaluatorId} required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white">
                      <option value="">เลือกผู้ประเมิน</option>
                      {users.filter(u => u.role === "EVALUATOR").map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">ผู้ถูกประเมิน</label>
                    <select name="evaluateeId" defaultValue={editingAssignment.evaluateeId} required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white">
                      <option value="">เลือกผู้ถูกประเมิน</option>
                      {users.filter(u => u.role === "EVALUATEE").map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => { setShowEditAssignmentModal(false); setEditingAssignment(null); }} className="px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors">ยกเลิก</button>
                    <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25">อัปเดตการมอบหมาย</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Topic Modal */}
        {showEditTopicModal && editingTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl border border-zinc-200 shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">แก้ไขหัวข้อ</h3>
                  <button onClick={() => { setShowEditTopicModal(false); setEditingTopic(null); }} className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleUpdateTopic} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">ชื่อหัวข้อ</label>
                    <input name="name" defaultValue={editingTopic.name} required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">น้ำหนัก</label>
                      <input name="weight" type="number" step="1" defaultValue={editingTopic.weight} required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white" />
                    </div>
                     <div className="flex items-end pb-2">
                        <div className="flex items-center gap-2">
                            <input name="isActive" type="checkbox" id="edit-isActive" defaultChecked={editingTopic.isActive} className="rounded h-4 w-4" />
                            <label htmlFor="edit-isActive" className="text-sm font-medium text-zinc-700">ใช้งาน</label>
                        </div>
                     </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => { setShowEditTopicModal(false); setEditingTopic(null); }} className="px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors">ยกเลิก</button>
                    <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25">อัปเดตหัวข้อ</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Indicator Modal */}
        {showEditIndicatorModal && editingIndicator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl border border-zinc-200 shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">แก้ไขตัวชี้วัด</h3>
                  <button onClick={() => { setShowEditIndicatorModal(false); setEditingIndicator(null); }} className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleUpdateIndicator} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">ชื่อตัวชี้วัด</label>
                        <input name="name" defaultValue={editingIndicator.name} required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white" />
                    </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">ประเภท</label>
                      <select name="indicatorType" defaultValue={editingIndicator.indicatorType} className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white">
                        <option value="SCALE_1_4">มาตราส่วน 1-4</option>
                        <option value="YES_NO">ใช่/ไม่ใช่</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">น้ำหนัก</label>
                      <input name="weight" type="number" step="0.1" defaultValue={editingIndicator.weight} required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input name="requireEvidence" type="checkbox" id="edit-requireEvidence" defaultChecked={editingIndicator.requireEvidence} className="rounded" />
                    <label htmlFor="edit-requireEvidence" className="text-sm font-medium text-zinc-700">ต้องการหลักฐาน</label>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => { setShowEditIndicatorModal(false); setEditingIndicator(null); }} className="px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors">ยกเลิก</button>
                    <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25">อัปเดตตัวชี้วัด</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const roleDistribution = users.reduce((acc: any, user: any) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {})

  const pieChartData = {
    labels: Object.keys(roleDistribution).map(k => k === 'ADMIN' ? 'ผู้ดูแลระบบ' : k === 'EVALUATOR' ? 'ผู้ประเมิน' : 'ผู้ถูกประเมิน'),
    datasets: [
      {
        data: Object.values(roleDistribution),
        backgroundColor: COLORS,
        borderWidth: 0,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: { family: 'inherit', size: 12 }
        }
      },
      tooltip: {
        bodyFont: { family: 'inherit', size: 14 },
        titleFont: { family: 'inherit', size: 14 }
      }
    },
  };

  const barChartData = {
    labels: evaluations.map(ev => ev.name),
    datasets: [
      {
        label: 'การมอบหมาย',
        data: evaluations.map(ev => ev._count?.assignments || 0),
        backgroundColor: '#4f46e5',
        borderRadius: 4,
      },
      {
        label: 'หัวข้อ',
        data: evaluations.map(ev => ev._count?.topics || 0),
        backgroundColor: '#0ea5e9',
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { family: 'inherit', size: 12 }
        }
      },
      tooltip: {
        bodyFont: { family: 'inherit', size: 14 },
        titleFont: { family: 'inherit', size: 14 },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#e4e4e7',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'inherit', size: 12 } }
      },
      y: {
        grid: { display: false },
        ticks: { font: { family: 'inherit', size: 12 } }
      },
    }
  };

  return (
    <div className="space-y-8">
      {pathname === '/dashboard/admin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 text-zinc-500 mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-bold text-sm text-zinc-600">ผู้ใช้งานทั้งหมด</h3>
              </div>
              <p className="text-3xl font-black text-zinc-900">{users.length} <span className="text-sm font-medium text-zinc-400">คน</span></p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 text-zinc-500 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-sm text-zinc-600">แบบประเมินทั้งหมด</h3>
              </div>
              <p className="text-3xl font-black text-zinc-900">{evaluations.length} <span className="text-sm font-medium text-zinc-400">รายการ</span></p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 text-zinc-500 mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-sm text-zinc-600">กำลังเปิดประเมิน</h3>
              </div>
              <p className="text-3xl font-black text-zinc-900">{evaluations.filter(e => e.isOpen).length} <span className="text-sm font-medium text-zinc-400">รายการ</span></p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 text-zinc-500 mb-4">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <ClipboardList className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-sm text-zinc-600">การมอบหมายรวม</h3>
              </div>
              <p className="text-3xl font-black text-zinc-900">
                {evaluations.reduce((acc, ev) => acc + (ev._count?.assignments || 0), 0)} <span className="text-sm font-medium text-zinc-400">งาน</span>
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col h-80">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-zinc-900">การมอบหมายและหัวข้อ ในแต่ละการประเมิน</h3>
              </div>
              <div className="flex-1 min-h-0 w-full relative">
                <Bar data={barChartData} options={barOptions} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col h-80">
              <div className="flex items-center gap-2 mb-6">
                <PieChartIcon className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-zinc-900">สัดส่วนตำแหน่งผู้ใช้งาน</h3>
              </div>
              <div className="flex-1 min-h-0 w-full relative flex items-center justify-center pb-6">
                <Pie data={pieChartData} options={pieOptions} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ EVALUATIONS LIST ═══════════════ */}
      {pathname === '/dashboard/admin/evaluations' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-zinc-900">จัดการการประเมิน</h2>
            <button
              onClick={() => setShowCreateEval(!showCreateEval)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-indigo-600/25"
            >
              <Plus className="h-4 w-4" />
              สร้างการประเมิน
            </button>
          </div>

          {/* Create Evaluation Form */}
          {showCreateEval && (
            <form onSubmit={handleCreateEvaluation} className="bg-white p-6 rounded-xl border border-zinc-200 space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-zinc-900">สร้างการประเมินใหม่</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">ชื่อ</label>
                  <input name="name" required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">คำอธิบาย</label>
                  <input name="description" className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">วันที่เริ่มต้น</label>
                  <input name="startDate" type="date" required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">วันที่สิ้นสุด</label>
                  <input name="endDate" type="date" required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white" />
                </div>
                <div className="flex items-center gap-2">
                  <input name="isOpen" type="checkbox" id="isOpen" className="rounded" />
                  <label htmlFor="isOpen" className="text-sm font-medium text-zinc-700">เปิดทันที</label>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateEval(false)} className="px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors">ยกเลิก</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25">สร้างการประเมิน</button>
              </div>
            </form>
          )}

          {/* Evaluations Grid */}
          {evaluations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
              <BookOpen className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
              <p className="text-zinc-500">ยังไม่มีการประเมิน</p>
              <p className="text-zinc-400 text-sm mt-1">กดปุ่ม "สร้างการประเมิน" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {evaluations.map((ev) => (
                <div key={ev.id} className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-indigo-50">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {ev.status === 'CANCELLED' ? (
                           <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                              ยกเลิก
                           </span>
                        ) : (
                          <button
                            onClick={() => toggleStatus(ev.id, ev.isOpen)}
                            className={cn(
                              "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors",
                              ev.isOpen ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                            )}
                          >
                            {ev.isOpen ? "เปิด" : "ปิด"}
                          </button>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{ev.name}</h3>
                    <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{ev.description || "ไม่มีคำอธิบาย"}</p>

                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {ev._count?.assignments || 0} การมอบหมาย
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings className="h-3 w-3" />
                        {ev._count?.topics || 0} หัวข้อ
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-zinc-100 p-3 bg-zinc-50/50 flex justify-between items-center">
                    <span className="text-[10px] text-zinc-400">
                      {new Date(ev.startDate).toLocaleDateString('th-TH')} - {new Date(ev.endDate).toLocaleDateString('th-TH')}
                    </span>
                    <div className="flex items-center gap-2">
                      {ev.status !== 'CANCELLED' && (
                        <>
                          <button
                            onClick={() => {
                              setEditingEval(ev)
                              setShowEditEvalModal(true)
                            }}
                            className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="แก้ไข"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvaluation(ev.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="ยกเลิก"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => fetchEvalDetails(ev.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                      >
                        จัดการ
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Edit Evaluation Modal */}
          {showEditEvalModal && editingEval && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white w-full max-w-lg rounded-2xl border border-zinc-200 shadow-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">แก้ไขการประเมิน</h3>
                    <button onClick={() => { setShowEditEvalModal(false); setEditingEval(null); }} className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <form onSubmit={handleUpdateEvaluation} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">ชื่อการประเมิน</label>
                      <input name="name" defaultValue={editingEval.name} required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">คำอธิบาย</label>
                      <textarea name="description" defaultValue={editingEval.description} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">วันที่เริ่มต้น</label>
                        <input name="startDate" type="date" defaultValue={formatDateForInput(editingEval.startDate)} required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">วันที่สิ้นสุด</label>
                        <input name="endDate" type="date" defaultValue={formatDateForInput(editingEval.endDate)} required className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input name="isOpen" type="checkbox" id="editIsOpenList" defaultChecked={editingEval.isOpen} className="rounded" />
                      <label htmlFor="editIsOpenList" className="text-sm font-medium text-zinc-700">เปิดการประเมิน</label>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => { setShowEditEvalModal(false); setEditingEval(null); }} className="px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors">ยกเลิก</button>
                      <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25">อัปเดตการประเมิน</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ USERS ═══════════════ */}
      {pathname === '/dashboard/admin/users' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-zinc-900">จัดการผู้ใช้งาน</h2>
            <button
              onClick={() => { setEditingUser(null); setShowUserModal(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              เพิ่มผู้ใช้
            </button>
          </div>

          {showUserModal && (
            <div className="fixed inset-0 z-50 flex items-center min-h-screen justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white w-full max-w-md rounded-2xl border border-zinc-200 shadow-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{editingUser ? "แก้ไขผู้ใช้" : "สร้างผู้ใช้ใหม่"}</h3>
                    <button onClick={() => setShowUserModal(false)} className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <form onSubmit={handleUserSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">ชื่อ-นามสกุล</label>
                      <input name="name" defaultValue={editingUser?.name} required className="w-full px-3 py-2 rounded-md border border-zinc-300 bg-transparent text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">อีเมล</label>
                      <input name="email" type="email" defaultValue={editingUser?.email} required className="w-full px-3 py-2 rounded-md border border-zinc-300 bg-transparent text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{editingUser ? "รหัสผ่าน (เว้นว่างไว้เพื่อคงเดิม)" : "รหัสผ่าน"}</label>
                      <input name="password" type="password" required={!editingUser} className="w-full px-3 py-2 rounded-md border border-zinc-300 bg-transparent text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">ตำแหน่ง</label>
                      <select name="role" defaultValue={editingUser?.role || "EVALUATEE"} className="w-full px-3 py-2 rounded-md border border-zinc-300 bg-transparent text-sm">
                        <option value="ADMIN">ผู้ดูแลระบบ</option>
                        <option value="EVALUATOR">ผู้ประเมิน</option>
                        <option value="EVALUATEE">ผู้ถูกประเมิน</option>
                      </select>
                    </div>
                     <div className="space-y-2">
                      <label className="text-sm font-medium">แผนก</label>
                      <input name="department" defaultValue={editingUser?.department} placeholder="เช่น IT, HR" className="w-full px-3 py-2 rounded-md border border-zinc-300 bg-transparent text-sm" />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-700">ยกเลิก</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold">
                        {editingUser ? "อัปเดตผู้ใช้" : "สร้างผู้ใช้"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-50">
                <tr className="">
                  <th className="p-4 text-sm font-semibold">ชื่อ</th>
                  <th className="p-4 text-sm font-semibold">อีเมล</th>
                   <th className="p-4 text-sm font-semibold">แผนก</th>
                  <th className="p-4 text-sm font-semibold">ตำแหน่ง</th>
                  <th className="p-4 text-sm font-semibold text-right">การกระทำ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4 text-sm">{u.name}</td>
                    <td className="p-4 text-sm text-zinc-500">{u.email}</td>
                    <td className="p-4 text-sm text-zinc-500">{u.department || "-"}</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-medium uppercase",
                        u.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                          u.role === "EVALUATOR" ? "bg-blue-100 text-blue-700" :
                            "bg-amber-100 text-amber-700"
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setEditingUser(u); setShowUserModal(true); }}
                          className="p-1.5 text-zinc-500 hover:text-indigo-600 transition-colors"
                          title="แก้ไขผู้ใช้"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-600 transition-colors"
                          title="ลบผู้ใช้"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

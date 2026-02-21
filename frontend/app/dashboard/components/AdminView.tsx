"use client"

import { useState, useEffect } from "react"
import { Toast, confirmDelete } from "@/components/SweetAlert";
import { Plus, Settings, Users, BookOpen, CheckCircle, XCircle, BarChart3, PieChart as PieChartIcon, ClipboardList } from "lucide-react"
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

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [evalRes, userRes] = await Promise.all([
        api.get("/evaluations"),
        api.get("/users")
      ])
      setEvaluations(evalRes.data)
      setUsers(userRes.data)
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
    try {
      const res = await api.get(`/evaluations/${id}`)
      setSelectedEval(res.data)
    } catch (err) {
      console.error("Failed to fetch evaluation details", err)
    }
  }

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
    } catch (err) {
      console.error("Failed to create evaluation", err)
    }
  }

  const handleAddTopic = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await api.post(`/evaluations/${selectedEval.id}/topics`, { name: formData.get("name") })
      fetchEvalDetails(selectedEval.id)
        ; (e.target as HTMLFormElement).reset()
    } catch (err) { console.error(err) }
  }

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
      fetchEvalDetails(selectedEval.id)
        ; (e.target as HTMLFormElement).reset()
    } catch (err) { console.error(err) }
  }

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
      fetchEvalDetails(selectedEval.id)
      fetchData() // to update assignment counts
      Toast.fire({ icon: 'success', title: 'มอบหมายสำเร็จ' })
    } catch (err: any) {
      Toast.fire({ icon: 'error', title: err.response?.data?.error || "ล้มเหลวในการมอบหมาย" })
    }
  }

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await api.patch(`/evaluations/${id}/status`, { isOpen: !currentStatus })
      fetchData()
      if (selectedEval?.id === id) fetchEvalDetails(id)
    } catch (err) {
      console.error("Failed to toggle status", err)
    }
  }

  if (loading) return <div className="text-center py-10">กำลังโหลดแดชบอร์ดผู้ดูแล...</div>

  if (selectedEval) {
    return (
      <div className="space-y-8">
        <button onClick={() => setSelectedEval(null)} className="text-sm font-medium text-indigo-600">← กลับไปที่การประเมิน</button>

        <div className="bg-white p-8 rounded-2xl border border-zinc-200">
          <h2 className="text-3xl font-black mb-2">{selectedEval.name}</h2>
          <p className="text-zinc-500 mb-8">{selectedEval.description}</p>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">หัวข้อ & ตัวชี้วัด</h3>
              </div>

              <form onSubmit={handleAddTopic} className="flex gap-2">
                <input name="name" placeholder="ชื่อหัวข้อใหม่" required className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 bg-transparent text-sm" />
                <button type="submit" className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-bold">เพิ่มหัวข้อ</button>
              </form>

              <div className="space-y-4">
                {selectedEval.topics.map((topic: any) => (
                  <div key={topic.id} className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50">
                    <h4 className="font-bold text-indigo-600 mb-4">{topic.name}</h4>
                    <div className="space-y-3 mb-4">
                      {topic.indicators.map((ind: any) => (
                        <div key={ind.id} className="flex justify-between items-center text-xs p-2 bg-white rounded border border-zinc-100">
                          <span>{ind.name} <span className="text-zinc-400">({ind.indicatorType})</span></span>
                          <span className="font-bold">น้ำหนัก: {ind.weight}</span>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={(e) => handleAddIndicator(topic.id, e)} className="grid grid-cols-2 gap-2">
                      <input name="name" placeholder="ชื่อตัวชี้วัด" required className="col-span-2 px-2 py-1 rounded border text-xs bg-transparent" />
                      <select name="indicatorType" className="px-2 py-1 rounded border text-xs bg-transparent">
                        <option value="SCALE_1_4">มาตราส่วน 1-4</option>
                        <option value="YES_NO">ใช่/ไม่ใช่</option>
                      </select>
                      <input name="weight" type="number" step="0.1" placeholder="น้ำหนัก" required className="px-2 py-1 rounded border text-xs bg-transparent" />
                      <div className="flex items-center gap-1 col-span-2">
                        <input type="checkbox" name="requireEvidence" id={`ev-${topic.id}`} />
                        <label htmlFor={`ev-${topic.id}`} className="text-[10px]">ต้องการหลักฐาน</label>
                        <button type="submit" className="ml-auto px-3 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">เพิ่ม</button>
                      </div>
                    </form>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold">การมอบหมาย</h3>

              <form onSubmit={handleCreateAssignment} className="space-y-3 p-4 bg-indigo-50 rounded-xl">
                <p className="text-xs font-bold uppercase text-indigo-600">การมอบหมายใหม่</p>
                <select name="evaluatorId" required className="w-full px-3 py-2 rounded-lg border text-sm bg-white">
                  <option value="">เลือกผู้ประเมิน</option>
                  {users.filter(u => u.role === "EVALUATOR").map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <select name="evaluateeId" required className="w-full px-3 py-2 rounded-lg border text-sm bg-white">
                  <option value="">เลือกผู้ถูกประเมิน</option>
                  {users.filter(u => u.role === "EVALUATEE").map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold">มอบหมาย</button>
              </form>

              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="p-3">ผู้ประเมิน</th>
                      <th className="p-3">ผู้ถูกประเมิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEval.assignments.map((as: any) => (
                      <tr key={as.id} className="border-t border-zinc-100">
                        <td className="p-3">{as.evaluator.name}</td>
                        <td className="p-3">{as.evaluatee.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
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

      {pathname === '/dashboard/admin/evaluations' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-zinc-900">จัดการการประเมิน</h2>
            <button
              onClick={() => setShowCreateEval(!showCreateEval)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              สร้างการประเมิน
            </button>
          </div>

          {showCreateEval && (
            <form onSubmit={handleCreateEvaluation} className="bg-white p-6 rounded-xl border border-zinc-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ชื่อ</label>
                  <input name="name" required className="w-full px-3 py-2 rounded-md border border-zinc-300 bg-transparent" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">คำอธิบาย</label>
                  <input name="description" className="w-full px-3 py-2 rounded-md border border-zinc-300 bg-transparent" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">วันที่เริ่มต้น</label>
                  <input name="startDate" type="date" required className="w-full px-3 py-2 rounded-md border border-zinc-300 bg-transparent" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">วันที่สิ้นสุด</label>
                  <input name="endDate" type="date" required className="w-full px-3 py-2 rounded-md border border-zinc-300 bg-transparent" />
                </div>
                <div className="flex items-center gap-2">
                  <input name="isOpen" type="checkbox" id="isOpen" />
                  <label htmlFor="isOpen" className="text-sm font-medium">เปิดทันที</label>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateEval(false)} className="px-4 py-2 text-sm">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">สร้าง</button>
              </div>
            </form>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {evaluations.map((ev) => (
              <div key={ev.id} className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg bg-indigo-50">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                    </div>
                    <button
                      onClick={() => toggleStatus(ev.id, ev.isOpen)}
                      className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors",
                        ev.isOpen ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-600"
                      )}
                    >
                      {ev.isOpen ? "เปิด" : "ปิด"}
                    </button>
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
                    {new Date(ev.startDate).toLocaleDateString()} - {new Date(ev.endDate).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => fetchEvalDetails(ev.id)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    จัดการรายละเอียด
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white w-full max-w-md rounded-2xl border border-zinc-200 shadow-xl overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">{editingUser ? "แก้ไขผู้ใช้" : "สร้างผู้ใช้ใหม่"}</h3>
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
                  <th className="p-4 text-sm font-semibold">ตำแหน่ง</th>
                  <th className="p-4 text-sm font-semibold text-right">การกระทำ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4 text-sm">{u.name}</td>
                    <td className="p-4 text-sm text-zinc-500">{u.email}</td>
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

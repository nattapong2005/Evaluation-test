"use client"

import { useState, useEffect } from "react"
import { Download, Search, BarChart, Users, FileText, PieChart } from "lucide-react"
import api from "@/lib/api"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [meta, setMeta] = useState<any>({})
  const [progress, setProgress] = useState<any[]>([])
  const [topicStats, setTopicStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ q: "", department: "", evaluationId: "" })
  const [evaluations, setEvaluations] = useState<any[]>([])

  useEffect(() => {
    fetchEvaluations()
    fetchResults()
    fetchProgress()
    fetchTopicStats()
  }, [])
  
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults()
      fetchProgress()
      fetchTopicStats()
    }, 500) // Debounce search
    return () => clearTimeout(timer)
  }, [filters])

  const fetchEvaluations = async () => {
    try {
        const res = await api.get('/evaluations?pageSize=999');
        setEvaluations(res.data.data || []);
    } catch (err) {
        console.error("Failed to fetch evaluations", err);
    }
  }

  const fetchResults = async () => {
    setLoading(true)
    try {
      const res = await api.get("/results", { params: filters })
      setResults(res.data.data)
      setMeta(res.data.meta)
    } catch (err) {
      console.error("Failed to fetch results", err)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchProgress = async () => {
     try {
      const res = await api.get("/results/progress", { params: { evaluationId: filters.evaluationId } })
      setProgress(res.data)
    } catch (err) {
      console.error("Failed to fetch progress", err)
    }
  }

  const fetchTopicStats = async () => {
    try {
        const res = await api.get("/results/topic-analysis", { params: { evaluationId: filters.evaluationId } })
        setTopicStats(res.data)
    } catch (err) {
        console.error("Failed to fetch topic stats", err)
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleExport = async () => {
    try {
      const res = await api.get("/results/export", {
        params: { department: filters.department, evaluationId: filters.evaluationId },
        responseType: 'blob', // Important
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `results-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error("Failed to export results", err)
    }
  }
  
  const progressChartData = {
    labels: progress.map(p => p.department),
    datasets: [
      {
        label: '% การส่ง (Submitted)',
        data: progress.map(p => p.percentage),
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      },
    ],
  };

  const topicChartData = {
    labels: topicStats.map(t => t.topic),
    datasets: [
      {
        label: 'คะแนนเฉลี่ย (Average Score)',
        data: topicStats.map(t => t.average),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-900">ผลการประเมินรวม</h2>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Download className="h-4 w-4" />
          Export to CSV
        </button>
      </div>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200">
            <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2"><BarChart className="h-5 w-5 text-indigo-500" />ความคืบหน้าตามแผนก</h3>
            {progress.length > 0 ? (
                <div className="h-64">
                <Bar data={progressChartData} options={{ maintainAspectRatio: false, indexAxis: 'y' as const }} />
                </div>
            ) : <p className="text-sm text-zinc-500 text-center py-10">เลือก "รอบการประเมิน" เพื่อดูข้อมูล</p>}
        </div>

        {/* Topic Stats Chart */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200">
            <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2"><PieChart className="h-5 w-5 text-emerald-500" />คะแนนเฉลี่ยรายหัวข้อ</h3>
            {topicStats.length > 0 ? (
                <div className="h-64">
                <Bar data={topicChartData} options={{ maintainAspectRatio: false }} />
                </div>
            ) : <p className="text-sm text-zinc-500 text-center py-10">ยังไม่มีข้อมูลคะแนนในรอบนี้</p>}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-xl border border-zinc-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            name="q"
            value={filters.q}
            onChange={handleFilterChange}
            placeholder="ค้นหาชื่อผู้ถูกประเมิน..."
            className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-zinc-300"
          />
        </div>
        <input
          name="department"
          value={filters.department}
          onChange={handleFilterChange}
          placeholder="กรองตามแผนก..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300"
        />
        <select
            name="evaluationId"
            value={filters.evaluationId}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 bg-white"
        >
            <option value="">ทุกรอบการประเมิน</option>
            {evaluations.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
        </select>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-zinc-500">กำลังโหลดข้อมูล...</div>
        ) : results.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
                <FileText className="h-10 w-10 mx-auto mb-2 text-zinc-300" />
                ไม่พบผลลัพธ์ที่ตรงกับเงื่อนไข
            </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-zinc-50">
              <tr>
                <th className="p-4 font-semibold">ผู้ถูกประเมิน</th>
                <th className="p-4 font-semibold">แผนก</th>
                <th className="p-4 font-semibold">รอบการประเมิน</th>
                <th className="p-4 font-semibold">ผู้ประเมิน</th>
                <th className="p-4 font-semibold text-center">สถานะ</th>
                <th className="p-4 font-semibold text-right">คะแนนรวม</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.assignmentId} className="border-t border-zinc-100 hover:bg-zinc-50/50">
                  <td className="p-4 font-medium">{r.evaluatee}</td>
                  <td className="p-4 text-zinc-500">{r.department || "-"}</td>
                  <td className="p-4 text-zinc-500">{r.evaluation}</td>
                  <td className="p-4 text-zinc-500">{r.evaluator}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${r.status === 'SUBMITTED' || r.status === 'LOCKED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-indigo-600">{r.totalScore.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

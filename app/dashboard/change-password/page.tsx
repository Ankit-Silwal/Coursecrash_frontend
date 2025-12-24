"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/utils/axios"

export default function ChangePasswordPage(){
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string|null>(null)
  const [type, setType] = useState<'success'|'error'|null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setType('error'); setMsg('Passwords do not match'); return
    }
    setLoading(true); setMsg(null)
    try {
      const res = await api.post('/auth/change-password', { 
        oldPassword: currentPassword, 
        newPassword: password, 
        conformNewPassword: confirmPassword 
      })
      if (res.data.success) {
        setType('success'); setMsg(res.data.message || 'Password changed successfully')
        setTimeout(()=> router.push('/dashboard'), 800)
      } else {
        setType('error'); setMsg(res.data.message || 'Change password failed')
      }
    } catch (err:any) {
      setType('error'); setMsg(err.response?.data?.message || 'Change password failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Change Password</h1>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Current Password</label>
            <input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">New Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button disabled={loading} className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition text-white font-semibold">
            {loading ? 'Changing...' : 'Change Password'}
          </button>
          {msg && (
            <div className={`p-3 rounded-lg border text-sm ${type==='success'?'bg-green-500/20 border-green-500 text-green-400':'bg-red-500/20 border-red-500 text-red-400'}`}>{msg}</div>
          )}
        </form>
      </div>
    </div>
  )
}

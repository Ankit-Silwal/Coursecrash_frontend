"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import api from "@/utils/axios"

export default function VerifyForgotPasswordPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState<string>("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [type, setType] = useState<'success'|'error'|null>(null)

  useEffect(()=>{
    const e = params.get('email')
    if (e) setEmail(decodeURIComponent(e))
  },[params])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setMsg(null)
    try {
      const res = await api.post('/auth/verify-forgot-password', { email, otp })
      if (res.data.success) {
        setType('success'); setMsg(res.data.message || 'OTP verified')
        setTimeout(()=> router.push(`/forgot-password/reset?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`), 800)
      } else {
        setType('error'); setMsg(res.data.message || 'Verification failed')
      }
    } catch (err:any) {
      setType('error'); setMsg(err.response?.data?.message || 'Verification failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Verify OTP</h1>
        <p className="text-slate-400 text-center mb-8">Enter the OTP sent to your email</p>
        <form className="space-y-5" onSubmit={handleVerify}>
          <div>
            <label className="block text-sm text-slate-300 mb-1">OTP</label>
            <input maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button disabled={loading || otp.length!==6} className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition text-white font-semibold">
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          {msg && (
            <div className={`p-3 rounded-lg border text-sm ${type==='success'?'bg-green-500/20 border-green-500 text-green-400':'bg-red-500/20 border-red-500 text-red-400'}`}>{msg}</div>
          )}
        </form>
      </div>
    </div>
  )
}

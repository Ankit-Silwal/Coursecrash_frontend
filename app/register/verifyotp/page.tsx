"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import api from "@/utils/axios"

export default function VerifyOtpPage() {
  const router = useRouter()
  const [otp, setOtp] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [email, setEmail] = useState<string | null>(null)
  const [resent, setResent] = useState<boolean>(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  async function handleVerifyOtp() {
    if (!email) {
      setError("Email not found. Please register again.")
      setMessageType("error")
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      const endpoint = resent ? '/auth/verify-resend-otp' : '/auth/verify-otp'
      const res = await api.post(endpoint, { email, otp })
      if (res.data.success) {
        router.push('/login')
      } else {
        setError(res.data.message)
        setMessageType("error")
      }
    } catch (err: any) { // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError(err?.response?.data?.message ?? "Verification failed")
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendOtp() {
    console.log("Resend OTP clicked, email:", email)
    if (!email) {
      setError("Email not found. Please register again.")
      setMessageType("error")
      return
    }
    setError(null)
    try {
      console.log("Sending resend OTP request with email:", email)
      const res = await api.post('/auth/resend-otp', { email })
      console.log("Resend OTP response:", res.data)
      if (res.data.success) {
        setError(res.data.message)
        setResent(true)
        setMessageType("success")
      } else {
        setError(res.data.message)
        setMessageType("error")
      }
    } catch (err: any) { // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log("Resend OTP error:", err?.response?.data)
      setError(err?.response?.data?.message ?? "Failed to resend OTP")
      setMessageType("error")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl shadow-2xl p-8">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/50 mb-4">
            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Verify Your Email
          </h1>
          <p className="text-slate-400">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <form className="space-y-6">
          {/* OTP Input */}
          <div>
            <label className="block text-sm text-slate-300 mb-3">
              Verification Code
            </label>
            <input
              type="text"
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-4 text-center text-2xl font-bold tracking-widest rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              value={otp}
            />
            <p className="text-xs text-slate-500 mt-2">
              Enter the code without spaces
            </p>
          </div>

          {/* Error/Success Message */}
          {error && (
            <div className={`p-3 rounded-lg border text-sm ${
              messageType === 'success'
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : 'bg-red-500/20 border-red-500 text-red-400'
            }`}>
              {error}
            </div>
          )}

          {/* Verify Button */}
          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition text-white font-semibold"
            onClick={(e) => {
              e.preventDefault()
              handleVerifyOtp()
            }}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              Didn't receive the code?{" "}
              <button
                type="button"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
                onClick={handleResendOtp}
              >
                Resend OTP
              </button>
            </p>
          </div>
        </form>

        {/* Timer Info */}
        <div className="mt-8 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <p className="text-xs text-slate-400 text-center">
            ⏱️ Code expires in <span className="text-indigo-400 font-semibold">5:00</span>
          </p>
        </div>

        {/* Back to Login */}
        <p className="text-slate-400 text-sm text-center mt-6">
          <button
            type="button"
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
            onClick={()=>router.push('/login')}
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  )
}

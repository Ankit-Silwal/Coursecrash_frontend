"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/utils/axios"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await api.get("/auth/status")
        console.log(res.data.loggedIn)
        if (res.data.loggedIn) {
          router.push('/dashboard')
        }
      } catch (err) {
        console.log(err);
      }
    }
    
    checkSession()
  }, [router])

  async function handleLogin() {
    setError(null)
    setIsLoading(true)
    try {
      const res = await api.post("/auth/login", { email, password })
      if (res.data.success) {
        setError("Login successful! Redirecting...")
        setMessageType("success")
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        setError(res.data.message)
        setMessageType("error")
      }
    } catch (err: any) { // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError(err?.response?.data?.message ?? "Login failed")
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl shadow-2xl p-8">

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Welcome Back
        </h1>

        <p className="text-slate-400 text-center mb-8">
          Login to your account
        </p>

        <form className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition text-white font-semibold"
            onClick={(e) => {
              e.preventDefault()
              handleLogin()
            }}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          {error && (
            <div className={`p-3 rounded-lg border text-sm ${
              messageType === 'success'
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : 'bg-red-500/20 border-red-500 text-red-400'
            }`}>
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <p className="text-slate-400 text-sm text-center mt-6">
          Don’t have an account?{" "}
          <span className="text-indigo-400 hover:underline cursor-pointer"
            onClick={() => router.push('/register')}>
            Register
          </span>
        </p>
        <p className="text-slate-400 text-sm text-center mt-2">
          <button
            type="button"
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
            onClick={()=>router.push('/forgot-password')}
          >
            Forgot password?
          </button>
        </p>
      </div>
    </div>
  )
}

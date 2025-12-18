"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/utils/axios"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  async function handleLogin() {
    setError(null)
    try {
      const res = await api.post("/auth/login", { email, password })
      if (res.data.success) {
        router.push('/dashboard') 
      }
      setError(res.data.message) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Login failed");
      console.log(error)
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
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold"
            onClick={(e) => {
              e.preventDefault()
              handleLogin()
            }}
          >
            Login
          </button>
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500 text-red-400 text-sm">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <p className="text-slate-400 text-sm text-center mt-6">
          Don’t have an account?{" "}
          <span className="text-indigo-400 hover:underline cursor-pointer">
            Register
          </span>
        </p>
      </div>
    </div>
  )
}

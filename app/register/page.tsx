"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/utils/axios"

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function handleRegister() {
    setError(null)
    setIsLoading(true)
    try {
      const res = await api.post('/auth/register', { username, email, password, confirmPassword })
      if (res.data.success) {
        setError("Registration successful! Redirecting...")
        setMessageType("success")
        setTimeout(() => {
          router.push(`/register/verifyotp?email=${encodeURIComponent(email)}`)
        }, 1000)
      } else {
        setError(res.data.message)
        setMessageType("error")
      }
    } catch (err: any) { // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError(err?.response?.data?.message ?? "Registration failed")
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl shadow-2xl p-8">

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Create Account
        </h1>

        <p className="text-slate-400 text-center mb-8">
          Sign up to get started
        </p>

        <form className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="johndoe"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

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

          {/* Confirm Password */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition text-white font-semibold"
            onClick={(e) => {
              e.preventDefault()
              handleRegister()
            }}
          >
            {isLoading ? "Registering..." : "Register"}
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
          Already have an account?{" "}
          <span className="text-indigo-400 hover:underline cursor-pointer"
          onClick={()=>router.push('/login')}>
            Login
          </span>
        </p>
      </div>
    </div>
  )
}

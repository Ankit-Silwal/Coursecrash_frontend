"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to regular login - no separate admin login needed
    router.push("/login")
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-white">Redirecting to login...</div>
    </div>
  )
}

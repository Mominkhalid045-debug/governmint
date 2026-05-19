"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { ShieldAlert, ArrowLeft, Home } from "lucide-react"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 px-4 py-12 text-center">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.1)] mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">403 - Forbidden</h1>
          <p className="mt-3 text-lg font-medium text-slate-300">Access Denied</p>
          <p className="mt-2 text-sm text-slate-400 max-w-xs mx-auto">
            You do not have the required role privileges to access this administrative directory.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg hover:shadow-emerald-500/10 transition-all active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Dashboard Home
          </button>
        </div>
      </div>
    </div>
  )
}

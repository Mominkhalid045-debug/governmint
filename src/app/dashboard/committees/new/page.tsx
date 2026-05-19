"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { createCommittee } from "@/actions/committees"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewCommitteePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const res = await createCommittee(formData)
      if (res?.error) {
        setError(res.error)
        setLoading(false)
      } else {
        router.push("/dashboard/committees")
        router.refresh()
      }
    } catch (err: unknown) {
      const errorObject = err as { message?: string }
      setError(errorObject.message || "An unexpected error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        href="/dashboard/committees"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Directory
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Create Committee</h1>
        <p className="text-slate-450 text-sm">
          Establish a new governance body, coordinate agenda, and register voters.
        </p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
              Committee Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Board of Trustees, Executive Academic Senate"
              className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 px-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1.5">
              Description / Mandate
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Outline the core responsibilities, charter mandates, and delegation powers of this board..."
              className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 px-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 py-3 px-4 text-sm font-semibold text-slate-950 shadow-lg hover:shadow-emerald-500/10 transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Establishing Committee...
              </>
            ) : (
              "Create Committee"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

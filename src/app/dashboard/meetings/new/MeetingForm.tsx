"use client"

import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createMeeting } from "@/actions/meetings"
import { Loader2 } from "lucide-react"

interface CommitteeInfo {
  id: string
  name: string
}

export default function MeetingForm({ committees }: { committees: CommitteeInfo[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultCommitteeId = searchParams.get("committeeId") || ""

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const res = await createMeeting(formData)
      if (res?.error) {
        setError(res.error)
        setLoading(false)
      } else {
        router.push("/dashboard/meetings")
        router.refresh()
      }
    } catch (err: unknown) {
      const errorObject = err as { message?: string }
      setError(errorObject.message || "An unexpected error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="committeeId" className="block text-sm font-medium text-slate-300 mb-1.5">
            Select Committee Board
          </label>
          <select
            id="committeeId"
            name="committeeId"
            required
            defaultValue={defaultCommitteeId}
            className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
          >
            <option value="" disabled className="text-slate-500">Select a board...</option>
            {committees.map((comm) => (
              <option key={comm.id} value={comm.id} className="bg-slate-950 text-slate-250">
                {comm.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1.5">
            Session Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="e.g. Q2 Strategic Budget & Resource Review"
            className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 px-4 text-slate-200 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1.5">
            Agenda Overview
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Provide a high-level summary of the agenda points to be covered during the session..."
            className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 px-4 text-slate-200 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="scheduledAt" className="block text-sm font-medium text-slate-300 mb-1.5">
              Scheduled Date & Time
            </label>
            <input
              id="scheduledAt"
              name="scheduledAt"
              type="datetime-local"
              required
              className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 px-4 text-slate-250 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-300 mb-1.5">
              Location / Video Link
            </label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="e.g. Zoom Link or Executive Room 4B"
              className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 px-4 text-slate-200 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 py-3 px-4 text-sm font-semibold text-slate-950 shadow-lg hover:shadow-emerald-500/10 transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Scheduling Board Session...
            </>
          ) : (
            "Schedule & Invite Board"
          )}
        </button>
      </form>
    </div>
  )
}

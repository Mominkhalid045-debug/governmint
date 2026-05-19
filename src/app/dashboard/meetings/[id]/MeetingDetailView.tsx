"use client"

import React, { useState } from "react"
import { processMeetingMinutesAI, updateAttendeeAttendance, rsvpMeeting } from "@/actions/meetings"
import { Clock, MapPin, Sparkles, Loader2, Landmark, CheckCircle, XCircle, AlertCircle, HelpCircle } from "lucide-react"

interface Attendee {
  id: string
  name: string
  email: string
  status: "PRESENT" | "ABSENT" | "EXCUSED" | "LATE" | "PENDING"
}

interface ActionItem {
  title: string
  description: string
  assigneeEmail?: string | null
}

interface SavedMinute {
  transcript: string
  summary: string | null
}

interface MeetingDetailViewProps {
  meeting: {
    id: string
    title: string
    description: string | null
    scheduledAt: Date
    location: string | null
    committeeName: string
    createdByName: string
  }
  attendees: Attendee[]
  userSession: {
    id: string
    role: string
  }
  savedMinute: SavedMinute | null
}

export default function MeetingDetailView({
  meeting,
  attendees: initialAttendees,
  userSession,
  savedMinute
}: MeetingDetailViewProps) {
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees)
  const [transcript, setTranscript] = useState(savedMinute?.transcript || "")
  const [summary, setSummary] = useState<string | null>(savedMinute?.summary || null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [errorAI, setErrorAI] = useState<string | null>(null)

  const isSecretaryOrAdmin =
    userSession.role === "SUPER_ADMIN" ||
    userSession.role === "ADMIN" ||
    userSession.role === "SECRETARY"

  // User's own attendance status
  const currentUserAttendance = attendees.find((a) => a.id === userSession.id)
  const myStatus = currentUserAttendance?.status || "PENDING"

  const handleMyRSVP = async (status: "PRESENT" | "ABSENT" | "EXCUSED" | "LATE") => {
    try {
      const res = await rsvpMeeting(meeting.id, status)
      if (res?.success) {
        setAttendees((prev) =>
          prev.map((a) => (a.id === userSession.id ? { ...a, status } : a))
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleAdminAttendanceUpdate = async (userId: string, status: "PRESENT" | "ABSENT" | "EXCUSED" | "LATE") => {
    try {
      const res = await updateAttendeeAttendance(meeting.id, userId, status)
      if (res?.success) {
        setAttendees((prev) =>
          prev.map((a) => (a.id === userId ? { ...a, status } : a))
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleTriggerAI = async () => {
    if (!transcript.trim()) return
    setErrorAI(null)
    setLoadingAI(true)

    try {
      const res = await processMeetingMinutesAI(meeting.id, transcript)
      if (res?.error) {
        setErrorAI(res.error)
      } else if (res?.success) {
        setSummary(res.minute.summary)
        if (res.aiResult?.actionItems) {
          setActionItems(res.aiResult.actionItems)
        }
      }
    } catch (err: unknown) {
      const errorObject = err as { message?: string }
      setErrorAI(errorObject.message || "Failed to generate AI executive overview.")
    } finally {
      setLoadingAI(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full"><CheckCircle className="h-3 w-3" /> Present</span>
      case "ABSENT":
        return <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full"><XCircle className="h-3 w-3" /> Absent</span>
      case "EXCUSED":
        return <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full"><AlertCircle className="h-3 w-3" /> Excused</span>
      case "LATE":
        return <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full"><Clock className="h-3 w-3" /> Late</span>
      default:
        return <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-900/60 px-2 py-0.5 rounded-full"><HelpCircle className="h-3 w-3" /> Unconfirmed</span>
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left 2 Columns: Details, Scribe & AI assistant */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl space-y-4 shadow-xl">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {meeting.committeeName}
            </span>
            <h1 className="text-2xl font-bold text-white">{meeting.title}</h1>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              {meeting.description || "No session brief provided."}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800/60 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-500" />
              <span>{new Date(meeting.scheduledAt).toLocaleString()}</span>
            </div>
            {meeting.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span>{meeting.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Landmark className="h-4 w-4 text-slate-500" />
              <span>Sponsor: {meeting.createdByName}</span>
            </div>
          </div>
        </div>

        {/* AI Scribe Assistant Card */}
        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl space-y-6 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              AI Scribe & Executive Summarizer
            </h2>
          </div>

          <div className="space-y-2">
            <label htmlFor="transcript" className="block text-xs font-semibold text-slate-300">
              Raw Session Transcript / Meeting Minutes Notes
            </label>
            <textarea
              id="transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={8}
              placeholder="Paste raw transcripts, voice scribe logs, or draft notes here..."
              className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 px-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs resize-none"
            />
          </div>

          <button
            onClick={handleTriggerAI}
            disabled={loadingAI || !transcript.trim()}
            className="w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 py-3 px-4 text-xs font-semibold text-slate-950 shadow-lg hover:shadow-emerald-500/10 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {loadingAI ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Gemini Synthesizing Transcript...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Executive AI Minutes
              </>
            )}
          </button>

          {errorAI && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-3 rounded-xl">
              {errorAI}
            </div>
          )}

          {/* AI Output Result Section */}
          {summary && (
            <div className="pt-6 border-t border-slate-800/80 space-y-4">
              <div className="bg-slate-950/60 border border-slate-850 p-6 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-emerald-400" />
                  AI Executive Summary
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {summary}
                </p>
              </div>

              {actionItems.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400">Extracted Action Items</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {actionItems.map((item, idx) => (
                      <div key={idx} className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-1.5">
                        <p className="text-xs font-bold text-slate-200">{item.title}</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{item.description}</p>
                        {item.assigneeEmail && (
                          <span className="inline-block text-[9px] text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10 mt-1">
                            Assignee: {item.assigneeEmail}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Attendance / RSVP Panel */}
      <div className="space-y-6">
        {/* User's RSVP card */}
        {attendees.some((a) => a.id === userSession.id) && (
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white">Your RSVP Status</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Current Status:</span>
              {getStatusBadge(myStatus)}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleMyRSVP("PRESENT")}
                className="py-2 text-[10px] font-bold rounded-lg bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 transition-all border border-emerald-500/10 cursor-pointer"
              >
                Accept (Present)
              </button>
              <button
                onClick={() => handleMyRSVP("ABSENT")}
                className="py-2 text-[10px] font-bold rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-slate-950 text-rose-400 transition-all border border-rose-500/10 cursor-pointer"
              >
                Decline (Absent)
              </button>
            </div>
          </div>
        )}

        {/* Board Attendees Listing Sheet */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Roster Attendance Roll</span>
            <span className="text-[10px] font-medium text-slate-500">
              {attendees.filter(a => a.status === "PRESENT").length} / {attendees.length} Present
            </span>
          </h3>

          <div className="space-y-3 divide-y divide-slate-850 max-h-[350px] overflow-y-auto pr-1">
            {attendees.map((attendee) => (
              <div key={attendee.id} className="pt-3 first:pt-0 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-200">{attendee.name}</p>
                    <p className="text-[10px] text-slate-500">{attendee.email}</p>
                  </div>
                  {!isSecretaryOrAdmin ? (
                    getStatusBadge(attendee.status)
                  ) : (
                    <select
                      value={attendee.status}
                      onChange={(e) =>
                        handleAdminAttendanceUpdate(
                          attendee.id,
                          e.target.value as "PRESENT" | "ABSENT" | "EXCUSED" | "LATE"
                        )
                      }
                      className="text-[10px] bg-slate-950 border border-slate-800 text-slate-350 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PRESENT">PRESENT</option>
                      <option value="ABSENT">ABSENT</option>
                      <option value="EXCUSED">EXCUSED</option>
                      <option value="LATE">LATE</option>
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

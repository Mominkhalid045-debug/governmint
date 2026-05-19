import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Clock, MapPin, Plus, Landmark, ArrowRight } from "lucide-react"

export default async function MeetingsPage() {
  const session = await getServerSession(authOptions)
  const userRole = session?.user?.role || "MEMBER"

  const meetings = await prisma.meeting.findMany({
    include: {
      committee: true,
      createdBy: true
    },
    orderBy: {
      scheduledAt: "asc"
    }
  })

  const now = new Date()
  const upcomingMeetings = meetings.filter(m => new Date(m.scheduledAt) >= now)
  const pastMeetings = meetings.filter(m => new Date(m.scheduledAt) < now)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Board Sessions</h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse upcoming scheduled assemblies and transcripts archives.
          </p>
        </div>
        {(userRole === "SUPER_ADMIN" || userRole === "ADMIN" || userRole === "CHAIRPERSON" || userRole === "SECRETARY") && (
          <Link
            href="/dashboard/meetings/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg hover:shadow-emerald-500/10 transition-all"
          >
            <Plus className="h-4 w-4" />
            Schedule Session
          </Link>
        )}
      </div>

      {/* Upcoming Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Scheduled & Live Assemblies
        </h2>
        {upcomingMeetings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm border border-slate-800 bg-slate-900/10 rounded-2xl">
            No upcoming sessions scheduled.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingMeetings.map((meet) => (
              <div
                key={meet.id}
                className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-950 text-emerald-400 border border-slate-800">
                      {meet.committee.name}
                    </span>
                  </div>
                  <h3 className="text-md font-bold text-white">{meet.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                    {meet.description || "No description outline provided."}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                  <div className="space-y-1 text-[10px] text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{new Date(meet.scheduledAt).toLocaleString()}</span>
                    </div>
                    {meet.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="line-clamp-1">{meet.location}</span>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/dashboard/meetings/${meet.id}`}
                    className="flex justify-center items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    Enter Session
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Archive Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Landmark className="h-4.5 w-4.5 text-slate-500" />
          Archives & Minutes Transcripts
        </h2>
        {pastMeetings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm border border-slate-800 bg-slate-900/10 rounded-2xl">
            No completed sessions in archives.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 bg-slate-900/20 border border-slate-800 rounded-2xl p-6">
            {pastMeetings.map((meet) => (
              <div key={meet.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-500 font-semibold uppercase">{meet.committee.name}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-slate-200">{meet.title}</h4>
                  <p className="text-[10px] text-slate-500">
                    Session hosted on {new Date(meet.scheduledAt).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/dashboard/meetings/${meet.id}`}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-350 self-start sm:self-auto"
                >
                  Inspect Transcript <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

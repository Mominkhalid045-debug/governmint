import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Users, Calendar, BarChart2, Shield, Plus, ArrowRight, CheckSquare } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Fetch metrics dynamically from real database
  const userRole = session.user.role

  const committeeCount = await prisma.committee.count()
  const meetingCount = await prisma.meeting.count()
  const voteCount = await prisma.vote.count()
  const userCount = await prisma.user.count()

  // Get upcoming meetings
  const upcomingMeetings = await prisma.meeting.findMany({
    where: {
      scheduledAt: {
        gte: new Date()
      }
    },
    take: 3,
    orderBy: {
      scheduledAt: 'asc'
    },
    include: {
      committee: true,
      createdBy: true
    }
  })

  // Get active committees
  const committeesList = await prisma.committee.findMany({
    take: 3,
    include: {
      members: {
        include: {
          user: true
        }
      }
    }
  })

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back, <span className="text-emerald-400 font-semibold">{session.user.name}</span>. Manage your committees and schedule upcoming governance sessions.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/meetings"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl transition-all"
          >
            <Calendar className="h-4 w-4 text-emerald-400" />
            Schedule Meeting
          </Link>
          {(userRole === "SUPER_ADMIN" || userRole === "ADMIN") && (
            <Link
              href="/dashboard/committees"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg hover:shadow-emerald-500/10 transition-all"
            >
              <Plus className="h-4 w-4" />
              New Committee
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-start">
            <div className="text-slate-500 text-xs font-semibold tracking-wider uppercase">Total Committees</div>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{committeeCount}</div>
            <p className="text-[10px] text-slate-500 mt-1">Active governance nodes</p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-start">
            <div className="text-slate-500 text-xs font-semibold tracking-wider uppercase">Meetings Scheduled</div>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Calendar className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{meetingCount}</div>
            <p className="text-[10px] text-slate-500 mt-1">Upcoming or archive transcripts</p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-start">
            <div className="text-slate-500 text-xs font-semibold tracking-wider uppercase">Resolutions Voted</div>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <CheckSquare className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{voteCount}</div>
            <p className="text-[10px] text-slate-500 mt-1">Casted votes tracked</p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-start">
            <div className="text-slate-500 text-xs font-semibold tracking-wider uppercase">System Users</div>
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
              <Shield className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{userCount}</div>
            <p className="text-[10px] text-slate-500 mt-1">Authorized role profiles</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Upcoming Meetings & Committees */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Meetings Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
              <h3 className="text-lg font-bold text-white">Upcoming Meetings</h3>
              <Link href="/dashboard/meetings" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {upcomingMeetings.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No upcoming meetings scheduled.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {upcomingMeetings.map((meet) => (
                  <div key={meet.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm text-slate-200">{meet.title}</h4>
                      <p className="text-xs text-slate-400">{meet.committee.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(meet.scheduledAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/meetings/${meet.id}`}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs font-semibold text-slate-350 rounded-lg transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Committees Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
              <h3 className="text-lg font-bold text-white">Active Committees</h3>
              <Link href="/dashboard/committees" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {committeesList.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No committees established.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {committeesList.map((comm) => (
                  <div key={comm.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white line-clamp-1">{comm.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{comm.description || "No description provided."}</p>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-semibold">{comm.members.length} Members</span>
                      <Link href={`/dashboard/committees/${comm.id}`} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                        Enter
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: AI Scribe Banner & Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-900/40 via-teal-900/20 to-slate-900/40 border border-emerald-500/20 rounded-2xl p-6 space-y-4 relative overflow-hidden shadow-2xl">
            {/* Small glow */}
            <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">AI Scribe Assistant</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                During meetings, capture raw transcripts. GovernMINT&apos;s integrated Gemini agent will automatically clean the text, build a complete executive summary, and extract action item tasks.
              </p>
            </div>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                Agent-Ready Model
              </span>
            </div>
          </div>

          {/* Quick Actions List */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-md font-bold text-white">System Actions</h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/meetings"
                className="w-full flex items-center justify-between p-3.5 bg-slate-950/80 hover:bg-slate-950 hover:border-slate-800 border border-slate-900 rounded-xl text-xs text-slate-300 transition-colors"
              >
                <span>Browse Meetings Archive</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
              </Link>
              <Link
                href="/dashboard/committees"
                className="w-full flex items-center justify-between p-3.5 bg-slate-950/80 hover:bg-slate-950 hover:border-slate-800 border border-slate-900 rounded-xl text-xs text-slate-300 transition-colors"
              >
                <span>View My Committees</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
              </Link>
              {(userRole === "SUPER_ADMIN" || userRole === "ADMIN") && (
                <Link
                  href="/admin/audit-logs"
                  className="w-full flex items-center justify-between p-3.5 bg-slate-950/80 hover:bg-slate-950 hover:border-slate-800 border border-slate-900 rounded-xl text-xs text-slate-300 transition-colors"
                >
                  <span>Inspect Audit Trails</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

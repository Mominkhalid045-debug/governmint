import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, UserPlus, Users, Calendar, Clock, MapPin, Trash2, Landmark } from "lucide-react"
import { addCommitteeMember, removeCommitteeMember } from "@/actions/committees"

export default async function CommitteeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const { id } = await params

  const committee = await prisma.committee.findUnique({
    where: { id },
    include: {
      createdBy: true,
      members: {
        include: {
          user: true
        }
      },
      meetings: {
        orderBy: {
          scheduledAt: "desc"
        }
      }
    }
  })

  if (!committee) {
    redirect("/dashboard/committees")
  }

  const userRole = session.user.role
  const isCreatorOrAdmin =
    userRole === "SUPER_ADMIN" ||
    userRole === "ADMIN" ||
    committee.createdById === session.user.id

  // Server Action wrappers inside the Server Component for easy integration
  async function handleAddMember(formData: FormData) {
    "use server"
    const email = formData.get("email") as string
    const designation = formData.get("designation") as string

    if (!email) return

    await addCommitteeMember(id, email, designation)
  }

  async function handleRemoveMember(formData: FormData) {
    "use server"
    const memberId = formData.get("memberId") as string
    if (!memberId) return

    await removeCommitteeMember(id, memberId)
  }

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/committees"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Directory
      </Link>

      {/* Header Info Banner */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-6 pb-6 border-b border-slate-800/80">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Landmark className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{committee.name}</h1>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            {committee.description || "No description provided."}
          </p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl text-xs space-y-1.5 text-slate-400 shrink-0 self-start">
          <p>
            Board Sponsor: <span className="text-slate-200 font-semibold">{committee.createdBy.name}</span>
          </p>
          <p>
            Established: <span className="text-slate-200">{new Date(committee.createdAt).toLocaleDateString()}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Members Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                Roster Registry ({committee.members.length})
              </h3>
            </div>

            {/* Roster Listing */}
            <div className="divide-y divide-slate-800/60">
              {committee.members.map((member) => (
                <div key={member.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm">
                      {member.user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{member.user.name}</p>
                      <p className="text-xs text-slate-500">{member.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-950 text-slate-400 border border-slate-850">
                      {member.designation || "Regular Member"}
                    </span>
                    {isCreatorOrAdmin && member.userId !== committee.createdById && (
                      <form action={handleRemoveMember}>
                        <input type="hidden" name="memberId" value={member.id} />
                        <button
                          type="submit"
                          className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                          title="Remove Member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Member form (Only for Board Chairs & Admin) */}
            {isCreatorOrAdmin && (
              <div className="pt-6 border-t border-slate-800/80 space-y-4">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                  <UserPlus className="h-4.5 w-4.5 text-emerald-400" />
                  Add Board Member
                </h4>
                <form action={handleAddMember} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="user@organization.com"
                    className="sm:col-span-2 block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 px-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                  />
                  <input
                    name="designation"
                    type="text"
                    placeholder="Designation (e.g. Secretary)"
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 px-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                  />
                  <button
                    type="submit"
                    className="sm:col-span-3 flex justify-center items-center py-2.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    Register Member
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Board Meetings list */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-400" />
                Board Sessions
              </h3>
            </div>

            {committee.meetings.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No meetings scheduled for this committee yet.
              </div>
            ) : (
              <div className="space-y-3">
                {committee.meetings.map((meet) => (
                  <Link
                    key={meet.id}
                    href={`/dashboard/meetings/${meet.id}`}
                    className="block p-4 bg-slate-950/60 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl space-y-2 transition-all group"
                  >
                    <h4 className="font-semibold text-sm text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {meet.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(meet.scheduledAt).toLocaleDateString()}
                      </span>
                      {meet.location && (
                        <span className="flex items-center gap-1 line-clamp-1">
                          <MapPin className="h-3 w-3" />
                          {meet.location}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {isCreatorOrAdmin && (
              <Link
                href={`/dashboard/meetings/new?committeeId=${committee.id}`}
                className="w-full flex justify-center items-center py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 hover:border-slate-750 text-slate-350 font-semibold text-xs rounded-xl transition-all"
              >
                Schedule Board Session
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Users, Calendar, ArrowRight, Plus, FolderKanban } from "lucide-react"

export default async function CommitteesPage() {
  const session = await getServerSession(authOptions)
  const userRole = session?.user?.role || "MEMBER"

  const committees = await prisma.committee.findMany({
    include: {
      createdBy: true,
      members: {
        include: {
          user: true
        }
      },
      meetings: true
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Committees Directory</h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse corporate, academic, and executive governance boards.
          </p>
        </div>
        {(userRole === "SUPER_ADMIN" || userRole === "ADMIN" || userRole === "CHAIRPERSON") && (
          <Link
            href="/dashboard/committees/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg hover:shadow-emerald-500/10 transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Committee
          </Link>
        )}
      </div>

      {committees.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-800 bg-slate-900/20 rounded-2xl text-center space-y-3">
          <FolderKanban className="h-12 w-12 text-slate-600" />
          <h3 className="text-lg font-bold text-white">No Committees Established</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            Committees serve as the core organizational units for hosting meetings and tracking resolutions.
          </p>
          {(userRole === "SUPER_ADMIN" || userRole === "ADMIN" || userRole === "CHAIRPERSON") && (
            <Link
              href="/dashboard/committees/new"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-350"
            >
              Set up first committee now
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {committees.map((comm) => (
            <div
              key={comm.id}
              className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between transition-colors shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                    <Users className="h-3 w-3" />
                    {comm.members.length} {comm.members.length === 1 ? "Member" : "Members"}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Created {new Date(comm.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {comm.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 mt-1 leading-relaxed">
                    {comm.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{comm.meetings.length} Scheduled</span>
                </div>
                <Link
                  href={`/dashboard/committees/${comm.id}`}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-350 transition-colors"
                >
                  Configure Board <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

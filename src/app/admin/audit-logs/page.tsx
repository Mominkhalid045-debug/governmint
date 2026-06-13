import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Shield } from "lucide-react"

export default async function AuditLogsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Only Admin or Super Admin
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 100 // Limit to latest 100 for display
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-emerald-400" />
            System Audit Logs
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Immutable trail of administrative and user actions across the platform.
          </p>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        {logs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            No audit logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60">
                  <th className="pb-3 font-semibold text-slate-400">Timestamp</th>
                  <th className="pb-3 font-semibold text-slate-400">Action</th>
                  <th className="pb-3 font-semibold text-slate-400">Entity</th>
                  <th className="pb-3 font-semibold text-slate-400">User ID</th>
                  <th className="pb-3 font-semibold text-slate-400">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 pr-4 whitespace-nowrap text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-wide uppercase border border-emerald-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-medium text-slate-200">
                      {log.entity} {log.entityId && <span className="text-slate-500 font-normal text-xs ml-1">({log.entityId.slice(0,8)}...)</span>}
                    </td>
                    <td className="py-3 pr-4 text-slate-400 text-xs font-mono">
                      {log.userId ? log.userId.slice(0, 12) + "..." : "System"}
                    </td>
                    <td className="py-3 text-xs text-slate-500 max-w-xs truncate">
                      {log.metadata || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Landmark, Home, Users, Calendar, Shield, LogOut, User, Menu, X } from "lucide-react"

export default function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  const userRole = session?.user?.role || "MEMBER"

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Committees", href: "/dashboard/committees", icon: Users },
    { name: "Meetings", href: "/dashboard/meetings", icon: Calendar },
  ]

  // Add Admin links if appropriate
  if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
    navItems.push({ name: "Audit Logs", href: "/admin/audit-logs", icon: Shield })
  }

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden flex items-center justify-between bg-slate-900 border-b border-slate-800 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <Landmark className="h-6 w-6 text-emerald-400" />
          <span className="font-bold tracking-tight text-white">GovernMINT</span>
        </div>
        <button onClick={toggleSidebar} className="text-slate-400 hover:text-white">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 py-6">
          {/* Logo Header */}
          <div className="flex items-center gap-2.5 px-6 pb-6 border-b border-slate-800/60">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Landmark className="h-5 w-5 text-slate-950 font-bold" />
            </div>
            <span className="font-bold tracking-tight text-lg text-white">GovernMINT</span>
          </div>

          {/* Nav Links */}
          <nav className="mt-6 flex-1 space-y-1.5 px-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center gap-3 px-2 py-1.5 mb-3">
            <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 overflow-hidden font-semibold">
              {session?.user?.name ? (
                session.user.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{session?.user?.name || "Loading User..."}</p>
              <p className="text-[10px] text-slate-500 truncate capitalize">{session?.user?.role?.toLowerCase() || "Member"}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

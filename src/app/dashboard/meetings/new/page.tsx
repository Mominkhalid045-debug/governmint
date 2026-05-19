import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import MeetingForm from "./MeetingForm"

export default async function NewMeetingPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  // Only admins, chairs, and secretaries can schedule meetings
  const userRole = session.user.role
  if (
    userRole !== "SUPER_ADMIN" &&
    userRole !== "ADMIN" &&
    userRole !== "CHAIRPERSON" &&
    userRole !== "SECRETARY"
  ) {
    redirect("/dashboard/meetings")
  }

  // Find committees this user is authorized to schedule for.
  // If admin/super_admin, they can schedule for all committees.
  // If chairperson or secretary, they can schedule for committees they are members of.
  let committees = []
  if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
    committees = await prisma.committee.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: "asc"
      }
    })
  } else {
    committees = await prisma.committee.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id
          }
        }
      },
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: "asc"
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/dashboard/meetings"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assemblies
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Schedule Board Session</h1>
        <p className="text-slate-450 text-sm">
          Coordinate agenda topics, define schedules, and alert committee members.
        </p>
      </div>

      <MeetingForm committees={committees} />
    </div>
  )
}

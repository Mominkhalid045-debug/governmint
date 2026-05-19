import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import MeetingDetailView from "./MeetingDetailView"

export default async function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const { id } = await params

  // 1. Fetch meeting with full associations
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      committee: {
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      },
      createdBy: true,
      minutes: true,
      attendances: true
    }
  })

  if (!meeting) {
    redirect("/dashboard/meetings")
  }

  // 2. Resolve attendee status logs against the committee roster
  const attendeesMap = new Map(meeting.attendances.map(a => [a.userId, a.status]))
  const attendeesList = meeting.committee.members.map((m) => ({
    id: m.userId,
    name: m.user.name,
    email: m.user.email,
    status: (attendeesMap.get(m.userId) || "PENDING") as "PRESENT" | "ABSENT" | "EXCUSED" | "LATE" | "PENDING"
  }))

  // 3. Format meeting properties
  const meetingInfo = {
    id: meeting.id,
    title: meeting.title,
    description: meeting.description,
    scheduledAt: meeting.scheduledAt,
    location: meeting.location,
    committeeName: meeting.committee.name,
    createdByName: meeting.createdBy.name
  }

  // 4. Get saved minute transcripts
  const savedMinute = meeting.minutes
    ? {
        transcript: meeting.minutes.transcript,
        summary: meeting.minutes.summary
      }
    : null

  const userSession = {
    id: session.user.id,
    role: session.user.role
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/meetings"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assemblies
      </Link>

      <MeetingDetailView
        meeting={meetingInfo}
        attendees={attendeesList}
        userSession={userSession}
        savedMinute={savedMinute}
      />
    </div>
  )
}

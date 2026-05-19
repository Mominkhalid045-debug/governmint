"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { generateMeetingSummary } from "@/lib/ai"
import { sendEmail } from "@/lib/mail"

export async function createMeeting(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const scheduledAtString = formData.get("scheduledAt") as string
  const location = formData.get("location") as string
  const committeeId = formData.get("committeeId") as string

  if (!title || !scheduledAtString || !committeeId) {
    throw new Error("Title, scheduled time, and committee are required.")
  }

  const scheduledAt = new Date(scheduledAtString)

  try {
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        scheduledAt,
        location,
        committeeId,
        createdById: session.user.id,
      },
      include: {
        committee: {
          include: {
            members: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    // Log the audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "MEETING_CREATE",
        entity: "Meeting",
        entityId: meeting.id,
        metadata: JSON.stringify({ title, committeeId })
      }
    })

    // Auto-create blank attendance templates for all committee members
    const members = meeting.committee.members
    await prisma.attendance.createMany({
      data: members.map((m) => ({
        meetingId: meeting.id,
        userId: m.userId,
        status: "ABSENT" // Default status until verified
      }))
    })

    // Send notifications to all committee members via Resend
    const recipientEmails = members.map((m) => m.user.email).filter(Boolean)
    if (recipientEmails.length > 0) {
      await sendEmail({
        to: recipientEmails,
        subject: `New Meeting Scheduled: ${title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #0f172a;">
            <h2 style="color: #059669;">GovernMINT Meeting Invitation</h2>
            <p>A new meeting has been scheduled for the <strong>${meeting.committee.name}</strong>.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 120px;">Title:</td>
                <td style="padding: 8px 0; color: #0f172a;">${title}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Time:</td>
                <td style="padding: 8px 0; color: #0f172a;">${scheduledAt.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Location:</td>
                <td style="padding: 8px 0; color: #0f172a;">${location || "Not specified"}</td>
              </tr>
            </table>
            <p>Please log in to your dashboard to RSVP and check details.</p>
            <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8;">
              GovernMINT Governance Platform • Automated Notification
            </div>
          </div>
        `
      })
    }

    revalidatePath("/dashboard/meetings")
    return { success: true, meeting }
  } catch (error: unknown) {
    const err = error as { message?: string }
    return { error: err.message || "Failed to schedule meeting." }
  }
}

export async function rsvpMeeting(meetingId: string, status: "PRESENT" | "ABSENT" | "EXCUSED" | "LATE") {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }

  try {
    const attendance = await prisma.attendance.upsert({
      where: {
        meetingId_userId: {
          meetingId,
          userId: session.user.id
        }
      },
      update: {
        status
      },
      create: {
        meetingId,
        userId: session.user.id,
        status
      }
    })

    revalidatePath(`/dashboard/meetings/${meetingId}`)
    return { success: true, attendance }
  } catch (error: unknown) {
    const err = error as { message?: string }
    return { error: err.message || "Failed to RSVP." }
  }
}

export async function processMeetingMinutesAI(meetingId: string, transcript: string) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }

  try {
    // 1. Generate summary from Gemini
    const aiResult = await generateMeetingSummary(transcript)

    // 2. Upsert Minute
    const minute = await prisma.minute.upsert({
      where: { meetingId },
      update: {
        transcript,
        summary: aiResult.summary
      },
      create: {
        meetingId,
        transcript,
        summary: aiResult.summary
      }
    })

    // Log this action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "MEETING_MINUTES_AI",
        entity: "Minute",
        entityId: minute.id,
        metadata: JSON.stringify({ meetingId })
      }
    })

    revalidatePath(`/dashboard/meetings/${meetingId}`)
    return { success: true, minute, aiResult }
  } catch (error: unknown) {
    const err = error as { message?: string }
    return { error: err.message || "Failed to process AI summary." }
  }
}

export async function updateAttendeeAttendance(
  meetingId: string,
  userId: string,
  status: "PRESENT" | "ABSENT" | "EXCUSED" | "LATE"
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }

  // Verify scheduler role
  const userRole = session.user.role
  if (
    userRole !== "SUPER_ADMIN" &&
    userRole !== "ADMIN" &&
    userRole !== "CHAIRPERSON" &&
    userRole !== "SECRETARY"
  ) {
    throw new Error("Forbidden")
  }

  try {
    const attendance = await prisma.attendance.upsert({
      where: {
        meetingId_userId: {
          meetingId,
          userId
        }
      },
      update: {
        status
      },
      create: {
        meetingId,
        userId,
        status
      }
    })

    revalidatePath(`/dashboard/meetings/${meetingId}`)
    return { success: true, attendance }
  } catch (error: unknown) {
    const err = error as { message?: string }
    return { error: err.message || "Failed to update attendance." }
  }
}

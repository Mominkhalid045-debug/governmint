"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createCommittee(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }

  // Only admins and chairs can create committees
  const userRole = session.user.role
  if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN" && userRole !== "CHAIRPERSON") {
    throw new Error("Forbidden")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string

  if (!name) {
    throw new Error("Committee name is required")
  }

  try {
    const committee = await prisma.committee.create({
      data: {
        name,
        description,
        createdById: session.user.id,
        // Automatically make the creator a Chairperson member of the committee
        members: {
          create: {
            userId: session.user.id,
            designation: "Chairperson / Founder"
          }
        }
      }
    })

    // Log this action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "COMMITTEE_CREATE",
        entity: "Committee",
        entityId: committee.id,
        metadata: JSON.stringify({ name })
      }
    })

    revalidatePath("/dashboard/committees")
    return { success: true, committee }
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string }
    if (err.code === 'P2002') {
      return { error: "A committee with this name already exists." }
    }
    return { error: err.message || "Failed to create committee." }
  }
}

export async function addCommitteeMember(committeeId: string, email: string, designation: string) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }

  // Find user by email
  const userToAdd = await prisma.user.findUnique({
    where: { email }
  })

  if (!userToAdd) {
    return { error: "User not found with this email address." }
  }

  try {
    const member = await prisma.committeeMember.create({
      data: {
        committeeId,
        userId: userToAdd.id,
        designation
      }
    })

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "COMMITTEE_MEMBER_ADD",
        entity: "CommitteeMember",
        entityId: member.id,
        metadata: JSON.stringify({ committeeId, addedUserId: userToAdd.id })
      }
    })

    revalidatePath(`/dashboard/committees/${committeeId}`)
    return { success: true }
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string }
    if (err.code === 'P2002') {
      return { error: "This user is already a member of this committee." }
    }
    return { error: err.message || "Failed to add member." }
  }
}

export async function removeCommitteeMember(committeeId: string, memberId: string) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }

  try {
    const deleted = await prisma.committeeMember.delete({
      where: { id: memberId }
    })

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "COMMITTEE_MEMBER_REMOVE",
        entity: "CommitteeMember",
        entityId: memberId,
        metadata: JSON.stringify({ committeeId, removedUserId: deleted.userId })
      }
    })

    revalidatePath(`/dashboard/committees/${committeeId}`)
    return { success: true }
  } catch (error: unknown) {
    const err = error as { message?: string }
    return { error: err.message || "Failed to remove member." }
  }
}

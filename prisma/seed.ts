import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding initial database data...')

  // Hash passwords (default: password123)
  const passwordHash = await bcrypt.hash('password123', 10)

  // 1. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@governmint.com' },
    update: {},
    create: {
      email: 'admin@governmint.com',
      name: 'System Administrator',
      password: passwordHash,
      role: 'SUPER_ADMIN',
    },
  })

  const chair = await prisma.user.upsert({
    where: { email: 'chair@governmint.com' },
    update: {},
    create: {
      email: 'chair@governmint.com',
      name: 'Sarah Jenkins',
      password: passwordHash,
      role: 'CHAIRPERSON',
    },
  })

  const secretary = await prisma.user.upsert({
    where: { email: 'secretary@governmint.com' },
    update: {},
    create: {
      email: 'secretary@governmint.com',
      name: 'David Miller',
      password: passwordHash,
      role: 'SECRETARY',
    },
  })

  const member = await prisma.user.upsert({
    where: { email: 'member@governmint.com' },
    update: {},
    create: {
      email: 'member@governmint.com',
      name: 'Robert Chen',
      password: passwordHash,
      role: 'MEMBER',
    },
  })

  console.log('Users created:', { admin: admin.email, chair: chair.email, secretary: secretary.email, member: member.email })

  // 2. Create a Committee (created by Admin)
  const academicCommittee = await prisma.committee.upsert({
    where: { name: 'Academic Senate Committee' },
    update: {},
    create: {
      name: 'Academic Senate Committee',
      description: 'Handles review and coordination of undergraduate curriculum, academic policy reviews, and degree requirements.',
      createdById: admin.id,
    },
  })

  console.log('Committee created:', academicCommittee.name)

  // 3. Assign Members to the Committee
  await prisma.committeeMember.upsert({
    where: {
      committeeId_userId: {
        committeeId: academicCommittee.id,
        userId: chair.id,
      },
    },
    update: {},
    create: {
      committeeId: academicCommittee.id,
      userId: chair.id,
      designation: 'Chairperson',
    },
  })

  await prisma.committeeMember.upsert({
    where: {
      committeeId_userId: {
        committeeId: academicCommittee.id,
        userId: secretary.id,
      },
    },
    update: {},
    create: {
      committeeId: academicCommittee.id,
      userId: secretary.id,
      designation: 'Secretary',
    },
  })

  await prisma.committeeMember.upsert({
    where: {
      committeeId_userId: {
        committeeId: academicCommittee.id,
        userId: member.id,
      },
    },
    update: {},
    create: {
      committeeId: academicCommittee.id,
      userId: member.id,
      designation: 'Regular Member',
    },
  })

  console.log('Committee members assigned successfully.')
  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

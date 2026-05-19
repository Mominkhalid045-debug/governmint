import { PrismaClient } from '@prisma/client'

const getDbUrl = () => {
  let url = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
  if (url && !url.includes('pgbouncer=true')) {
    url += url.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true';
  }
  return url;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: getDbUrl(),
      },
    },
  })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

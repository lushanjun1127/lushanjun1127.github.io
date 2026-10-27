import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// DATABASE_URL_UNPOOLED（schema 中的 directUrl）为可选：
// 未配置时回退使用 DATABASE_URL 的连接串，避免构建/运行时初始化报错。
function createPrismaClient() {
  if (!process.env.DATABASE_URL_UNPOOLED) {
    return new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL } },
    })
  }
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


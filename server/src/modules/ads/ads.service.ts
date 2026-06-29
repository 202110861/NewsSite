import { z } from 'zod'
import { prisma } from '../../db/client.js'
import { AppError } from '../../middlewares/errorHandler.middleware.js'

export async function getActiveAdBySlot(slotKey: string) {
  const now = new Date()
  const ad = await prisma.advertisement.findFirst({
    where: {
      slotId: slotKey,
      isActive: true,
      startAt: { lte: now },
      endAt: { gte: now },
    },
    orderBy: { createdAt: 'desc' },
  })
  return ad
}

export async function recordImpression(id: string) {
  const ad = await prisma.advertisement.update({
    where: { id },
    data: { impressionCount: { increment: 1 } },
  })
  return ad
}

export async function recordClick(id: string) {
  const ad = await prisma.advertisement.update({
    where: { id },
    data: { clickCount: { increment: 1 } },
  })
  return ad
}

export async function listAdminAds() {
  return prisma.advertisement.findMany({
    include: { slot: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createAd(input: {
  slotId: string
  imageUrl: string
  linkUrl: string
  startAt: Date
  endAt: Date
  isActive?: boolean
}) {
  const slot = await prisma.adSlot.findUnique({ where: { id: input.slotId } })
  if (!slot) throw new AppError(404, '광고 슬롯을 찾을 수 없습니다.')
  return prisma.advertisement.create({ data: input })
}

export async function updateAd(
  id: string,
  input: Partial<{
    slotId: string
    imageUrl: string
    linkUrl: string
    startAt: Date
    endAt: Date
    isActive: boolean
  }>,
) {
  return prisma.advertisement.update({ where: { id }, data: input })
}

export async function deleteAd(id: string) {
  await prisma.advertisement.delete({ where: { id } })
}

export const createAdSchema = z.object({
  slotId: z.string().min(1),
  imageUrl: z.string().url(),
  linkUrl: z.string().url(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  isActive: z.boolean().optional(),
})

export const updateAdSchema = createAdSchema.partial()

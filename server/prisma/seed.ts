import { PrismaClient } from '@prisma/client'
import { seedPaymentTestUser, seedSections } from './seed-shared.js'

const prisma = new PrismaClient()

const adSlots = [
  { id: 'home_side_left', label: '홈 좌측 배너' },
  { id: 'home_side_right', label: '홈 우측 배너' },
  { id: 'article_inline', label: '기사 본문 중간' },
]

const plans = [
  { amount: 5000, label: '기본 후원' },
  { amount: 9000, label: '특별 후원' },
]

async function main() {
  await seedSections(prisma)

  for (const slot of adSlots) {
    await prisma.adSlot.upsert({
      where: { id: slot.id },
      update: { label: slot.label },
      create: slot,
    })
  }

  for (const plan of plans) {
    const existing = await prisma.subscriptionPlan.findFirst({ where: { amount: plan.amount } })
    if (!existing) {
      await prisma.subscriptionPlan.create({ data: plan })
    } else {
      await prisma.subscriptionPlan.update({
        where: { id: existing.id },
        data: { label: plan.label, isActive: true },
      })
    }
  }

  await prisma.subscriptionPlan.updateMany({
    where: { amount: { notIn: [5000, 9000] } },
    data: { isActive: false },
  })

  await seedPaymentTestUser(prisma)

  const now = new Date()
  const end = new Date(now)
  end.setFullYear(end.getFullYear() + 1)

  const adData = [
    {
      slotId: 'home_side_left',
      imageUrl: 'https://picsum.photos/seed/ad-left/160/600',
      linkUrl: 'https://example.com/ad-left',
    },
    {
      slotId: 'home_side_right',
      imageUrl: 'https://picsum.photos/seed/ad-right/160/600',
      linkUrl: 'https://example.com/ad-right',
    },
    {
      slotId: 'article_inline',
      imageUrl: 'https://picsum.photos/seed/ad-inline/728/90',
      linkUrl: 'https://example.com/ad-inline',
    },
  ]

  for (const ad of adData) {
    const existing = await prisma.advertisement.findFirst({ where: { slotId: ad.slotId } })
    if (!existing) {
      await prisma.advertisement.create({
        data: { ...ad, startAt: now, endAt: end, isActive: true },
      })
    }
  }

  console.log('Seed completed. 기사 데이터는 npm run db:import-mockdata 로 넣으세요.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

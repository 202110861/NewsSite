import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/utils/password.js'

const prisma = new PrismaClient()

const sections = [
  { id: 'politics', label: '정치' },
  { id: 'economy', label: '경제' },
  { id: 'society', label: '사회' },
  { id: 'culture', label: '문화/전시' },
  { id: 'entertainment', label: '연예/스포츠' },
  { id: 'local', label: '지역뉴스' },
  { id: 'event', label: '이벤트/행사' },
  { id: 'video', label: '영상뉴스' },
  { id: 'cardNews', label: '카드뉴스' },
  { id: 'shorts', label: '숏컷뉴스' },
]

const adSlots = [
  { id: 'home_side_left', label: '홈 좌측 배너' },
  { id: 'home_side_right', label: '홈 우측 배너' },
  { id: 'article_inline', label: '기사 본문 중간' },
]

const plans = [
  { amount: 5000, label: '커피 한 잔' },
  { amount: 7000, label: '든든한 후원' },
  { amount: 9000, label: '특별 후원' },
]

async function main() {
  for (const section of sections) {
    await prisma.section.upsert({
      where: { id: section.id },
      update: { label: section.label },
      create: section,
    })
  }

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
    }
  }

  const adminHash = await hashPassword('admin1234')
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  })

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

  console.log('Seed completed.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

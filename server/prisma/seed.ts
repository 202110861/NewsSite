import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/utils/password.js'

const prisma = new PrismaClient()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsImagesDir = path.resolve(__dirname, '../uploads/images')
const frontendImagesDir = path.resolve(__dirname, '../../version-4/src/images')

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

async function importFrontendImages() {
  mkdirSync(uploadsImagesDir, { recursive: true })
  const imported: Record<string, string> = {}

  try {
    const files = readdirSync(frontendImagesDir).filter((name) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(name),
    )

    for (const originalName of files) {
      const destName = originalName
      const sourcePath = path.join(frontendImagesDir, originalName)
      const destPath = path.join(uploadsImagesDir, destName)
      copyFileSync(sourcePath, destPath)

      const filePath = `images/${destName}`
      const url = `/uploads/${filePath}`

      await prisma.mediaAsset.upsert({
        where: { id: originalName },
        update: { url, filename: destName, originalName, mimeType: 'image/jpeg', size: 0 },
        create: {
          id: originalName,
          filename: destName,
          originalName,
          mimeType: 'image/jpeg',
          size: 0,
          url,
        },
      })

      imported[originalName] = filePath
    }
  } catch {
    console.warn('프론트 이미지 폴더를 찾지 못했습니다. 샘플 기사 이미지는 건너뜁니다.')
  }

  return imported
}

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

  const adminHash = await hashPassword('Songdo94!')
  await prisma.user.upsert({
    where: { username: 'lawform0511' },
    update: { passwordHash: adminHash, role: 'ADMIN' },
    create: {
      username: 'lawform0511',
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

  await importFrontendImages()

  console.log('Seed completed. 기사 데이터는 npm run db:import-mockdata 로 넣으세요.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

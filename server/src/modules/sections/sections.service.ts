import { prisma } from '../../db/client.js'

export async function listSections() {
  return prisma.section.findMany({
    orderBy: { label: 'asc' },
  })
}

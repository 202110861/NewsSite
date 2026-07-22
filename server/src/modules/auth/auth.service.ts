import { prisma } from '../../db/client.js'
import { AppError } from '../../middlewares/errorHandler.middleware.js'
import { hashPassword, verifyPassword } from '../../utils/password.js'
import {
  getRefreshExpiry,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.js'

export async function checkUsernameAvailable(username: string) {
  const existing = await prisma.user.findUnique({ where: { username } })
  return { available: !existing }
}

export async function signup(username: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) throw new AppError(409, '이미 사용 중인 아이디입니다.')

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { username, passwordHash },
  })

  return { id: user.id, username: user.username, role: user.role }
}

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    throw new AppError(401, '아이디 또는 비밀번호가 올바르지 않습니다.')
  }

  const accessToken = signAccessToken({
    sub: user.id,
    username: user.username,
    role: user.role,
  })
  const refreshToken = signRefreshToken(user.id)

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: getRefreshExpiry(),
    },
  })

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, username: user.username, role: user.role },
  }
}

export async function refreshAccessToken(refreshToken: string) {
  let payload: { sub: string }
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw new AppError(401, '유효하지 않은 refresh token입니다.')
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, '만료된 refresh token입니다.')
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  if (!user) throw new AppError(401, '사용자를 찾을 수 없습니다.')

  const accessToken = signAccessToken({
    sub: user.id,
    username: user.username,
    role: user.role,
  })

  return { accessToken, user: { id: user.id, username: user.username, role: user.role } }
}

export async function logout(refreshToken: string | undefined) {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
  }
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, role: true, createdAt: true, passwordHash: true },
  })
  if (!user) throw new AppError(404, '사용자를 찾을 수 없습니다.')
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    hasPassword: Boolean(user.passwordHash),
  }
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError(404, '사용자를 찾을 수 없습니다.')
  if (!user.passwordHash) {
    throw new AppError(400, '비밀번호가 설정되지 않은 계정입니다.')
  }
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    throw new AppError(401, '기존 비밀번호가 올바르지 않습니다.')
  }

  const passwordHash = await hashPassword(newPassword)
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  })

  await prisma.refreshToken.deleteMany({ where: { userId } })

  return { message: '비밀번호가 변경되었습니다.' }
}

export async function deleteAccount(userId: string, password: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError(404, '사용자를 찾을 수 없습니다.')
  if (!user.passwordHash) {
    throw new AppError(400, '비밀번호가 설정되지 않은 계정입니다.')
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    throw new AppError(401, '비밀번호가 올바르지 않습니다.')
  }

  await prisma.$transaction(async (tx) => {
    const subscriptions = await tx.subscription.findMany({
      where: { userId },
      select: { id: true },
    })
    const subscriptionIds = subscriptions.map((s) => s.id)
    if (subscriptionIds.length > 0) {
      await tx.payment.deleteMany({
        where: { subscriptionId: { in: subscriptionIds } },
      })
      await tx.subscription.deleteMany({ where: { userId } })
    }
    await tx.user.delete({ where: { id: userId } })
  })

  return { message: '회원 탈퇴가 완료되었습니다.' }
}

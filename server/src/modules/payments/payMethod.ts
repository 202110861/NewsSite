import { PayMethod } from '@prisma/client'

export type { PayMethod }

/**
 * 일반 사용자에게 허용하는 결제 수단.
 * 실연동 오픈 전까지 비워 두고, UI는 DISPLAY / COMING_SOON 으로만 노출한다.
 */
export const ACTIVE_PAY_METHODS = [] as const satisfies readonly PayMethod[]

/**
 * 결제 테스트 계정(username `admin` 또는 PAYMENT_TEST_USERNAMES)에게만 허용.
 */
export const TEST_ACTIVE_PAY_METHODS = [
  'PHONE',
  'TOSS_PAY',
  'KAKAO_PAY',
] as const satisfies readonly PayMethod[]

/** API 요청으로 들어올 수 있는 결제 수단 (표시용 포함) */
export const REQUESTABLE_PAY_METHODS = [
  'PHONE',
  'TOSS_PAY',
  'KAKAO_PAY',
] as const satisfies readonly PayMethod[]

/** 화면에 보이지만 결제 불가(심사·연동 중) — 일반 사용자 기준 */
export const COMING_SOON_PAY_METHODS = [
  'PHONE',
  'TOSS_PAY',
  'KAKAO_PAY',
] as const satisfies readonly PayMethod[]

/** 결제 수단 UI 배치 (가로 1행) */
export const PAY_METHOD_ROWS = [
  ['PHONE', 'TOSS_PAY', 'KAKAO_PAY'],
] as const satisfies readonly (readonly PayMethod[])[]

export const DISPLAY_PAY_METHODS = PAY_METHOD_ROWS.flat() as readonly PayMethod[]

export type ActivePayMethod = (typeof ACTIVE_PAY_METHODS)[number]
export type TestActivePayMethod = (typeof TEST_ACTIVE_PAY_METHODS)[number]
export type RequestablePayMethod = (typeof REQUESTABLE_PAY_METHODS)[number]
export type ComingSoonPayMethod = (typeof COMING_SOON_PAY_METHODS)[number]

export const PAY_METHOD_LABELS: Record<PayMethod, string> = {
  PHONE: '휴대폰 소액결제',
  KAKAO_PAY: '카카오페이',
  NAVER_PAY: '네이버페이',
  TOSS_PAY: '토스페이',
  K_BANK: '케이뱅크',
  KAKAO_BANK: '카카오뱅크',
}

export function isActivePayMethod(value: string): value is ActivePayMethod {
  return (ACTIVE_PAY_METHODS as readonly string[]).includes(value)
}

export function isTestActivePayMethod(
  value: string,
): value is TestActivePayMethod {
  return (TEST_ACTIVE_PAY_METHODS as readonly string[]).includes(value)
}

export function isComingSoonPayMethod(
  value: string,
): value is ComingSoonPayMethod {
  return (COMING_SOON_PAY_METHODS as readonly string[]).includes(value)
}

/** 일반 허용 수단 ∪ (테스트 계정이면 테스트 허용 수단) */
export function getAllowedPayMethods(isPaymentTester: boolean): readonly string[] {
  if (!isPaymentTester) return ACTIVE_PAY_METHODS
  return [...new Set([...ACTIVE_PAY_METHODS, ...TEST_ACTIVE_PAY_METHODS])]
}

export function isAccountPayMethod(payMethod: PayMethod): boolean {
  return payMethod === 'K_BANK' || payMethod === 'KAKAO_BANK'
}

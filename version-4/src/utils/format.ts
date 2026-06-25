export function formatTimeAgo(iso: string): string {
  const date = new Date(iso)
  const now = new Date('2026-06-25T10:00:00+09:00')
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return '방금'
  if (diffMin < 60) return `${diffMin}분 전`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간 전`
  const diffDay = Math.floor(diffHour / 24)
  return `${diffDay}일 전`
}

export function formatMastheadDate(): string {
  const now = new Date('2026-06-25T10:00:00+09:00')
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const d = now.getDate()
  const day = days[now.getDay()]
  return `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')} (${day})`
}

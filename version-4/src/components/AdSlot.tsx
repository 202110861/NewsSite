import { useEffect, useState } from 'react'
import { api, type Advertisement } from '../lib/api'

interface AdSlotProps {
  slotKey: string
  className?: string
}

export default function AdSlot({ slotKey, className = '' }: AdSlotProps) {
  const [ad, setAd] = useState<Advertisement | null>(null)

  useEffect(() => {
    let cancelled = false

    api
      .get<Advertisement>(`/ads/slots/${slotKey}`)
      .then((data) => {
        if (!cancelled) setAd(data)
      })
      .catch(() => {
        if (!cancelled) setAd(null)
      })

    return () => {
      cancelled = true
    }
  }, [slotKey])

  useEffect(() => {
    if (!ad) return
    api.post(`/ads/${ad.id}/impression`).catch(() => {})
  }, [ad])

  if (!ad) return null

  async function handleClick() {
    if (!ad) return
    try {
      await api.post(`/ads/${ad.id}/click`)
    } finally {
      window.open(ad.linkUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`block overflow-hidden rounded-lg border border-ink-900/10 bg-paper-100 transition hover:border-gold-500/40 ${className}`}
      aria-label="광고"
    >
      <img src={ad.imageUrl} alt="" className="h-full w-full object-cover" />
    </button>
  )
}

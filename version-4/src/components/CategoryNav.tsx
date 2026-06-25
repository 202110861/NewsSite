import { useState } from 'react'
import { sections } from '../data/sections'

export default function CategoryNav() {
  const [active, setActive] = useState<string>('home')

  return (
    <nav className="sticky top-0 z-30 border-b border-ink-900/10 bg-ink-900">
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 scrollbar-hide sm:px-4">
        <li>
          <button
            onClick={() => setActive('home')}
            className={`whitespace-nowrap px-4 py-3.5 text-sm font-bold tracking-tight transition ${
              active === 'home'
                ? 'bg-flash-600 text-white'
                : 'text-paper-200 hover:bg-ink-800'
            }`}
          >
            홈
          </button>
        </li>
        {sections.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => setActive(s.id)}
              className={`whitespace-nowrap px-4 py-3.5 text-sm font-bold tracking-tight transition ${
                active === s.id
                  ? 'bg-flash-600 text-white'
                  : 'text-paper-200 hover:bg-ink-800'
              }`}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

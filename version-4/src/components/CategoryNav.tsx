import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { sections } from '../data/sections'

export default function CategoryNav() {
  const [active, setActive] = useState<string>('home')
  const navigate = useNavigate()

  return (
    <nav className="sticky top-0 z-30 border-b border-ink-900/10 bg-ink-900">
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 scrollbar-hide sm:px-4">
        <li>
          <Link
            to="/"
            onClick={() => setActive('home')}
            className={`block whitespace-nowrap px-4 py-3.5 text-sm font-bold tracking-tight transition ${
              active === 'home'
                ? 'bg-flash-600 text-white'
                : 'text-paper-200 hover:bg-ink-800'
            }`}
          >
            홈
          </Link>
        </li>
        {sections.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => {
                setActive(s.id)
                navigate('/')
              }}
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

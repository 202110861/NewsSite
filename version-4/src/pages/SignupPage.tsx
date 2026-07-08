import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, api } from '../lib/api'

export default function SignupPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [usernameCheck, setUsernameCheck] = useState<'idle' | 'available' | 'taken'>('idle')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleCheckUsername() {
    if (username.length < 3) {
      setError('아이디는 3자 이상이어야 합니다.')
      return
    }
    setError('')
    try {
      const result = await api.get<{ available: boolean }>(
        `/auth/check-username?username=${encodeURIComponent(username)}`,
      )
      setUsernameCheck(result.available ? 'available' : 'taken')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '중복 확인에 실패했습니다.')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/auth/signup', { username, password })
      navigate('/login', { state: { message: '회원가입이 완료되었습니다. 로그인해 주세요.' } })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '회원가입에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-ink-900">회원가입</h1>
      <p className="mt-2 text-sm text-ink-500">경제인뉴스 계정을 만들어 보세요.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-ink-700">
            아이디
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setUsernameCheck('idle')
              }}
              className="flex-1 rounded-lg border border-ink-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-flash-600"
            />
            <button
              type="button"
              onClick={handleCheckUsername}
              className="shrink-0 rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-paper-100"
            >
              중복 확인
            </button>
          </div>
          {usernameCheck === 'available' && (
            <p className="mt-1 text-xs text-section-economy">사용 가능한 아이디입니다.</p>
          )}
          {usernameCheck === 'taken' && (
            <p className="mt-1 text-xs text-flash-600">이미 사용 중인 아이디입니다.</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-ink-700">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ink-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-flash-600"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-ink-700">
            비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ink-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-flash-600"
          />
        </div>

        {error && <p className="text-sm text-flash-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-flash-600 py-3 text-sm font-bold text-white hover:bg-flash-700 disabled:opacity-60"
        >
          {submitting ? '가입 중...' : '회원가입'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="font-semibold text-flash-600 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  )
}

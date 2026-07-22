import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { getApiErrorMessage } from "../lib/errors";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteAccountModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSubmitting(false);
  }, [open]);

  if (!open) return null;

  const canSubmit =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setSubmitting(true);
    try {
      await api.delete("/users/me", {
        password,
        confirmPassword,
      });
      onSuccess();
    } catch (err) {
      setError(getApiErrorMessage(err, "회원 탈퇴에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        className="w-full max-w-md rounded-xl border border-ink-900/10 bg-paper-50 p-6 shadow-xl"
      >
        <h2
          id="delete-account-title"
          className="text-lg font-bold text-ink-900"
        >
          회원 탈퇴
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          탈퇴하면 계정과 관련 데이터가 삭제되며 되돌릴 수 없습니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="deletePassword"
              className="block text-sm font-semibold text-ink-700"
            >
              비밀번호
            </label>
            <input
              id="deletePassword"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-ink-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-flash-600"
            />
          </div>

          <div>
            <label
              htmlFor="deleteConfirmPassword"
              className="block text-sm font-semibold text-ink-700"
            >
              비밀번호 확인
            </label>
            <input
              id="deleteConfirmPassword"
              type="password"
              autoComplete="current-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-ink-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-flash-600"
            />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="mt-1 text-xs text-flash-600">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>

          {error && <p className="text-sm text-flash-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-ink-900/15 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-paper-100"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="flex-1 rounded-lg bg-flash-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-flash-700 disabled:opacity-60"
            >
              {submitting ? "탈퇴 중…" : "탈퇴하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

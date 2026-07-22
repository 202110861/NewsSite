import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchMyComments,
  fetchMyLikes,
  type MyCommentItem,
  type MyLikeItem,
} from "../lib/engagement";
import {
  api,
  PAY_METHOD_LABELS,
  type PayMethod,
  type SubscriptionPlan,
} from "../lib/api";
import { getApiErrorMessage } from "../lib/errors";
import { sectionMap } from "../data/sections";
import type { SectionId } from "../types/news";
import ChangePasswordModal from "../components/ChangePasswordModal";
import DeleteAccountModal from "../components/DeleteAccountModal";

interface MySubscription {
  id: string;
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED";
  payMethod: PayMethod;
  phoneNumber: string;
  startedAt: string;
  plan: SubscriptionPlan;
  payments?: {
    status: "PENDING" | "SUCCESS" | "FAILED";
    amount: number;
    merchantUid: string | null;
    paidAt: string | null;
  }[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function MyPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [likes, setLikes] = useState<MyLikeItem[]>([]);
  const [comments, setComments] = useState<MyCommentItem[]>([]);
  const [subscription, setSubscription] = useState<MySubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([
      fetchMyLikes(),
      fetchMyComments(),
      api.get<MySubscription | null>("/subscriptions/me"),
    ])
      .then(([likeList, commentList, sub]) => {
        if (cancelled) return;
        setLikes(likeList);
        setComments(commentList);
        setSubscription(sub);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            getApiErrorMessage(err, "마이페이지 정보를 불러오지 못했습니다."),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCancelSubscription() {
    if (!subscription) return;
    const methodLabel = PAY_METHOD_LABELS[subscription.payMethod];
    if (
      !window.confirm(
        `${methodLabel} 후원 구독을 해지하시겠습니까?\n해지 후 다음 달부터 결제되지 않습니다.`,
      )
    ) {
      return;
    }
    setCancelling(true);
    setError("");
    try {
      await api.patch("/subscriptions/me/cancel");
      setSubscription(null);
      window.alert("해지되었습니다.");
    } catch (err) {
      setError(getApiErrorMessage(err, "해지에 실패했습니다."));
    } finally {
      setCancelling(false);
    }
  }

  async function handlePasswordChanged() {
    setChangePasswordOpen(false);
    window.alert("비밀번호가 변경되었습니다. 다시 로그인해 주세요.");
    await logout();
    navigate("/login", { replace: true });
  }

  async function handleAccountDeleted() {
    setDeleteAccountOpen(false);
    window.alert("회원 탈퇴가 완료되었습니다.");
    await logout();
    navigate("/", { replace: true });
  }

  const pendingPayment = subscription?.payments?.find(
    (p) => p.status === "PENDING",
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-ink-500">
        불러오는 중…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-ink-900">마이페이지</h1>
      <div className="mt-2 flex flex-col bg-white rounded-xl border border-ink-900/10 p-5">
        <p className="text-sm text-ink-600">
          {user?.username}님이 좋아요한 기사와 작성한 댓글입니다.
        </p>

        {error && <p className="mt-1 text-sm text-flash-600">{error}</p>}

        <section className="mt-5">
          <h2 className="text-lg font-bold text-ink-900">후원 구독</h2>
          {!subscription ? (
            <p className="mt-3 text-sm text-ink-500">
              진행 중인 후원이 없습니다.{" "}
              <Link
                to="/support"
                className="font-semibold text-flash-600 underline"
              >
                후원하기
              </Link>
            </p>
          ) : (
            <div className="mt-4 border-t border-ink-900/10 pt-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-base font-bold text-ink-900">
                  {subscription.plan.label}
                </p>
                <p className="text-lg font-bold text-ink-900">
                  {subscription.plan.amount.toLocaleString("ko-KR")}
                  <span className="text-sm font-normal text-ink-500">원/월</span>
                </p>
              </div>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="grid grid-cols-[5.5rem_1fr] items-baseline gap-x-3">
                  <dt className="text-ink-400">결제 수단</dt>
                  <dd className="font-medium text-ink-800">
                    {PAY_METHOD_LABELS[subscription.payMethod]}
                  </dd>
                </div>
                <div className="grid grid-cols-[5.5rem_1fr] items-baseline gap-x-3">
                  <dt className="text-ink-400">상태</dt>
                  <dd
                    className={
                      subscription.status === "ACTIVE"
                        ? "font-semibold text-ink-900"
                        : "font-semibold text-gold-600"
                    }
                  >
                    {subscription.status === "ACTIVE"
                      ? "이용 중"
                      : subscription.status === "PAST_DUE"
                        ? "결제 대기"
                        : "해지됨"}
                  </dd>
                </div>
                <div className="grid grid-cols-[5.5rem_1fr] items-baseline gap-x-3">
                  <dt className="text-ink-400">시작일</dt>
                  <dd className="font-medium text-ink-800">
                    {formatDateOnly(subscription.startedAt)}
                  </dd>
                </div>
              </dl>
              {pendingPayment && subscription.status === "ACTIVE" && (
                <p className="mt-3 text-xs text-ink-500">
                  다음 자동결제 {pendingPayment.amount.toLocaleString("ko-KR")}
                  원 예약됨
                </p>
              )}
              {subscription.status === "ACTIVE" && (
                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="mt-4 rounded-lg border border-ink-900/15 bg-white px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-paper-100 disabled:opacity-60"
                >
                  {cancelling ? "해지 중…" : "구독 해지"}
                </button>
              )}
              {subscription.status === "PAST_DUE" && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs text-ink-500">
                    정기 결제에 실패했습니다. 결제 수단을 확인하거나 해지할 수
                    있습니다.
                  </p>
                  <button
                    type="button"
                    onClick={handleCancelSubscription}
                    disabled={cancelling}
                    className="rounded-lg border border-ink-900/15 bg-white px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-paper-100 disabled:opacity-60"
                  >
                    {cancelling ? "해지 중…" : "구독 해지"}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-ink-900">좋아요한 기사</h2>
          {likes.length === 0 ? (
            <p className="mt-3 text-sm text-ink-500">
              아직 좋아요한 기사가 없습니다.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-ink-900/10 border-y border-ink-900/10">
              {likes.map((item) => {
                const sectionLabel =
                  sectionMap[item.article.section as SectionId]?.label ??
                  "뉴스";
                return (
                  <li key={item.id}>
                    <Link
                      to={`/article/${item.article.id}`}
                      className="block py-3.5 hover:bg-paper-100"
                    >
                      <span className="text-xs font-semibold text-ink-500">
                        {sectionLabel}
                      </span>
                      <p className="mt-1 text-sm font-semibold text-ink-900">
                        {item.article.title}
                      </p>
                      <time
                        dateTime={item.createdAt}
                        className="mt-1 block text-xs text-ink-400"
                      >
                        좋아요 · {formatDate(item.createdAt)}
                      </time>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-ink-900">작성한 댓글</h2>
          {comments.length === 0 ? (
            <p className="mt-3 text-sm text-ink-500">
              아직 작성한 댓글이 없습니다.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-ink-900/10 border-y border-ink-900/10">
              {comments.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/article/${item.article.id}`}
                    className="block py-3.5 hover:bg-paper-100"
                  >
                    <p className="text-sm text-ink-800">{item.body}</p>
                    <p className="mt-1.5 text-xs text-ink-500">
                      기사 · {item.article.title}
                    </p>
                    <time
                      dateTime={item.createdAt}
                      className="mt-1 block text-xs text-ink-400"
                    >
                      {formatDate(item.createdAt)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <div className="mt-2 flex flex-col bg-white rounded-xl border border-ink-900/10 p-5">
        <section>
          <h2 className="text-lg font-bold text-ink-900">계정 설정</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setChangePasswordOpen(true)}
              className="rounded-lg border border-ink-900/15 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-paper-100"
            >
              비밀번호 변경
            </button>
            <button
              type="button"
              onClick={() => setDeleteAccountOpen(true)}
              className="rounded-lg border border-flash-600/30 px-4 py-2.5 text-sm font-semibold text-flash-600 hover:bg-flash-50"
            >
              회원 탈퇴
            </button>
          </div>
        </section>

        <ChangePasswordModal
          open={changePasswordOpen}
          onClose={() => setChangePasswordOpen(false)}
          onSuccess={handlePasswordChanged}
        />
        <DeleteAccountModal
          open={deleteAccountOpen}
          onClose={() => setDeleteAccountOpen(false)}
          onSuccess={handleAccountDeleted}
        />
      </div>
    </div>
  );
}

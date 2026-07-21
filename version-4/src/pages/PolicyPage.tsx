import { Link, Navigate, useParams } from "react-router-dom";
import SeoHead from "../components/SeoHead";
import { PrivacyPolicyContent } from "../data/policies/PrivacyPolicyContent";
import { TermsPolicyContent } from "../data/policies/TermsPolicyContent";
import { YouthPolicyContent } from "../data/policies/YouthPolicyContent";

export const policies = [
  { id: "youth", label: "청소년보호정책" },
  { id: "personal", label: "개인정보처리방침" },
  { id: "terms", label: "이용약관" },
] as const;

export type PolicyType = (typeof policies)[number]["id"];

const policyMap = Object.fromEntries(
  policies.map((policy) => [policy.id, policy]),
) as Record<PolicyType, (typeof policies)[number]>;

function isPolicyType(value: string | undefined): value is PolicyType {
  return !!value && value in policyMap;
}

export default function PolicyPage() {
  const { type } = useParams<{ type: string }>();

  if (!isPolicyType(type)) {
    return <Navigate to="/" replace />;
  }

  const policy = policyMap[type];

  return (
    <>
      <SeoHead
        title={`${policy.label} - 경제인뉴스`}
        description={`경제인뉴스 ${policy.label}`}
        path={`/policy/${type}`}
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
          {policies.map((item) => (
            <Link
              key={item.id}
              to={`/policy/${item.id}`}
              className={
                item.id === type
                  ? "font-semibold text-flash-600"
                  : "hover:text-flash-600"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">
          {policy.label}
        </h1>

        {type === "youth" && <YouthPolicyContent />}
        {type === "personal" && <PrivacyPolicyContent />}
        {type === "terms" && <TermsPolicyContent />}
      </div>
    </>
  );
}

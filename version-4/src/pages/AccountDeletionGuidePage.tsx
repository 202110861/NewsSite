import { Link } from "react-router-dom";
import SeoHead from "../components/SeoHead";

export default function AccountDeletionGuidePage() {
  return (
    <>
      <SeoHead
        title="데이터 삭제 안내 - 경제인뉴스"
        description="경제인뉴스 회원 탈퇴 및 데이터 삭제 안내"
        path="/account-deletion"
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold text-ink-900">데이터 삭제 안내</h1>
        <div className="mt-2 flex flex-col bg-white rounded-xl border border-ink-900/10 p-5">
          <p className="text-sm leading-relaxed text-ink-700 sm:text-base">
            데이터 삭제(회원 탈퇴)를 원하시면 로그인 후{" "}
            <Link
              to="/mypage"
              className="font-semibold text-flash-600 underline"
            >
              마이페이지
            </Link>
            에서 탈퇴 버튼을 눌러주세요.
          </p>
        </div>
      </div>
    </>
  );
}

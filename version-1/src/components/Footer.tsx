import { PLACEHOLDER_LOGO } from "../utils/placeholders";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-6 sm:mt-7 bg-gray-50">
      <div className="max-w-[1280px] mx-auto px-3 pt-6 pb-8 sm:pb-10">
        <a href="#top">
          <img
            src={PLACEHOLDER_LOGO}
            alt="로고"
            className="opacity-85 max-w-[160px] sm:max-w-[200px]"
          />
        </a>
        <div className="text-[11px] sm:text-xs text-gray-500 my-3.5 leading-relaxed">
          <a href="#privacy" className="text-gray-500 no-underline hover:text-gray-700">
            개인정보취급방침
          </a>{" "}
          ㅣ{" "}
          <a href="#about" className="text-gray-500 no-underline hover:text-gray-700">
            회사소개
          </a>{" "}
          ㅣ{" "}
          <a href="#ads" className="text-gray-500 no-underline hover:text-gray-700">
            광고/제휴 안내
          </a>{" "}
          ㅣ{" "}
          <a href="#tip" className="text-gray-500 no-underline hover:text-gray-700">
            기사제보
          </a>{" "}
          ㅣ{" "}
          <a href="#press" className="text-gray-500 no-underline hover:text-gray-700">
            보도자료
          </a>{" "}
          ㅣ{" "}
          <a href="#search" className="text-gray-500 no-underline hover:text-gray-700">
            기사검색
          </a>
        </div>
        <p className="text-[10px] sm:text-[11px] text-gray-400 leading-6 sm:leading-7">
          인터넷신문 데모버전 ㅣ 주소 : 경기도 성남시 분당구 서현로204, 922호 ㅣ
          전화 : 031-708-3799 ㅣ 팩스 031-601-8799
          <br />
          등록번호 : 경기 아,00000 ㅣ 등록일 : 2003.00.00 ㅣ E-mail :
          abc@example.net
          <br />
          회사명 : (주)데모미디어 ㅣ 발행/편집인 : 홍길동 ㅣ 청소년보호책임자 :
          홍길동
          <br />
          Copyright ⓒ 2024 데모미디어. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

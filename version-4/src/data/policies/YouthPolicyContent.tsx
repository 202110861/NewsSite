import {
  PolicyContact,
  PolicyP,
  PolicySection,
  PolicySub,
} from "./PolicyBlocks";

export function YouthPolicyContent() {
  return (
    <>
      <PolicySection>
        <PolicyP>
          경제인뉴스는 각종 청소년 유해환경으로부터 청소년을 보호하고자
          정보통신망이용촉진 및 정보보호 등에 관한 법률, 신문 등의 진흥에 관한
          법률 및 청소년보호법에 근거하여 청소년 보호정책을 마련하여 시행하고
          있습니다. 경제인뉴스는 정보통신윤리위원회 심의규정 및 청소년보호위원회
          청소년유해매체물 기준에 따라, 19세 미만의 청소년들이 유해정보에 접근할
          수 없도록 규제합니다. 경제인뉴스가 청소년 보호를 위해 어떠한 조치를
          취하고 있는지 알려드립니다.
        </PolicyP>
      </PolicySection>

      <PolicySection title="제1조 청소년 유해정보에 대한 청소년 접근제한 및 관리조치">
        <PolicyP>
          경제인뉴스는 청소년이 아무런 제한장치 없이 유해정보에 노출되지 않도록
          청소년유해매체물에 대해서는 별도의 인증장치를 마련·적용하며, 청소년
          유해정보가 노출되지 않기 위한 예방차원의 조치를 강구하고 있습니다.
        </PolicyP>
      </PolicySection>

      <PolicySection title="제2조 청소년 유해정보로부터의 청소년 보호를 위한 정보통신업무 담당자 교육">
        <PolicyP>
          경제인뉴스는 청소년이 유해정보에 노출되지 않도록 청소년유해매체물에
          대한 관리·감독을 철저히 하기 위한 교육을 청소년보호관리책임자와
          담당자에게 시행하고 있습니다.
        </PolicyP>
      </PolicySection>

      <PolicySection title="제3조 청소년 유해정보로 인한 피해상담 및 고충처리">
        <PolicyP>
          경제인뉴스는 청소년 유해 정보로 인한 피해상담 및 고충처리를 위한
          청소년 보호 관리 책임자 및 보호 관리 담당자를 지정해 청소년 유해
          정보로 인한 피해가 확산되지 않도록 노력하고 있습니다.
        </PolicyP>
      </PolicySection>

      <PolicySection title="제4조 청소년 보호 책임자">
        <PolicyP>
          하단에 명시한 청소년 보호 관리 책임자 연락처를 참고하여 피해상담 및
          고충처리를 요청할 수 있습니다.
        </PolicyP>
        <PolicySub>신문 청소년 보호 책임자</PolicySub>
        <PolicyContact
          rows={[
            { label: "이름", value: "신홍태" },
            { label: "소속(직위)", value: "대표" },
            { label: "전화", value: "02-1800-3747" },
            { label: "E-mail", value: "Lawform0511@naver.com" },
          ]}
        />
      </PolicySection>
    </>
  );
}

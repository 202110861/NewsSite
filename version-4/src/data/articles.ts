import type { Article, HotIssueItem } from '../types/news'

// 원본 레거시 사이트의 이미지가 더 이상 존재하지 않으므로,
// 안정적인 플레이스홀더 이미지 서비스로 대체합니다.
const img = (seed: string, w = 600, h = 400) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

export const heroArticles: Article[] = [
  {
    id: '27',
    title: '암호화폐 거래소 포블게이트, \u2018레디(REDi) 코인\u2019 원화마켓 상장',
    section: 'economy',
    image: img('coin27', 800, 600),
    publishedAt: '2026-06-25T09:40:00+09:00',
  },
  {
    id: '6',
    title: "'악플의 밤' 장수원, 충격 이력 공개! 공유-김선아 연영과 동문!",
    section: 'entertainment',
    image: img('actor6', 500, 700),
    publishedAt: '2026-06-25T08:50:00+09:00',
  },
  {
    id: '1',
    title: "'저스티스' 다시 쓰는 수사일지! (부제: 남원식당의 진실)",
    section: 'entertainment',
    image: img('drama1', 700, 500),
    publishedAt: '2026-06-25T08:10:00+09:00',
  },
]

export const hotIssues: HotIssueItem[] = [
  { id: '48', title: '\u2018문재인 정부는 끝내 대한민국을 버릴 것인가\u2019, 자유한국당 김성원 대변인 논평' },
  { id: '44', title: '국토교통부, \u2018건축 행정서비스 혁신방안\u2019 발표' },
  { id: '43', title: '구혜선, "안재현이 이혼 요구...가정 지키려고 한다" / YTN' },
  { id: '42', title: '\u2018NO 아베\u2019 직격탄에 \u2018키테넌트\u2019 유니클로 몰락' },
  { id: '46', title: '김제동씨, 유시민씨 조국 후보자 일가 논란 앞에 왜 침묵하세요? - 나경원 자유한국당 원내 대표' },
  { id: '41', title: '고개 숙인 조국 "더 꾸짖어달라"...딸 의혹엔 "가짜뉴스" 정면돌파 의지' },
  { id: '45', title: '김명호 도의원 5분자유발언 도산대교 건설로 지방도 935호선을 연결해야' },
  { id: '40', title: '인천 2호선 검단연장 예비타당성조사 대상사업으로 선정' },
]

export const videoArticles: Article[] = [
  {
    id: '43',
    title: '구혜선, "안재현이 이혼 요구...가정 지키려고 한다" / YTN',
    section: 'video',
    isVideo: true,
    image: img('video43', 640, 480),
    publishedAt: '2026-06-25T07:30:00+09:00',
  },
  {
    id: '19',
    title: "'평화 음악회' MC 출격 남상미 \"꿈의 미래, 평화 염원하는 의미 있는 무대 진행 맡게 되어 영광\"",
    section: 'video',
    image: img('concert19', 640, 480),
    publishedAt: '2026-06-25T07:10:00+09:00',
  },
]

export const politicsArticles: Article[] = [
  {
    id: '48',
    title: '\u2018문재인 정부는 끝내 대한민국을 버릴 것인가\u2019, 자유한국당 김성원 대변인 논평',
    section: 'politics',
    image: img('pol48'),
    publishedAt: '2026-06-25T06:50:00+09:00',
  },
  {
    id: '46',
    title: '김제동씨, 유시민씨 조국 후보자 일가 논란 앞에 왜 침묵하세요? - 나경원 자유한국당 원내 대표',
    section: 'politics',
    image: img('pol46'),
    publishedAt: '2026-06-25T06:30:00+09:00',
  },
  {
    id: '45',
    title: '김명호 도의원 5분자유발언 도산대교 건설로 지방도 935호선을 연결해야',
    section: 'politics',
    image: img('pol45'),
    publishedAt: '2026-06-25T06:10:00+09:00',
  },
  {
    id: '44',
    title: '국토교통부, \u2018건축 행정서비스 혁신방안\u2019 발표',
    section: 'politics',
    image: img('pol44'),
    publishedAt: '2026-06-25T05:50:00+09:00',
  },
  {
    id: '41',
    title: '고개 숙인 조국 "더 꾸짖어달라"...딸 의혹엔 "가짜뉴스" 정면돌파 의지',
    section: 'politics',
    image: img('pol41'),
    publishedAt: '2026-06-25T05:30:00+09:00',
  },
]

export const eventArticles: Article[] = [
  {
    id: '31',
    title: '포블게이트, 바이낸스-오케이엑스-후오비 등 글로벌 암호화폐 거래소 코인 3종 상장',
    section: 'event',
    image: img('event31'),
    publishedAt: '2026-06-25T05:00:00+09:00',
  },
  {
    id: '32',
    title: '글로벌 기업 관심과 함께 \u2018블록체인 기반 게임\u2019 출시 잇따라',
    section: 'event',
    image: img('event32'),
    publishedAt: '2026-06-25T04:40:00+09:00',
  },
  {
    id: '33',
    title: '생활맥주, 국내 양조장과 상생하며 성장해온 맥주플랫폼 비즈니스',
    section: 'event',
    image: img('event33'),
    publishedAt: '2026-06-25T04:20:00+09:00',
  },
  {
    id: '34',
    title: '핀플 플랫폼, 기술 기업 유뱅크와 전략적 파트너십 체결',
    section: 'event',
    image: img('event34'),
    publishedAt: '2026-06-25T04:00:00+09:00',
  },
  {
    id: '29',
    title: '서울시 후원 "우리 동네 안전한 체육관 만들기"',
    section: 'event',
    image: img('event29'),
    publishedAt: '2026-06-25T03:40:00+09:00',
  },
  {
    id: '30',
    title: '이창호칼럼_마법, 송가인이어라!',
    section: 'event',
    image: img('event30'),
    publishedAt: '2026-06-25T03:20:00+09:00',
  },
]

export const cultureArticles: Article[] = [
  {
    id: '36',
    title: '둘리뮤지엄, \u2018타임코스모스 여행 3D\u2019 영화 상영 이벤트 진행',
    section: 'culture',
    image: img('cult36'),
    publishedAt: '2026-06-25T03:00:00+09:00',
  },
  {
    id: '37',
    title: "[신간] '달빛 아래, 영화 한 잔'",
    section: 'culture',
    image: img('cult37'),
    publishedAt: '2026-06-25T02:40:00+09:00',
  },
  {
    id: '38',
    title: "제7회 당림문화예술제 '2019 아산작가 12인 초대전' 개최",
    section: 'culture',
    image: img('cult38'),
    publishedAt: '2026-06-25T02:20:00+09:00',
  },
  {
    id: '39',
    title: '김하리 닥종이끈 작가 개인전 <감정의 향연>, 인사동 갤러리라메르',
    section: 'culture',
    image: img('cult39'),
    publishedAt: '2026-06-25T02:00:00+09:00',
  },
  {
    id: '35',
    title: '낙원악기상가, \u2018끈질기게, 끈질긴\u2019 트리뷰트 전시회 개최',
    section: 'culture',
    image: img('cult35'),
    publishedAt: '2026-06-25T01:40:00+09:00',
  },
]

export const photoArticles: Article[] = [
  {
    id: '5',
    title: "'모던 패밀리' 미나, '다산의 여왕' 김혜연에게 '임신 비법' 전수받아",
    section: 'entertainment',
    image: img('photo5'),
    publishedAt: '2026-06-25T01:20:00+09:00',
  },
  {
    id: '6',
    title: "'악플의 밤' 장수원, 충격 이력 공개! 공유-김선아 연영과 동문!",
    section: 'entertainment',
    image: img('photo6'),
    publishedAt: '2026-06-25T01:00:00+09:00',
  },
  {
    id: '7',
    title: '\u2018황금정원\u2019 이상우, 형사 촉 발동! 부모 교통사고 관련자 또 있다! 궁금증\u2191',
    section: 'entertainment',
    image: img('photo7'),
    publishedAt: '2026-06-25T00:40:00+09:00',
  },
  {
    id: '8',
    title: '\u2018전지적 참견 시점\u2019 장성규, 친구에서 매니저로 \u2018선\u2019 넘은 매니저와 일상 공개!',
    section: 'entertainment',
    image: img('photo8'),
    publishedAt: '2026-06-25T00:20:00+09:00',
  },
  {
    id: '1',
    title: "'저스티스' 다시 쓰는 수사일지! (부제: 남원식당의 진실)",
    section: 'entertainment',
    image: img('photo1'),
    publishedAt: '2026-06-25T00:00:00+09:00',
  },
  {
    id: '2',
    title: "'멜로가 체질' 안재홍의 드라마 제안에 'No' 한 천우희?!",
    section: 'entertainment',
    image: img('photo2'),
    publishedAt: '2026-06-24T23:40:00+09:00',
  },
]

export const entertainmentArticles: Article[] = [
  {
    id: '20',
    title: "'서핑하우스' 김슬기, 요가 수업으로 상큼미 넘치는 매력 선보여",
    section: 'entertainment',
    image: img('ent20'),
    publishedAt: '2026-06-24T23:20:00+09:00',
  },
  {
    id: '19',
    title: "'평화 음악회' MC 출격 남상미 \"꿈의 미래, 평화 염원하는 의미 있는 무대 진행 맡게 되어 영광\"",
    section: 'entertainment',
    image: img('ent19'),
    publishedAt: '2026-06-24T23:00:00+09:00',
  },
  {
    id: '18',
    title: '\u2018멜로가 체질\u2019 이병헌 감독만이 할 수 있는 독특한 30대 청춘 일기',
    section: 'entertainment',
    image: img('ent18'),
    publishedAt: '2026-06-24T22:40:00+09:00',
  },
  {
    id: '17',
    title: '\u2018평일 오후 세시의 연인\u2019 예지원\u2665조동혁, 애틋한 이마키스 포착',
    section: 'entertainment',
    image: img('ent17'),
    publishedAt: '2026-06-24T22:20:00+09:00',
  },
  {
    id: '16',
    title: '배우 황영희, 신생 매니지먼트사 빅보스엔터테인먼트와 전속 계약 체결!',
    section: 'entertainment',
    image: img('ent16'),
    publishedAt: '2026-06-24T22:00:00+09:00',
  },
]

export const localArticles: Article[] = [
  {
    id: '26',
    title: '남양주시 희망나눔넷, 이웃사랑 나눔 물품 기탁',
    section: 'local',
    image: img('local26'),
    publishedAt: '2026-06-24T21:40:00+09:00',
  },
  {
    id: '25',
    title: '예산군, 제74주년 광복절 기념 제9회 한마음 걷기대회 성료',
    section: 'local',
    image: img('local25'),
    publishedAt: '2026-06-24T21:20:00+09:00',
  },
  {
    id: '24',
    title: '원주시, 신림면 새마을지도자협의회·황둔1리 태극기 달기 운동',
    section: 'local',
    image: img('local24'),
    publishedAt: '2026-06-24T21:00:00+09:00',
  },
  {
    id: '23',
    title: '원주시, 2019년 하반기 지역공동체 일자리사업 참여자 추가 모집',
    section: 'local',
    publishedAt: '2026-06-24T20:40:00+09:00',
  },
  {
    id: '22',
    title: '바르게살기운동 구리시협의회 \u2018나라 사랑 캠페인\u2019 전개',
    section: 'local',
    image: img('local22'),
    publishedAt: '2026-06-24T20:20:00+09:00',
  },
]

export const allSectionArticles = {
  politics: politicsArticles,
  culture: cultureArticles,
  entertainment: entertainmentArticles,
  local: localArticles,
  event: eventArticles,
}

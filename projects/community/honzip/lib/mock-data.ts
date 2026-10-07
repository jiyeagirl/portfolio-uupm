import type { Post, SafetyAlert, Topic } from "./types";

export const ME = { nickname: "망원동밤산책", dong: "망원동" };
export const DONGS = ["망원동", "합정동", "서교동", "성산동"];
export const TOPICS: Topic[] = ["동네 정보", "안전", "집 관리", "생활 꿀팁", "같이 해요"];

export const ALERTS: SafetyAlert[] = [
  { id: "a1", text: "망원역 2번 출구 가로등 고장 신고됨", minutesAgo: 95 },
  { id: "a2", text: "성산로 골목 야간 보행로 공사로 우회 안내", minutesAgo: 60 * 20 },
  { id: "a3", text: "서교동 빌라 공동현관 무단 출입 주의 공지", minutesAgo: 60 * 52 },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: "p1", topic: "집 관리", kind: "question", title: "원룸 곰팡이 제거, 업체 써보신 분 계세요?",
    body: "북향 원룸인데 창문 쪽 벽지 뒤까지 곰팡이가 올라왔어요. 셀프로 닦아봤는데 2주 만에 다시 생겨서 업체를 알아보는 중이에요. 견적 받아보신 분 있을까요? 임대 중이라 벽지 전체를 뜯는 시공은 부담스러워요.",
    nickname: "망원동고양이집사", dong: "망원동", minutesAgo: 130, likes: 34, views: 812, photos: 2, adoptedCommentId: "p1c1",
    comments: [
      { id: "p1c1", nickname: "합정동자취3년차", dong: "합정동", minutesAgo: 95, body: "A인테리어에서 방습 시공까지 받았어요. 방문 견적은 무료였고 부분 시공이라 15만 원선이었어요. 1년째 다시 안 올라와요." },
      { id: "p1c2", nickname: "성산동달리기러", dong: "성산동", minutesAgo: 80, body: "저는 제습기를 하루 8시간 돌리고 벽에서 가구를 10cm 띄웠더니 많이 줄었어요. 업체 부르기 전에 먼저 해볼 만해요." },
      { id: "p1c3", nickname: "서교동책방지기", dong: "서교동", minutesAgo: 41, body: "집주인한테 먼저 알리세요. 결로나 누수가 원인이면 수리 책임이 집주인에게 있는 경우가 많아요." },
    ],
  },
  {
    id: "p2", topic: "안전", kind: "question", title: "밤 11시 이후 망원역에서 집까지 안전한 길 있을까요?",
    body: "이번에 마포구 쪽으로 이사 와서 야근하고 돌아오면 보통 11시 반이에요. 망원역 2번 출구에서 포은로 쪽으로 걸어가는데 골목이 어두워서 무서워요. 큰길 위주로 돌아가는 길을 알려주세요.",
    nickname: "성산동새벽러너", dong: "성산동", minutesAgo: 60 * 5, likes: 52, views: 1340, photos: 0, adoptedCommentId: "p2c2",
    comments: [
      { id: "p2c1", nickname: "망원동초록손", dong: "망원동", minutesAgo: 60 * 4, body: "포은로 큰길이 가장 밝아요. 편의점이 연달아 있어서 중간에 들어갈 곳도 많아요." },
      { id: "p2c2", nickname: "합정동퇴근길", dong: "합정동", minutesAgo: 60 * 4 - 10, body: "2번 출구에서 큰길 따라 두 블록 직진한 뒤 꺾으세요. 가로등 있는 쪽 보도로 가면 CCTV 있는 구간이 많아요. 안심귀가 서비스도 앱으로 신청돼요." },
    ],
  },
  {
    id: "p3", topic: "동네 정보", kind: "info", title: "망원동 무인 택배함 위치 정리했어요",
    body: "배송 오는 시간에 집에 없을 때를 대비해 직접 가본 곳만 정리했어요. 24시간 열려 있는 곳은 4곳이고, 나머지 1곳은 밤 10시에 닫아요. 불이 어두운 곳은 따로 표시해 뒀어요.",
    nickname: "망원동초록손", dong: "망원동", minutesAgo: 60 * 8, likes: 41, views: 640, photos: 1,
    comments: [
      { id: "p3c1", nickname: "합정동자취3년차", dong: "합정동", minutesAgo: 60 * 7, body: "저장해 둘게요. 합정 쪽도 정리해 주시면 좋겠어요." },
      { id: "p3c2", nickname: "망원동고양이집사", dong: "망원동", minutesAgo: 60 * 6, body: "어두운 곳 표시가 도움 돼요. 감사합니다." },
    ],
  },
  {
    id: "p4", topic: "동네 정보", kind: "question", title: "혼자 가기 좋은 동네 내과 있을까요?",
    body: "열이 나서 어제 처음으로 혼자 병원에 가려는데 어디가 좋을지 모르겠어요. 대기가 너무 길지 않고, 진료를 차분하게 설명해 주는 곳이면 좋겠어요. 평일 저녁까지 하는 곳이면 더 좋아요.",
    nickname: "서교동밥짓는사람", dong: "서교동", minutesAgo: 60 * 11, likes: 18, views: 420, photos: 0,
    comments: [
      { id: "p4c1", nickname: "성산동새벽러너", dong: "성산동", minutesAgo: 60 * 10, body: "B내과가 평일 저녁 7시까지 해요. 예약 앱으로 대기 시간 확인할 수 있어요." },
      { id: "p4c2", nickname: "망원동초록손", dong: "망원동", minutesAgo: 60 * 9, body: "저도 B내과 다녔어요. 설명을 자세히 해 주시는 편이에요. 토요일은 오전만 해요." },
    ],
  },
  {
    id: "p5", topic: "같이 해요", kind: "info", title: "남는 식재료 소분 나눔 합니다",
    body: "대용량으로 산 대파와 양파가 너무 많아서 소분해 나눠요. 망원동 거주자 중에서 집 앞 무인 택배함 근처에서 받아가실 분을 찾아요. 댓글로 시간 남겨 주세요.",
    nickname: "망원동초록손", dong: "망원동", minutesAgo: 60 * 20, likes: 27, views: 355, photos: 2,
    comments: [
      { id: "p5c1", nickname: "서교동책방지기", dong: "서교동", minutesAgo: 60 * 19, body: "내일 저녁 7시 이후에 받을 수 있어요. 양파 한 봉지만 부탁드려요." },
    ],
  },
  {
    id: "p6", topic: "같이 해요", kind: "question", title: "주말 아침 한강 러닝 같이 할 사람",
    body: "망원 한강공원에서 토요일 아침 7시에 5km 정도 천천히 뛰어요. 페이스는 7분대이고 초보도 괜찮아요. 혼자 뛰다 보니 자꾸 쉬게 돼서 같이 할 분을 찾아요.",
    nickname: "성산동달리기러", dong: "성산동", minutesAgo: 60 * 26, likes: 22, views: 510, photos: 0,
    comments: [
      { id: "p6c1", nickname: "합정동퇴근길", dong: "합정동", minutesAgo: 60 * 25, body: "저 참여하고 싶어요. 7분대면 딱 맞아요." },
      { id: "p6c2", nickname: "망원동밤산책", dong: "망원동", minutesAgo: 60 * 24, body: "저도 이번 주부터 해볼게요. 집합 장소를 알려 주세요." },
      { id: "p6c3", nickname: "성산동달리기러", dong: "성산동", minutesAgo: 60 * 23, body: "망원 한강공원 입구 자전거 거치대 앞에서 7시에 만나요." },
    ],
  },
  {
    id: "p7", topic: "생활 꿀팁", kind: "info", title: "겨울철 결로 줄이는 환기 순서",
    body: "자취방 창문에 물방울이 맺히는 시기라 정리해요. 아침에 샤워한 뒤 욕실 문을 닫고 환풍기를 먼저 돌린 다음, 거실 창을 10분만 열어요. 이 순서로 바꿨더니 창틀 곰팡이가 거의 안 생겼어요.",
    nickname: "합정동자취3년차", dong: "합정동", minutesAgo: 60 * 30, likes: 38, views: 702, photos: 1,
    comments: [
      { id: "p7c1", nickname: "망원동고양이집사", dong: "망원동", minutesAgo: 60 * 29, body: "환풍기를 먼저 돌리는 건 생각 못 했어요. 오늘부터 해볼게요." },
    ],
  },
  {
    id: "p8", topic: "안전", kind: "info", title: "이사하면 현관 도어락 비밀번호 꼭 바꾸세요",
    body: "전 세입자나 중개인이 알고 있을 수 있어서 입주 첫날 바꾸는 게 좋아요. 보조키가 있으면 같이 회수하고, 도어락 건전지 교체 알림도 켜 두세요. 비밀번호는 생일 같은 숫자는 피하세요.",
    nickname: "서교동책방지기", dong: "서교동", minutesAgo: 60 * 48, likes: 61, views: 980, photos: 0,
    comments: [
      { id: "p8c1", nickname: "성산동새벽러너", dong: "성산동", minutesAgo: 60 * 47, body: "이사 체크리스트에 넣어 뒀어요. 보조키 회수가 의외로 놓치기 쉬워요." },
      { id: "p8c2", nickname: "망원동초록손", dong: "망원동", minutesAgo: 60 * 46, body: "현관 문 틈 보호 필름도 같이 붙이면 좋아요." },
    ],
  },
  {
    id: "p9", topic: "집 관리", kind: "question", title: "방충망 교체, 직접 해도 될까요?",
    body: "창문 방충망이 찢어져서 업체 부르려니 출장비가 아깝더라고요. 셀프로 교체하신 분 계신가요? 공구는 따로 필요한지, 어떤 제품을 사야 하는지 알려 주세요.",
    nickname: "망원동고양이집사", dong: "망원동", minutesAgo: 60 * 50, likes: 15, views: 290, photos: 0, adoptedCommentId: "p9c1",
    comments: [
      { id: "p9c1", nickname: "합정동자취3년차", dong: "합정동", minutesAgo: 60 * 49, body: "방충망 교체 키트가 만 원대로 나와요. 틀 크기만 재서 주문하고, 고무 스펀지 끼우는 롤러만 같이 사면 20분이면 끝나요." },
      { id: "p9c2", nickname: "성산동달리기러", dong: "성산동", minutesAgo: 60 * 48, body: "저도 해봤는데 처음엔 주름이 지니까 천천히 당기면서 하세요." },
    ],
  },
  {
    id: "p10", topic: "생활 꿀팁", kind: "question", title: "1인 가구 쓰레기 배출 요일 헷갈려요",
    body: "이사 오고 나서 재활용 쓰레기를 언제 내놓는지 몰라서 며칠째 현관에 쌓아 두고 있어요. 이 동네는 요일이 정해져 있나요? 종량제 봉투는 어디서 사는지도 궁금해요.",
    nickname: "서교동밥짓는사람", dong: "서교동", minutesAgo: 60 * 72, likes: 9, views: 210, photos: 0,
    comments: [
      { id: "p10c1", nickname: "망원동초록손", dong: "망원동", minutesAgo: 60 * 70, body: "건물마다 달라서 공동현관 게시판이나 관리하시는 분께 먼저 확인해 보세요. 종량제 봉투는 편의점에서 팔아요." },
    ],
  },
  {
    id: "p11", topic: "동네 정보", kind: "info", title: "합정동 늦게까지 하는 약국 정리",
    body: "밤에 갑자기 아플 때 가 볼 수 있는 약국을 직접 확인해서 정리했어요. 밤 11시까지 여는 곳이 두 곳이고, 한 곳은 일요일에도 열어요. 상비약 위치도 간단히 적어 뒀어요.",
    nickname: "합정동퇴근길", dong: "합정동", minutesAgo: 60 * 96, likes: 29, views: 460, photos: 0,
    comments: [
      { id: "p11c1", nickname: "성산동새벽러너", dong: "성산동", minutesAgo: 60 * 95, body: "일요일에 여는 곳 정보가 제일 필요했어요. 감사해요." },
    ],
  },
];

import type { Order, Supplier } from "./types";

// 목업 기준일은 lib/format.ts의 TODAY (2026-10-02)
export const BUYER = { company: "A테크", team: "구매팀", name: "윤서진", role: "팀장" };

export const LOCATIONS = ["A테크 본사 공장 2동 자재창고", "A테크 오산 공장 입고장", "A테크 본사 공장 1동 조립라인"];

export const SUPPLIERS: Supplier[] = [
  { id: "b", name: "B소재", category: "알루미늄, 압출 소재", contact: "오세훈 과장", phone: "010-4821-3307", address: "경기도 시흥시 공단1대로 241" },
  { id: "c", name: "C정밀", category: "베어링, 리니어 부품", contact: "한지수 대리", phone: "010-2934-7718", address: "경기도 안산시 단원구 성곡로 655" },
  { id: "d", name: "D패키징", category: "포장재, 완충재", contact: "김도윤 차장", phone: "010-5517-2049", address: "경기도 화성시 향남읍 발안공단로 88" },
  { id: "e", name: "E전자", category: "PCB, 모터, 전장품", contact: "이서연 과장", phone: "010-6620-1185", address: "경기도 수원시 영통구 신원로 250" },
  { id: "f", name: "F금속", category: "볼트, 너트, 체결류", contact: "박정훈 부장", phone: "010-3378-9024", address: "인천광역시 남동구 남동서로 193" },
];

export const supplierOf = (id: string) => SUPPLIERS.find((s) => s.id === id)!;

export const INITIAL_ORDERS: Order[] = [
  {
    id: "PO-2610-009", supplierId: "b", requestedAt: "2026-10-02 09:05", dueDate: "2026-10-16",
    location: LOCATIONS[0], memo: "판재 보호필름 부착 상태로 납품 요청", status: "pending-approval",
    items: [
      { id: "1", name: "알루미늄 판재", spec: "A5052 t3 1220×2440", qty: 40, unitPrice: 186000 },
      { id: "2", name: "알루미늄 판재", spec: "A5052 t5 1220×2440", qty: 12, unitPrice: 298000 },
    ],
    timeline: { requested: "2026-10-02 09:05" },
  },
  {
    id: "PO-2610-008", supplierId: "e", requestedAt: "2026-10-01 16:20", dueDate: "2026-10-14",
    location: LOCATIONS[2], memo: "", status: "pending-approval",
    items: [
      { id: "1", name: "컨트롤 기판", spec: "PCB 4층 120×80", qty: 200, unitPrice: 4850 },
      { id: "2", name: "서보 드라이버", spec: "200W 24V", qty: 30, unitPrice: 46000 },
    ],
    timeline: { requested: "2026-10-01 16:20" },
  },
  {
    id: "PO-2610-007", supplierId: "f", requestedAt: "2026-10-01 10:40", dueDate: "2026-10-08",
    location: LOCATIONS[1], memo: "체결류는 규격별로 분리 포장", status: "awaiting-accept",
    items: [
      { id: "1", name: "육각 볼트", spec: "M8×30 SUS304", qty: 5000, unitPrice: 62 },
      { id: "2", name: "너트", spec: "M8 SUS304", qty: 5000, unitPrice: 28 },
      { id: "3", name: "평 와셔", spec: "M8 SUS304", qty: 10000, unitPrice: 9 },
    ],
    timeline: { requested: "2026-10-01 10:40", approved: "2026-10-01 11:25" },
  },
  {
    id: "PO-2610-005", supplierId: "c", requestedAt: "2026-10-01 14:10", dueDate: "2026-10-09",
    location: LOCATIONS[0], memo: "", status: "in-progress",
    items: [
      { id: "1", name: "볼 베어링", spec: "6204ZZ", qty: 400, unitPrice: 2350 },
      { id: "2", name: "리니어 가이드 레일", spec: "HGR15 L500", qty: 40, unitPrice: 38000 },
    ],
    timeline: { requested: "2026-10-01 14:10", approved: "2026-10-01 15:02", accepted: "2026-10-01 17:30", shipped: "2026-10-02 08:40" },
  },
  {
    id: "PO-2610-004", supplierId: "d", requestedAt: "2026-10-01 11:00", dueDate: "2026-10-07",
    location: LOCATIONS[1], memo: "팔레트 단위 적재", status: "in-progress",
    items: [
      { id: "1", name: "포장 박스", spec: "대 520×380×300 2겹", qty: 1200, unitPrice: 1450 },
      { id: "2", name: "완충재", spec: "에어캡 롤 1m × 50m", qty: 60, unitPrice: 9800 },
    ],
    timeline: { requested: "2026-10-01 11:00", approved: "2026-10-01 11:48", accepted: "2026-10-01 17:05", shipped: "2026-10-02 10:00" },
  },
  {
    id: "PO-2609-031", supplierId: "c", requestedAt: "2026-09-18 13:25", dueDate: "2026-09-30",
    location: LOCATIONS[0], memo: "원인 확인 필요, 라인 투입 일정 영향", status: "delayed",
    items: [{ id: "1", name: "볼 베어링", spec: "6205ZZ", qty: 600, unitPrice: 2780 }],
    timeline: { requested: "2026-09-18 13:25", approved: "2026-09-18 14:10", accepted: "2026-09-19 10:02", shipped: "2026-09-29 09:00" },
  },
  {
    id: "PO-2609-028", supplierId: "f", requestedAt: "2026-09-15 09:50", dueDate: "2026-09-29",
    location: LOCATIONS[1], memo: "", status: "delayed",
    items: [
      { id: "1", name: "육각 볼트", spec: "M6×20 아연도금", qty: 8000, unitPrice: 41 },
      { id: "2", name: "스프링 와셔", spec: "M6", qty: 8000, unitPrice: 14 },
    ],
    timeline: { requested: "2026-09-15 09:50", approved: "2026-09-15 10:30", accepted: "2026-09-16 09:12", shipped: "2026-09-29 16:00" },
  },
  {
    id: "PO-2609-026", supplierId: "d", requestedAt: "2026-09-11 15:00", dueDate: "2026-09-25",
    location: LOCATIONS[2], memo: "", status: "delivered",
    items: [{ id: "1", name: "포장 박스", spec: "중 400×300×250 2겹", qty: 2000, unitPrice: 1180 }],
    timeline: { requested: "2026-09-11 15:00", approved: "2026-09-11 15:40", accepted: "2026-09-13 09:30", shipped: "2026-09-24 10:15", delivered: "2026-09-25 11:20" },
  },
  {
    id: "PO-2609-024", supplierId: "b", requestedAt: "2026-09-10 10:15", dueDate: "2026-09-25",
    location: LOCATIONS[0], memo: "", status: "delivered",
    items: [{ id: "1", name: "알루미늄 판재", spec: "A6061 t2 1000×2000", qty: 30, unitPrice: 142000 }],
    timeline: { requested: "2026-09-10 10:15", approved: "2026-09-10 11:00", accepted: "2026-09-11 09:40", shipped: "2026-09-24 09:00", delivered: "2026-09-25 14:05" },
  },
  {
    id: "PO-2609-021", supplierId: "e", requestedAt: "2026-09-05 17:30", dueDate: "2026-09-22",
    location: LOCATIONS[2], memo: "", status: "delivered",
    items: [{ id: "1", name: "컨트롤 기판", spec: "PCB 4층 120×80", qty: 150, unitPrice: 4900 }],
    timeline: { requested: "2026-09-05 17:30", approved: "2026-09-06 09:05", accepted: "2026-09-06 13:50", shipped: "2026-09-21 15:30", delivered: "2026-09-22 10:45" },
  },
];

import type { Order, Supplier } from "./types";

// 목업 기준일은 lib/format.ts의 TODAY (2026-09-24)
export const BUYER = { company: "A테크", team: "구매팀", name: "정다은", role: "대리" };

export const LOCATIONS = ["A테크 본사 공장 2동 자재창고", "A테크 오산 공장 입고장", "A테크 본사 공장 1동 조립라인"];

export const SUPPLIERS: Supplier[] = [
  { id: "b", name: "B소재", category: "알루미늄, 압출 소재", contact: "오세훈 과장", phone: "010-4821-3307", address: "경기도 시흥시 공단1대로 241", leadDays: 10 },
  { id: "c", name: "C정밀", category: "베어링, 리니어 부품", contact: "한지수 대리", phone: "010-2934-7718", address: "경기도 안산시 단원구 성곡로 655", leadDays: 7 },
  { id: "d", name: "D패키징", category: "포장재, 완충재", contact: "김도윤 차장", phone: "010-5517-2049", address: "경기도 화성시 향남읍 발안공단로 88", leadDays: 5 },
  { id: "e", name: "E전자", category: "PCB, 모터, 전장품", contact: "이서연 과장", phone: "010-6620-1185", address: "경기도 수원시 영통구 신원로 250", leadDays: 12 },
  { id: "f", name: "F금속", category: "볼트, 너트, 체결류", contact: "박정훈 부장", phone: "010-3378-9024", address: "인천광역시 남동구 남동서로 193", leadDays: 4 },
];

export const supplierOf = (id: string) => SUPPLIERS.find((s) => s.id === id)!;

export const INITIAL_ORDERS: Order[] = [
  {
    id: "PO-2609-041", supplierId: "b", requestedAt: "2026-09-24 09:12", dueDate: "2026-10-08",
    location: LOCATIONS[0], memo: "판재 보호필름 부착 상태로 납품 요청", status: "pending-approval",
    items: [
      { id: "1", name: "알루미늄 판재", spec: "A5052 t3 1220x2440", qty: 40, unitPrice: 186000 },
      { id: "2", name: "알루미늄 판재", spec: "A5052 t5 1220x2440", qty: 12, unitPrice: 298000 },
    ],
    timeline: { requested: "2026-09-24 09:12" },
  },
  {
    id: "PO-2609-040", supplierId: "e", requestedAt: "2026-09-23 16:40", dueDate: "2026-10-06",
    location: LOCATIONS[2], memo: "", status: "pending-approval",
    items: [
      { id: "1", name: "제어 기판 PCB", spec: "4층 FR-4 1.6t", qty: 300, unitPrice: 12800 },
      { id: "2", name: "커넥터 하우징", spec: "2.54mm 6핀", qty: 600, unitPrice: 420 },
    ],
    timeline: { requested: "2026-09-23 16:40" },
  },
  {
    id: "PO-2609-038", supplierId: "c", requestedAt: "2026-09-22 10:05", dueDate: "2026-10-02",
    location: LOCATIONS[0], memo: "성적서 동봉", status: "awaiting-accept",
    items: [
      { id: "1", name: "깊은 홈 볼 베어링", spec: "6204ZZ", qty: 500, unitPrice: 2350 },
      { id: "2", name: "깊은 홈 볼 베어링", spec: "6205ZZ", qty: 300, unitPrice: 2780 },
    ],
    timeline: { requested: "2026-09-22 10:05", approved: "2026-09-22 11:20" },
  },
  {
    id: "PO-2609-036", supplierId: "d", requestedAt: "2026-09-21 14:20", dueDate: "2026-09-30",
    location: LOCATIONS[1], memo: "", status: "awaiting-accept",
    items: [{ id: "1", name: "포장 박스", spec: "B골 400x300x250", qty: 2000, unitPrice: 640 }],
    timeline: { requested: "2026-09-21 14:20", approved: "2026-09-21 16:02" },
  },
  {
    id: "PO-2609-033", supplierId: "f", requestedAt: "2026-09-18 11:30", dueDate: "2026-09-29",
    location: LOCATIONS[2], memo: "500개 단위 소분 포장", status: "in-progress",
    items: [
      { id: "1", name: "육각 볼트", spec: "M8x30 SUS304", qty: 5000, unitPrice: 85 },
      { id: "2", name: "평와셔", spec: "M8 SUS304", qty: 5000, unitPrice: 12 },
      { id: "3", name: "스프링 와셔", spec: "M8 SUS304", qty: 5000, unitPrice: 15 },
    ],
    timeline: { requested: "2026-09-18 11:30", approved: "2026-09-18 12:05", accepted: "2026-09-18 15:02", shipped: "2026-09-23 08:40" },
  },
  {
    id: "PO-2609-031", supplierId: "c", requestedAt: "2026-09-17 09:48", dueDate: "2026-09-26",
    location: LOCATIONS[2], memo: "", status: "in-progress",
    items: [
      { id: "1", name: "리니어 샤프트", spec: "SUJ2 20mm L500", qty: 40, unitPrice: 38500 },
      { id: "2", name: "리니어 부시", spec: "LM20UU", qty: 80, unitPrice: 6900 },
    ],
    timeline: { requested: "2026-09-17 09:48", approved: "2026-09-17 10:23", accepted: "2026-09-17 13:15" },
  },
  {
    id: "PO-2609-028", supplierId: "e", requestedAt: "2026-09-15 15:22", dueDate: "2026-09-25",
    location: LOCATIONS[2], memo: "", status: "in-progress",
    items: [{ id: "1", name: "스테핑 모터", spec: "NEMA17 1.8도 0.45Nm", qty: 60, unitPrice: 24500 }],
    timeline: { requested: "2026-09-15 15:22", approved: "2026-09-15 15:57", accepted: "2026-09-16 09:30", shipped: "2026-09-24 07:55" },
  },
  {
    id: "PO-2609-025", supplierId: "b", requestedAt: "2026-09-12 10:10", dueDate: "2026-09-22",
    location: LOCATIONS[0], memo: "절단면 버 제거 필수", status: "delayed",
    items: [
      { id: "1", name: "알루미늄 압출 프로파일", spec: "4040 L1000", qty: 120, unitPrice: 14200 },
      { id: "2", name: "코너 브래킷", spec: "4040용", qty: 480, unitPrice: 1150 },
    ],
    timeline: { requested: "2026-09-12 10:10", approved: "2026-09-12 10:45", accepted: "2026-09-12 16:44" },
  },
  {
    id: "PO-2609-019", supplierId: "d", requestedAt: "2026-09-08 13:05", dueDate: "2026-09-16",
    location: LOCATIONS[1], memo: "", status: "delivered",
    items: [
      { id: "1", name: "에어캡 롤", spec: "1200mm x 50m", qty: 60, unitPrice: 18900 },
      { id: "2", name: "포장 박스", spec: "B골 400x300x250", qty: 1000, unitPrice: 610 },
    ],
    timeline: { requested: "2026-09-08 13:05", approved: "2026-09-08 13:40", accepted: "2026-09-08 17:20", shipped: "2026-09-14 09:00", delivered: "2026-09-15 14:32" },
  },
  {
    id: "PO-2609-014", supplierId: "f", requestedAt: "2026-09-05 08:58", dueDate: "2026-09-12",
    location: LOCATIONS[2], memo: "", status: "delivered",
    items: [
      { id: "1", name: "육각 너트", spec: "M10 SUS304", qty: 4000, unitPrice: 48 },
      { id: "2", name: "접시머리 볼트", spec: "M6x20 SUS304", qty: 6000, unitPrice: 36 },
    ],
    timeline: { requested: "2026-09-05 08:58", approved: "2026-09-05 09:33", accepted: "2026-09-05 11:40", shipped: "2026-09-10 10:15", delivered: "2026-09-11 15:05" },
  },
];

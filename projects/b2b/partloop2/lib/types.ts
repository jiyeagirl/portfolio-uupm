export type OrderStatus = "pending-approval" | "awaiting-accept" | "in-progress" | "delayed" | "delivered";

export type Supplier = {
  id: string;
  name: string;
  category: string;
  contact: string;
  phone: string;
  address: string;
};

export type LineItem = {
  id: string;
  name: string;
  spec: string;
  qty: number;
  unitPrice: number;
};

export type TimelineKey = "requested" | "approved" | "accepted" | "shipped" | "delivered";

export type Order = {
  id: string;
  supplierId: string;
  requestedAt: string; // YYYY-MM-DD HH:mm
  dueDate: string; // YYYY-MM-DD
  location: string;
  memo: string;
  status: OrderStatus;
  items: LineItem[];
  timeline: Partial<Record<TimelineKey, string>>;
};

export type Screen = "orders" | "new-order" | "order-detail";

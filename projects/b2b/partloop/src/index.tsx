"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { CheckCircle } from "@phosphor-icons/react";
import "../styles/partloop.css";
import type { Order, Screen } from "../lib/types";
import { INITIAL_ORDERS } from "../lib/mock-data";
import { NOW } from "../lib/format";
import { Shell } from "../components/shell";
import { OrdersScreen } from "../components/screens/orders";
import { NewOrderScreen, type Draft } from "../components/screens/new-order";
import { OrderDetailScreen } from "../components/screens/order-detail";

const SCREENS: Screen[] = ["orders", "new-order", "order-detail"];

// 초기 화면은 ?screen=, ?id=에서 읽음 (시각 검증 캡처용). useSearchParams라 서버와 클라이언트 결과가 같음
function initial(p: URLSearchParams | null): { screen: Screen; id: string } {
  const s = p?.get("screen") as Screen | null;
  return { screen: s && SCREENS.includes(s) ? s : "orders", id: p?.get("id") ?? "PO-2609-025" };
}

export default function PartLoop() {
  const params = useSearchParams();
  const [init] = useState(() => initial(params));
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [screen, setScreen] = useState<Screen>(init.screen);
  const [openId, setOpenId] = useState(init.id);
  const [toast, setToast] = useState<{ text: string; id: string } | null>(null);

  const go = (s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0 });
  };

  const notify = (text: string, id: string) => {
    setToast({ text, id });
    window.setTimeout(() => setToast((t) => (t?.id === id && t.text === text ? null : t)), 3600);
  };

  const submit = (d: Draft) => {
    const max = Math.max(...orders.map((o) => Number(o.id.slice(-3))));
    const id = `PO-2609-${String(max + 1).padStart(3, "0")}`;
    const order: Order = { id, supplierId: d.supplierId, requestedAt: NOW, dueDate: d.dueDate, location: d.location, memo: d.memo, status: "pending-approval", items: d.items, timeline: { requested: NOW } };
    setOrders((os) => [order, ...os]);
    notify(`${id} 발주를 요청함. 승인 대기 상태로 등록됨`, id);
    go("orders");
  };

  const advance = (id: string) => {
    setOrders((os) =>
      os.map((o) => {
        if (o.id !== id) return o;
        if (o.status === "pending-approval") return { ...o, status: "awaiting-accept", timeline: { ...o.timeline, approved: NOW } };
        if (o.status === "in-progress" || o.status === "delayed")
          return { ...o, status: "delivered", timeline: { ...o.timeline, shipped: o.timeline.shipped ?? NOW, delivered: NOW } };
        return o;
      }),
    );
    const o = orders.find((x) => x.id === id);
    notify(o?.status === "pending-approval" ? `${id} 승인 완료. 공급사에 전달됨` : `${id} 납품 확인 완료`, id);
  };

  const current = orders.find((o) => o.id === openId) ?? orders[0];
  const pendingCount = orders.filter((o) => o.status === "pending-approval").length;

  return (
    <MotionConfig reducedMotion="user">
      <div className="partloop">
      <Shell screen={screen} onNavigate={go} pendingCount={pendingCount}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={screen === "order-detail" ? `d-${current.id}` : screen} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}>
            {screen === "orders" && (
              <OrdersScreen
                orders={orders}
                highlightId={toast?.id}
                onCreate={() => go("new-order")}
                onOpen={(id) => {
                  setOpenId(id);
                  go("order-detail");
                }}
              />
            )}
            {screen === "new-order" && <NewOrderScreen onSubmit={submit} onCancel={() => go("orders")} />}
            {screen === "order-detail" && <OrderDetailScreen order={current} onBack={() => go("orders")} onAdvance={advance} />}
          </motion.div>
        </AnimatePresence>
      </Shell>

      <div aria-live="polite" className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.text}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8, transition: { duration: 0.14 } }}
              transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
              className="flex items-center gap-2 rounded-lg bg-(--pl-ink) px-4 py-2.5 text-[13.5px] font-medium text-white shadow-[0_10px_15px_rgba(0,0,0,0.12)]"
            >
              <CheckCircle size={18} weight="fill" className="text-[#6EE7B7]" aria-hidden />
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </MotionConfig>
  );
}

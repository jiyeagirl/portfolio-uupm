"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { CheckCircle } from "@phosphor-icons/react";
import "../styles/partloop2.css";
import type { Order, Screen } from "../lib/types";
import { INITIAL_ORDERS, supplierOf } from "../lib/mock-data";
import { NOW } from "../lib/format";
import { Shell } from "../components/shell";
import { OrdersScreen } from "../components/screens/orders";
import { EMPTY_DRAFT, FILLED_DRAFT, NewOrderScreen, type Draft } from "../components/screens/new-order";
import { OrderDetailScreen } from "../components/screens/order-detail";

const SCREENS: Screen[] = ["orders", "new-order", "order-detail"];

// 초기 화면은 ?screen=, ?id=, ?draft=에서 읽음 (시각 검증 캡처용). useSearchParams라 서버와 클라이언트 결과가 같음
function initial(p: URLSearchParams | null): { screen: Screen; id: string; draft: Draft } {
  const s = p?.get("screen") as Screen | null;
  return { screen: s && SCREENS.includes(s) ? s : "orders", id: p?.get("id") ?? "PO-2610-009", draft: p?.get("draft") === "filled" ? FILLED_DRAFT : EMPTY_DRAFT };
}

export default function PartLoop2() {
  const params = useSearchParams();
  const [init] = useState(() => initial(params));
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [screen, setScreen] = useState<Screen>(init.screen);
  const [openId, setOpenId] = useState(init.id);
  const [draftKey, setDraftKey] = useState(0);
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
    const id = `PO-2610-${String(max + 1).padStart(3, "0")}`;
    const order: Order = { id, supplierId: d.supplierId, requestedAt: NOW, dueDate: d.dueDate, location: d.location, memo: d.memo, status: "pending-approval", items: d.items, timeline: { requested: NOW } };
    setOrders((os) => [order, ...os]);
    setDraftKey((k) => k + 1);
    notify(`${id} 발주를 요청함. 승인 대기 상태로 등록됨`, id);
    go("orders");
  };

  const advance = (id: string) => {
    const o = orders.find((x) => x.id === id);
    if (!o) return;
    setOrders((os) =>
      os.map((x) => {
        if (x.id !== id) return x;
        if (x.status === "pending-approval") return { ...x, status: "awaiting-accept", timeline: { ...x.timeline, approved: NOW } };
        if (x.status === "in-progress" || x.status === "delayed") return { ...x, status: "delivered", timeline: { ...x.timeline, accepted: x.timeline.accepted ?? NOW, shipped: x.timeline.shipped ?? NOW, delivered: NOW } };
        return x;
      }),
    );
    notify(o.status === "pending-approval" ? `${id} 승인 완료. 공급사에 전달됨` : `${id} 납품 확인 완료`, id);
  };

  const contact = (id: string) => {
    const o = orders.find((x) => x.id === id);
    if (!o) return;
    const s = supplierOf(o.supplierId);
    notify(`${s.name} ${s.contact} ${s.phone}`, id);
  };

  const current = orders.find((o) => o.id === openId) ?? orders[0];

  return (
    <MotionConfig reducedMotion="user">
      <div className="partloop2">
        <Shell screen={screen} onNavigate={go}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={screen === "order-detail" ? `d-${current.id}` : screen} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
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
              {screen === "new-order" && <NewOrderScreen key={draftKey} initial={draftKey === 0 ? init.draft : EMPTY_DRAFT} onSubmit={submit} onCancel={() => go("orders")} />}
              {screen === "order-detail" && <OrderDetailScreen order={current} onBack={() => go("orders")} onAdvance={advance} onContact={contact} />}
            </motion.div>
          </AnimatePresence>
        </Shell>

        <div aria-live="polite" className="pointer-events-none fixed bottom-6 left-24 z-50">
          <AnimatePresence>
            {toast && (
              <motion.div
                key={toast.text}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.14 } }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 rounded-lg bg-(--pl2-ink) px-4 py-2.5 text-[13.5px] font-medium text-white shadow-[0_6px_12px_rgba(15,23,42,0.16)]"
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

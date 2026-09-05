"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type AdminOrder = {
  id: number;
  orderCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  paymentStatus: string;
  designName: string;
  materialId: string;
  collectionSlug: string;
  designDescription: string | null;
  collectionDescription: string | null;
  sizeId: string;
  fitId: string;
  colorId: string;
  printSide: string;
  placementId: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  discountAmount: number;
  orderType: string;
  variantSku: string | null;
  totalPrice: number;
  frontImageUrl: string;
  backImageUrl: string;
  telegramStatus: string;
  telegramError: string | null;
  createdAt: string;
  editionStart: number | null;
  editionEnd: number | null;
  editionLimit: number | null;
};

const orderLabels: Record<string, string> = {
  new: "جدید",
  confirmed: "تأییدشده",
  printing: "در حال چاپ",
  ready: "آماده",
  completed: "تکمیل‌شده",
  cancelled: "لغوشده",
};
const paymentLabels: Record<string, string> = {
  unpaid: "پرداخت‌نشده",
  paid: "پرداخت‌شده",
  refunded: "عودت وجه",
};
const money = (value: number) => `${value.toLocaleString("fa-IR")} تومان`;
const preview = (url: string) =>
  url.startsWith("https://storage.avoocadostudio.com/uploads/")
    ? `/api/storage-image?url=${encodeURIComponent(url)}`
    : url;

export function OrdersManager() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [paymentStatuses, setPaymentStatuses] = useState<string[]>([]);
  const [unauthorized, setUnauthorized] = useState(false);
  const [busyId, setBusyId] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      if (response.status === 401) return setUnauthorized(true);
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "دریافت سفارش‌ها انجام نشد.");
      setOrders(data.orders ?? []);
      setStatuses(data.statuses ?? []);
      setPaymentStatuses(data.paymentStatuses ?? []);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "دریافت سفارش‌ها انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    queueMicrotask(() => void load());
  }, []);

  async function update(
    id: number,
    patch: { status?: string; paymentStatus?: string },
  ) {
    setBusyId(id);
    setError("");
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تغییر وضعیت انجام نشد.");
      setOrders(data.orders ?? []);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "تغییر وضعیت انجام نشد.",
      );
    } finally {
      setBusyId(undefined);
    }
  }

  const totals = useMemo(
    () =>
      orders.reduce(
        (sum, order) => {
          if (order.status === "cancelled") return sum;
          const revenue = Math.max(0, order.totalPrice - order.discountAmount);
          const cost = order.unitCost * order.quantity;
          return {
            revenue: sum.revenue + revenue,
            cost: sum.cost + cost,
            profit: sum.profit + revenue - cost,
          };
        },
        { revenue: 0, cost: 0, profit: 0 },
      ),
    [orders],
  );

  if (unauthorized)
    return (
      <main
        className="grid min-h-screen place-items-center bg-[#f2f1ec] p-6"
        dir="rtl"
      >
        <div className="rounded-3xl bg-white p-8 text-center">
          <h1 className="text-2xl font-black">ابتدا وارد شوید</h1>
          <Link
            href="/admin/login"
            className="mt-5 inline-block rounded-full bg-black px-6 py-3 !text-white"
          >
            ورود مدیر
          </Link>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-[#f2f1ec] pb-20" dir="rtl">
      <header className="border-b border-black/8 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 md:px-10">
          <div>
            <span className="text-xs font-bold tracking-[.25em] text-[#668000]">
              AVOOCADO STUDIO
            </span>
            <h1 className="mt-2 text-3xl font-black">سفارش‌ها و حسابداری</h1>
          </div>
          <nav className="flex gap-2">
            <button
              disabled={loading}
              onClick={() => void load()}
              className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-bold transition hover:bg-lime-300 disabled:opacity-50"
            >
              به‌روزرسانی
            </button>
            <Link
              href="/admin/dashboard"
              className="rounded-full bg-black px-5 py-2.5 text-sm font-bold !text-white transition hover:bg-lime-300 hover:!text-black"
            >
              کاتالوگ
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        <section className="grid gap-4 md:grid-cols-3">
          <Metric
            label="فروش ناخالص"
            value={money(totals.revenue)}
            tone="black"
          />
          <Metric label="هزینه تمام‌شده" value={money(totals.cost)} />
          <Metric label="سود ناخالص" value={money(totals.profit)} tone="lime" />
        </section>
        {error ? (
          <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <section className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold tracking-widest text-[#668000]">
                ORDERS
              </p>
              <h2 className="mt-1 text-2xl font-black">لیست سفارش‌ها</h2>
            </div>
            <span className="text-sm text-black/45">
              {orders.length.toLocaleString("fa-IR")} سفارش
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {loading ? (
              <p className="rounded-3xl bg-white p-10 text-center text-black/45">
                در حال دریافت سفارش‌ها…
              </p>
            ) : orders.length ? (
              orders.map((order) => {
                const revenue = Math.max(
                  0,
                  order.totalPrice - order.discountAmount,
                );
                const cost = order.unitCost * order.quantity;
                const profit = revenue - cost;
                return (
                  <article
                    key={order.id}
                    className="overflow-hidden rounded-3xl border border-black/8 bg-white"
                  >
                    <div className="grid gap-6 p-5 lg:grid-cols-[150px_1fr_210px] lg:p-6">
                      <div className="grid grid-cols-2 gap-2">
                        {[order.frontImageUrl, order.backImageUrl].map(
                          (url, index) => (
                            <div
                              className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#efeee9]"
                              key={`${url}-${index}`}
                            >
                              <Image
                                src={preview(url)}
                                alt={index ? "پشت تیشرت" : "جلوی تیشرت"}
                                fill
                                unoptimized
                                className="object-contain"
                              />
                            </div>
                          ),
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black" dir="ltr">
                            {order.orderCode}
                          </h3>
                          <Badge>
                            {orderLabels[order.status] ?? order.status}
                          </Badge>
                          <Badge>
                            {paymentLabels[order.paymentStatus] ??
                              order.paymentStatus}
                          </Badge>
                          <Badge>
                            {order.orderType === "ready-made"
                              ? "آماده"
                              : "سفارشی"}
                          </Badge>
                        </div>
                        <p className="mt-4 font-bold">
                          {order.firstName} {order.lastName} ·{" "}
                          <a
                            href={`tel:${order.phone}`}
                            className="underline"
                            dir="ltr"
                          >
                            {order.phone}
                          </a>
                        </p>
                        <p className="mt-3 text-sm leading-7 text-black/50">
                          {order.designName} · {order.fitId} · {order.colorId} ·{" "}
                          {order.sizeId} · تعداد{" "}
                          {order.quantity.toLocaleString("fa-IR")}
                          <br />
                          چاپ: {order.printSide} / {order.placementId}
                          {order.variantSku
                            ? ` · SKU: ${order.variantSku}`
                            : ""}
                        </p>
                        {order.editionStart ? (
                          <p
                            className="mt-3 inline-block rounded-full bg-lime-300 px-4 py-2 text-sm font-black"
                            dir="ltr"
                          >
                            EDITION{" "}
                            {String(order.editionStart).padStart(3, "0")}
                            {order.editionEnd !== order.editionStart
                              ? `–${String(order.editionEnd).padStart(3, "0")}`
                              : ""}{" "}
                            / {order.editionLimit}
                          </p>
                        ) : null}
                        <p className="mt-3 text-xs text-black/35">
                          {new Date(`${order.createdAt}Z`).toLocaleString(
                            "fa-IR",
                          )}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#f6f5f1] p-4 text-sm">
                        <Row label="مبلغ فروش" value={money(revenue)} />
                        <Row label="هزینه" value={money(cost)} />
                        <Row label="سود" value={money(profit)} strong />
                        <Link
                          href={`/admin/orders/${order.id}/invoice`}
                          className="mt-4 block rounded-xl bg-black px-4 py-3 text-center font-bold !text-white transition hover:bg-lime-300 hover:!text-black"
                        >
                          مشاهده و دانلود فاکتور
                        </Link>
                        {order.editionStart ? (
                          <Link
                            href={`/admin/orders/${order.id}/certificate`}
                            className="mt-2 block rounded-xl border border-black/15 px-4 py-3 text-center font-bold transition hover:bg-lime-300"
                          >
                            ساخت و دانلود شناسنامه
                          </Link>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 border-t border-black/8 bg-[#fafaf8] px-5 py-4">
                      <label className="text-xs font-bold text-black/45">
                        وضعیت سفارش
                        <select
                          disabled={busyId === order.id}
                          value={order.status}
                          onChange={(e) =>
                            void update(order.id, { status: e.target.value })
                          }
                          className="mr-2 rounded-lg border border-black/10 bg-white p-2 text-black"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {orderLabels[status] ?? status}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs font-bold text-black/45">
                        وضعیت پرداخت
                        <select
                          disabled={busyId === order.id}
                          value={order.paymentStatus}
                          onChange={(e) =>
                            void update(order.id, {
                              paymentStatus: e.target.value,
                            })
                          }
                          className="mr-2 rounded-lg border border-black/10 bg-white p-2 text-black"
                        >
                          {paymentStatuses.map((status) => (
                            <option key={status} value={status}>
                              {paymentLabels[status] ?? status}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="rounded-3xl bg-white p-10 text-center text-black/45">
                هنوز سفارشی ثبت نشده است.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "black" | "lime";
}) {
  return (
    <div
      className={`rounded-3xl p-6 ${tone === "black" ? "bg-black text-white" : tone === "lime" ? "bg-lime-300" : "bg-white"}`}
    >
      <p
        className={`text-sm ${tone === "black" ? "text-white/55" : "text-black/45"}`}
      >
        {label}
      </p>
      <strong className="mt-3 block text-2xl font-black">{value}</strong>
    </div>
  );
}
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-bold">
      {children}
    </span>
  );
}
function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-3 py-1.5 ${strong ? "mt-1 border-t border-black/10 pt-3 font-black text-[#668000]" : ""}`}
    >
      <span className="text-black/45">{label}</span>
      <span>{value}</span>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { AdminOrder } from "./OrdersManager";

const money = (value: number) => `${value.toLocaleString("fa-IR")} تومان`;
const preview = (url: string) => url.startsWith("https://storage.avoocadostudio.com/uploads/") ? `/api/storage-image?url=${encodeURIComponent(url)}` : url;

export function InvoiceView({ orderId }: { orderId: number }) {
  const [order, setOrder] = useState<AdminOrder>();
  const [message, setMessage] = useState("در حال آماده‌سازی فاکتور…");
  useEffect(() => {
    void fetch("/api/admin/orders", { cache: "no-store" }).then(async (response) => {
      if (response.status === 401) { setMessage("برای دیدن فاکتور ابتدا وارد پنل شوید."); return; }
      const data = await response.json();
      const found = (data.orders as AdminOrder[] | undefined)?.find((item) => item.id === orderId);
      if (!found) { setMessage("سفارش پیدا نشد."); return; }
      setOrder(found);
    }).catch(() => setMessage("دریافت اطلاعات فاکتور انجام نشد."));
  }, [orderId]);

  if (!order) return <main className="grid min-h-screen place-items-center bg-[#f2f1ec] p-6" dir="rtl"><div className="rounded-3xl bg-white p-8 text-center"><p>{message}</p><Link href="/admin/orders" className="mt-5 inline-block underline">بازگشت به سفارش‌ها</Link></div></main>;

  const subtotal = order.unitPrice * order.quantity;
  const finalPrice = Math.max(0, order.totalPrice - order.discountAmount);
  return <main className="min-h-screen bg-[#e9e8e2] px-4 py-8 print:bg-white print:p-0" dir="rtl">
    <div className="no-print mx-auto mb-5 flex max-w-[210mm] items-center justify-between gap-3"><Link href="/admin/orders" className="rounded-full border border-black/15 bg-white px-5 py-2.5 text-sm font-bold">بازگشت</Link><button onClick={() => window.print()} className="rounded-full bg-black px-6 py-3 text-sm font-bold text-white hover:bg-lime-300 hover:text-black">دانلود یا چاپ PDF</button></div>
    <article className="invoice-sheet mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white p-8 shadow-xl print:min-h-0 print:max-w-none print:shadow-none md:p-14">
      <header className="flex items-start justify-between border-b-2 border-black pb-8"><div><p className="text-xs font-bold tracking-[.28em] text-[#668000]">AVOOCADO STUDIO</p><h1 className="mt-3 text-4xl font-black">فاکتور فروش</h1></div><div className="text-left text-sm" dir="ltr"><strong className="text-lg">{order.orderCode}</strong><p className="mt-1 text-black/45">{new Date(`${order.createdAt}Z`).toLocaleDateString("fa-IR")}</p></div></header>
      <section className="mt-8 grid gap-5 rounded-2xl bg-[#f6f5f1] p-6 sm:grid-cols-2"><div><p className="text-xs text-black/40">خریدار</p><strong className="mt-2 block text-lg">{order.firstName} {order.lastName}</strong></div><div><p className="text-xs text-black/40">شماره تماس</p><strong className="mt-2 block text-lg" dir="ltr">{order.phone}</strong></div></section>
      <section className="mt-9"><h2 className="text-lg font-black">شرح سفارش</h2><div className="mt-4 overflow-hidden rounded-2xl border border-black/10"><div className="grid grid-cols-[1fr_72px_130px] bg-black px-5 py-3 text-xs font-bold text-white"><span>محصول</span><span>تعداد</span><span>مبلغ</span></div><div className="grid grid-cols-[1fr_72px_130px] items-center px-5 py-5 text-sm"><div><strong>{order.designName}</strong><p className="mt-1 text-xs leading-6 text-black/45">{order.fitId} · {order.colorId} · {order.sizeId} · {order.materialId}{order.variantSku ? ` · ${order.variantSku}` : ""}</p></div><span>{order.quantity.toLocaleString("fa-IR")}</span><span>{money(subtotal)}</span></div></div></section>
      <section className="mt-7 mr-auto w-full max-w-sm space-y-3 text-sm"><Line label="جمع کالا" value={money(subtotal)} /><Line label="تخفیف" value={money(order.discountAmount)} /><Line label="مبلغ قابل پرداخت" value={money(finalPrice)} final /></section>
      <section className="mt-10 grid grid-cols-2 gap-4"><Preview url={order.frontImageUrl} label="نمای جلو" /><Preview url={order.backImageUrl} label="نمای پشت" /></section>
      <footer className="mt-12 border-t border-black/10 pt-5 text-xs leading-6 text-black/40"><p>این فاکتور بر اساس سفارش ثبت‌شده در Avoocado Studio صادر شده است.</p><p dir="ltr">avoocadostudio.com</p></footer>
    </article>
  </main>;
}

function Line({ label, value, final }: { label: string; value: string; final?: boolean }) { return <div className={`flex justify-between gap-4 ${final ? "border-t-2 border-black pt-4 text-lg font-black" : "text-black/60"}`}><span>{label}</span><span>{value}</span></div>; }
function Preview({ url, label }: { url: string; label: string }) { return <div><div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#f6f5f1]"><Image src={preview(url)} alt={label} fill unoptimized className="object-contain" /></div><p className="mt-2 text-center text-xs text-black/40">{label}</p></div>; }

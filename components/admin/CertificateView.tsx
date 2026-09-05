"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { AdminOrder } from "./OrdersManager";

const preview = (url: string) =>
  url.startsWith("https://storage.avoocadostudio.com/uploads/")
    ? `/api/storage-image?url=${encodeURIComponent(url)}`
    : url;

export function CertificateView({ orderId }: { orderId: number }) {
  const [order, setOrder] = useState<AdminOrder>();
  const [message, setMessage] = useState("در حال آماده‌سازی شناسنامه…");
  useEffect(() => {
    void fetch("/api/admin/orders", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401)
          return setMessage("برای دیدن شناسنامه ابتدا وارد پنل شوید.");
        const data = await response.json();
        const found = (data.orders as AdminOrder[] | undefined)?.find(
          (item) => item.id === orderId,
        );
        if (!found) return setMessage("سفارش پیدا نشد.");
        setOrder(found);
      })
      .catch(() => setMessage("دریافت اطلاعات شناسنامه انجام نشد."));
  }, [orderId]);
  if (!order)
    return (
      <main
        className="grid min-h-screen place-items-center bg-[#f2f1ec] p-6"
        dir="rtl"
      >
        <div className="rounded-3xl bg-white p-8 text-center">
          <p>{message}</p>
          <Link href="/admin/orders" className="mt-5 inline-block underline">
            بازگشت
          </Link>
        </div>
      </main>
    );
  const serial = `${String(order.editionStart).padStart(3, "0")}${order.editionEnd !== order.editionStart ? `–${String(order.editionEnd).padStart(3, "0")}` : ""} / ${order.editionLimit}`;
  return (
    <main
      className="min-h-screen bg-[#e9e8e2] px-4 py-8 print:bg-white print:p-0"
      dir="rtl"
    >
      <div className="no-print mx-auto mb-5 flex max-w-[210mm] justify-between">
        <Link
          href="/admin/orders"
          className="rounded-full bg-white px-5 py-3 font-bold"
        >
          بازگشت
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded-full bg-black px-6 py-3 font-bold text-white"
        >
          دانلود یا چاپ PDF
        </button>
      </div>
      <article className="invoice-sheet mx-auto min-h-[297mm] w-full max-w-[210mm] overflow-hidden bg-[#f8f7f2] shadow-xl print:min-h-0 print:max-w-none print:shadow-none">
        <header className="bg-black px-10 py-12 text-white md:px-16">
          <p className="text-xs tracking-[.3em] text-lime-300">
            AVOOCADO / LIMITED EDITION
          </p>
          <h1 className="mt-5 text-5xl font-black">شناسنامه اثر</h1>
          <p className="mt-4 text-white/55" dir="ltr">
            CERTIFICATE OF AUTHENTICITY
          </p>
        </header>
        <div className="p-10 md:p-16">
          <section className="grid items-start gap-10 md:grid-cols-[1fr_240px]">
            <div>
              <p className="text-xs text-black/40">نام اثر</p>
              <h2 className="mt-2 text-4xl font-black">{order.designName}</h2>
              <p className="mt-7 text-sm leading-8 text-black/65">
                {order.designDescription ||
                  order.collectionDescription ||
                  "این اثر به‌عنوان بخشی از مجموعه محدود Avoocado Studio تولید و شماره‌گذاری شده است."}
              </p>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white">
              <Image
                src={preview(order.frontImageUrl)}
                alt={order.designName}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          </section>
          <section className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-black/10 sm:grid-cols-2">
            <Cell label="شماره نسخه" value={serial} ltr />
            <Cell label="کد اصالت / سفارش" value={order.orderCode} ltr />
            <Cell
              label="مالک نخست"
              value={`${order.firstName} ${order.lastName}`}
            />
            <Cell
              label="تاریخ ثبت"
              value={new Date(`${order.createdAt}Z`).toLocaleDateString(
                "fa-IR",
              )}
            />
          </section>
          <footer className="mt-16 flex items-end justify-between border-t border-black/15 pt-8">
            <div>
              <strong>AVOOCADO STUDIO</strong>
              <p className="mt-2 text-xs text-black/40">avoocadostudio.com</p>
            </div>
            <div className="text-left">
              <div className="h-12 w-40 border-b border-black" />
              <p className="mt-2 text-xs text-black/40">امضا و مهر استودیو</p>
            </div>
          </footer>
        </div>
      </article>
    </main>
  );
}

function Cell({
  label,
  value,
  ltr,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="bg-white p-5">
      <p className="text-xs text-black/40">{label}</p>
      <strong className="mt-2 block text-lg" dir={ltr ? "ltr" : undefined}>
        {value}
      </strong>
    </div>
  );
}

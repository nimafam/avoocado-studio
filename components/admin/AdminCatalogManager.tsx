"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { adminRequest, Catalog } from "./catalog-types";

export function AdminCatalogManager() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void adminRequest()
      .then(setCatalog)
      .catch(() => setCatalog(null));
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminRequest("/api/admin/session", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      setCatalog(await adminRequest());
      setPassword("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ورود انجام نشد.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await adminRequest("/api/admin/session", { method: "DELETE" });
    setCatalog(null);
  }

  if (!catalog)
    return (
      <main
        className="grid min-h-screen place-items-center bg-[#f2f1ec] p-6"
        dir="rtl"
      >
        <form
          onSubmit={login}
          className="w-full max-w-md rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_30px_90px_rgba(0,0,0,.08)]"
        >
          <span className="inline-flex rounded-full bg-lime-300 px-3 py-1 text-xs font-bold tracking-widest text-black">
            AVOOCADO
          </span>
          <h1 className="mt-6 text-3xl font-black">ورود به مدیریت</h1>
          <p className="mt-2 text-sm leading-7 text-black/50">
            کالکشن‌ها، طرح‌ها و سفارش‌های فروشگاه را مدیریت کنید.
          </p>
          <label className="mt-7 block text-sm font-bold">
            رمز عبور
            <input
              autoFocus
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-black/15 bg-[#fafaf8] px-4 py-3 outline-none transition focus:border-black"
            />
          </label>
          <button
            disabled={busy}
            className="mt-4 w-full rounded-xl bg-black px-5 py-4 font-bold text-white transition hover:bg-lime-300 hover:text-black disabled:opacity-50"
          >
            {busy ? "در حال ورود…" : "ورود"}
          </button>
          {error ? (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </form>
      </main>
    );

  const activeCount = catalog.categories.filter((item) => item.active).length;
  return (
    <main className="min-h-screen bg-[#f2f1ec] pb-20" dir="rtl">
      <header className="border-b border-black/8 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 md:px-10">
          <div>
            <span className="text-xs font-bold tracking-[.25em] text-[#668000]">
              AVOOCADO STUDIO
            </span>
            <h1 className="mt-2 text-3xl font-black">مدیریت فروشگاه</h1>
          </div>
          <nav className="flex gap-2">
            <Link
              href="/admin/orders"
              className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-bold !text-black transition hover:bg-black hover:!text-white"
            >
              سفارش‌ها
            </Link>
            <button
              onClick={logout}
              className="rounded-full border border-black/10 px-5 py-2.5 text-sm transition hover:border-red-300 hover:text-red-700"
            >
              خروج
            </button>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-black p-6 text-white">
            <p className="text-sm text-white/55">تعداد کالکشن‌ها</p>
            <strong className="mt-3 block text-4xl">
              {catalog.categories.length.toLocaleString("fa-IR")}
            </strong>
          </div>
          <div className="rounded-3xl bg-lime-300 p-6">
            <p className="text-sm text-black/55">کالکشن فعال</p>
            <strong className="mt-3 block text-4xl">
              {activeCount.toLocaleString("fa-IR")}
            </strong>
          </div>
          <div className="rounded-3xl bg-white p-6">
            <p className="text-sm text-black/55">طرح‌های ثبت‌شده</p>
            <strong className="mt-3 block text-4xl">
              {catalog.designs.length.toLocaleString("fa-IR")}
            </strong>
          </div>
        </section>
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#668000]">CATALOG</p>
              <h2 className="mt-1 text-3xl font-black">کالکشن‌ها</h2>
            </div>
            <Link
              href="/admin/collections/new"
              className="rounded-full bg-black px-6 py-3 text-sm font-bold !text-white transition hover:bg-lime-300 hover:!text-black"
            >
              + کالکشن جدید
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {catalog.categories.map((item) => {
              const count = catalog.designs.filter(
                (design) => design.collectionId === item.id,
              ).length;
              return (
                <Link
                  key={item.id}
                  href={`/admin/collections/${item.id}`}
                  className="group rounded-3xl border border-black/8 bg-white p-6 transition hover:-translate-y-1 hover:border-black/20 hover:shadow-[0_20px_50px_rgba(0,0,0,.07)]"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${item.active ? "bg-green-100 text-green-800" : "bg-black/5 text-black/40"}`}
                    >
                      {item.active ? "فعال" : "غیرفعال"}
                    </span>
                    <span className="text-2xl transition group-hover:-translate-x-1">
                      ←
                    </span>
                  </div>
                  <h3 className="mt-8 text-2xl font-black">{item.nameFa}</h3>
                  <p className="mt-1 text-sm text-black/45">{item.nameEn}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-black/8 pt-4 text-xs text-black/45">
                    <code dir="ltr">/{item.slug}</code>
                    <span>{count.toLocaleString("fa-IR")} طرح</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

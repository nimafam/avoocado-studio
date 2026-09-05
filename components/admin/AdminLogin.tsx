"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (data.authenticated) router.replace("/admin/dashboard");
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ورود انجام نشد.");
      router.replace("/admin/dashboard");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ورود انجام نشد.");
    } finally {
      setBusy(false);
    }
  }

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
          پس از ورود مستقیماً به داشبورد مدیریت منتقل می‌شوید.
        </p>
        {checking ? (
          <div className="mt-8 flex items-center gap-3 text-sm text-black/45">
            <span className="size-5 animate-spin rounded-full border-2 border-black/15 border-t-black" />
            در حال بررسی نشست…
          </div>
        ) : (
          <>
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
              {busy ? "در حال ورود…" : "ورود به داشبورد"}
            </button>
          </>
        )}
        {error ? (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </form>
    </main>
  );
}

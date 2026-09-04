"use client";

import { createContext, FormEvent, useContext, useMemo, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export type CartItem = {
  id: string;
  designName: string;
  quantity: number;
  unitPrice: number;
  payload: Record<string, unknown>;
  front: Blob;
  back: Blob;
};

const CartContext = createContext<{
  items: CartItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (item: Omit<CartItem, "id">) => void;
  remove: (id: string) => void;
}>({
  items: [],
  open: false,
  setOpen: () => undefined,
  add: () => undefined,
  remove: () => undefined,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const value = useMemo(
    () => ({
      items,
      open,
      setOpen,
      add: (item: Omit<CartItem, "id">) => {
        setItems((current) => [
          ...current,
          { ...item, id: crypto.randomUUID() },
        ]);
        setOpen(true);
      },
      remove: (id: string) =>
        setItems((current) => current.filter((item) => item.id !== id)),
    }),
    [items, open],
  );
  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer onClear={() => setItems([])} />
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

function CartDrawer({ onClear }: { onClear: () => void }) {
  const { items, open, setOpen, remove } = useCart();
  const { locale } = useLanguage();
  const fa = locale === "fa";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [trackingCodes, setTrackingCodes] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = JSON.parse(
        localStorage.getItem("avoocado-tracking-codes") ?? "[]",
      );
      return Array.isArray(saved)
        ? saved.filter((code) => typeof code === "string")
        : [];
    } catch {
      return [];
    }
  });
  const [copied, setCopied] = useState(false);
  const total = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setCopied(false);
    const fields = new FormData(event.currentTarget);
    const codes: string[] = [];
    try {
      for (const item of items) {
        const payload = {
          ...item.payload,
          firstName: fields.get("firstName"),
          lastName: fields.get("lastName"),
          phone: fields.get("phone"),
          website: fields.get("website"),
        };
        const form = new FormData();
        form.set("order", JSON.stringify(payload));
        form.set("front", item.front, "front.webp");
        form.set("back", item.back, "back.webp");
        const response = await fetch("/api/orders", {
          method: "POST",
          body: form,
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(
            data.error ||
              (fa ? "ثبت سفارش انجام نشد." : "Order could not be placed."),
          );
        codes.push(data.orderCode);
      }
      onClear();
      setTrackingCodes(codes);
      localStorage.setItem("avoocado-tracking-codes", JSON.stringify(codes));
      setMessage(fa ? "سفارش با موفقیت ثبت شد." : "Order placed successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : fa
            ? "ثبت سفارش انجام نشد."
            : "Order could not be placed.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function copyTrackingCodes() {
    await navigator.clipboard.writeText(trackingCodes.join("، "));
    setCopied(true);
  }
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/45"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) setOpen(false);
      }}
    >
      <aside
        className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto bg-[#f6f5f1] p-6 shadow-2xl"
        dir={fa ? "rtl" : "ltr"}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">
            {fa ? "بگ خرید" : "Shopping bag"}
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="grid size-10 place-items-center rounded-full bg-black/5 text-xl"
          >
            ×
          </button>
        </div>
        <div className="mt-7 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl bg-white p-4">
              <div className="flex justify-between gap-4">
                <div>
                  <strong>{item.designName}</strong>
                  <p className="mt-1 text-xs text-black/45">
                    {item.quantity} ×{" "}
                    {item.unitPrice.toLocaleString(fa ? "fa-IR" : "en-US")}
                  </p>
                </div>
                <button
                  onClick={() => remove(item.id)}
                  className="text-xs text-red-700"
                >
                  {fa ? "حذف" : "Remove"}
                </button>
              </div>
            </div>
          ))}
          {!items.length && !message ? (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-black/45">
              {fa ? "بگ خرید خالی است." : "Your bag is empty."}
            </p>
          ) : null}
        </div>
        {items.length ? (
          <form onSubmit={submit} className="mt-7 space-y-3">
            <div className="flex justify-between border-y border-black/15 py-4 font-bold">
              <span>{fa ? "جمع کل" : "Total"}</span>
              <span>
                {total.toLocaleString(fa ? "fa-IR" : "en-US")}{" "}
                {fa ? "تومان" : "Toman"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                name="firstName"
                maxLength={60}
                placeholder={fa ? "نام" : "First name"}
                className="rounded-xl border border-black/15 bg-white p-3"
              />
              <input
                required
                name="lastName"
                maxLength={80}
                placeholder={fa ? "نام خانوادگی" : "Last name"}
                className="rounded-xl border border-black/15 bg-white p-3"
              />
            </div>
            <input
              required
              name="phone"
              inputMode="tel"
              pattern="[+0-9 ()-]{8,20}"
              placeholder={fa ? "شماره تماس الزامی" : "Phone number (required)"}
              className="w-full rounded-xl border border-black/15 bg-white p-3"
            />
            <input
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
            />
            <button
              disabled={busy}
              className="w-full rounded-xl bg-black py-4 font-bold text-white transition hover:bg-lime-300 hover:text-black disabled:opacity-50"
            >
              {busy
                ? fa
                  ? "در حال ثبت…"
                  : "Placing order…"
                : fa
                  ? "تأیید و ارسال سفارش"
                  : "Confirm order"}
            </button>
          </form>
        ) : null}
        {message ? (
          <p className="mt-5 rounded-xl bg-white p-4 text-sm leading-6">
            {message}
          </p>
        ) : null}
        {trackingCodes.length ? (
          <section className="mt-4 rounded-2xl border-2 border-black bg-lime-300 p-5">
            <p className="text-sm font-black">
              {fa ? "کد پیگیری سفارش" : "Order tracking code"}
            </p>
            <div className="mt-3 space-y-2" dir="ltr">
              {trackingCodes.map((code) => (
                <strong key={code} className="block text-xl tracking-wider">
                  {code}
                </strong>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5">
              {fa
                ? "این کد را حتماً ذخیره کنید؛ برای پیگیری سفارش به آن نیاز دارید."
                : "Please save this code. You will need it to track your order."}
            </p>
            <button
              type="button"
              onClick={() => void copyTrackingCodes()}
              className="mt-4 w-full rounded-xl bg-black py-3 text-sm font-bold text-white"
            >
              {copied
                ? fa
                  ? "کد کپی شد"
                  : "Code copied"
                : fa
                  ? "کپی کد پیگیری"
                  : "Copy tracking code"}
            </button>
          </section>
        ) : null}
      </aside>
    </div>
  );
}

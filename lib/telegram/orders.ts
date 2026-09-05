import { env } from "cloudflare:workers";

type TelegramEnv = {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_ADMIN_CHAT_IDS?: string;
};

export async function sendOrderToTelegram(order: {
  orderCode: string;
  customer: string;
  phone: string;
  designName: string;
  quantity: number;
  totalPrice: number;
  variantSku?: string | null;
  frontUrl: string;
  backUrl: string;
  editionStart?: number | null;
  editionEnd?: number | null;
  editionLimit?: number | null;
}) {
  const runtime = env as unknown as TelegramEnv;
  const token = runtime.TELEGRAM_BOT_TOKEN;
  const chatIds = (runtime.TELEGRAM_ADMIN_CHAT_IDS || "65097245")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!token || !chatIds.length)
    return { status: "not_configured" as const, error: null };
  const text = [
    `🛍 سفارش جدید ${order.orderCode}`,
    `مشتری: ${order.customer}`,
    `تلفن: ${order.phone}`,
    `محصول: ${order.designName}`,
    order.variantSku ? `SKU: ${order.variantSku}` : null,
    `تعداد: ${order.quantity}`,
    order.editionStart && order.editionLimit
      ? `نسخه محدود: ${String(order.editionStart).padStart(3, "0")}${order.editionEnd !== order.editionStart ? ` تا ${String(order.editionEnd).padStart(3, "0")}` : ""} از ${order.editionLimit}`
      : null,
    `مبلغ: ${order.totalPrice.toLocaleString("fa-IR")} تومان`,
    `نمای جلو: ${order.frontUrl}`,
    `نمای پشت: ${order.backUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
  try {
    const results = await Promise.all(
      chatIds.map((chat_id) =>
        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id,
            text,
            disable_web_page_preview: false,
          }),
        }),
      ),
    );
    if (results.some((response) => !response.ok))
      throw new Error(
        `Telegram returned ${results.find((response) => !response.ok)?.status}`,
      );
    return { status: "sent" as const, error: null };
  } catch (error) {
    return {
      status: "failed" as const,
      error:
        error instanceof Error
          ? error.message.slice(0, 300)
          : "Unknown Telegram error",
    };
  }
}

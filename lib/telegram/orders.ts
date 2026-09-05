import { env } from "cloudflare:workers";

type TelegramEnv = {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_ADMIN_CHAT_IDS?: string;
};

type TelegramOrderItem = {
  designName: string;
  quantity: number;
  variantSku?: string | null;
  frontUrl: string;
  backUrl: string;
  editionStart?: number | null;
  editionEnd?: number | null;
  editionLimit?: number | null;
};

export async function sendOrderToTelegram(order: {
  orderCode: string;
  customer: string;
  phone: string;
  totalPrice: number;
  items: TelegramOrderItem[];
}) {
  const runtime = env as unknown as TelegramEnv;
  const token = runtime.TELEGRAM_BOT_TOKEN;
  const chatIds = (runtime.TELEGRAM_ADMIN_CHAT_IDS || "65097245")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!token || !chatIds.length)
    return { status: "not_configured" as const, error: null };

  const itemLines = order.items.flatMap((item, index) => [
    `${index + 1}) ${item.designName} — تعداد ${item.quantity}`,
    item.variantSku ? `SKU: ${item.variantSku}` : null,
    item.editionStart && item.editionLimit
      ? `نسخه محدود: ${String(item.editionStart).padStart(3, "0")}${item.editionEnd !== item.editionStart ? ` تا ${String(item.editionEnd).padStart(3, "0")}` : ""} از ${item.editionLimit}`
      : null,
    `جلو: ${item.frontUrl}`,
    `پشت: ${item.backUrl}`,
    "",
  ]);
  const text = [
    `🛍 سفارش جدید ${order.orderCode}`,
    `مشتری: ${order.customer}`,
    `تلفن: ${order.phone}`,
    `تعداد آیتم‌ها: ${order.items.length}`,
    "",
    ...itemLines,
    `مبلغ کل: ${order.totalPrice.toLocaleString("fa-IR")} تومان`,
  ]
    .filter((line): line is string => line !== null)
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
            disable_web_page_preview: true,
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

import { env } from "cloudflare:workers";
import { isAdminRequest, isSameOrigin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

type AiBinding = { run: (model: string, input: unknown) => Promise<unknown> };

export async function POST(request: Request) {
  if (!isSameOrigin(request) || !(await isAdminRequest(request)))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as {
    kind?: "collection" | "design";
    name?: string;
    nameFa?: string;
    nameEn?: string;
    collection?: string;
    current?: string;
  };
  const subject =
    body.kind === "collection"
      ? `کالکشن «${body.nameFa || body.nameEn || "بدون نام"}»`
      : `طرح تیشرت «${body.name || "بدون نام"}» از کالکشن «${body.collection || "نامشخص"}»`;
  try {
    const result = (await (env as unknown as { AI: AiBinding }).AI.run(
      "@cf/google/gemma-4-26b-a4b-it",
      {
        messages: [
          {
            role: "system",
            content:
              "تو نویسنده و کیوریتور برند پوشاک هنری Avoocado Studio هستی. یک متن فارسی روان، اصیل و غیرکلیشه‌ای در 80 تا 130 کلمه بنویس که زمینه فرهنگی/هنری اثر، ایده طراحی و حس داشتن یک نسخه محدود را بیان کند. ادعای تاریخی تاییدنشده نساز. فقط متن نهایی را بنویس و تیتر یا توضیح اضافه نده.",
          },
          {
            role: "user",
            content: `برای ${subject} توضیح بنویس.${body.current?.trim() ? ` متن فعلی برای بازنویسی: ${body.current.trim().slice(0, 1200)}` : ""}`,
          },
        ],
        max_tokens: 350,
        temperature: 0.75,
        chat_template_kwargs: { enable_thinking: false },
      },
    )) as { response?: string; choices?: { message?: { content?: string } }[] };
    const description =
      result.response ?? result.choices?.[0]?.message?.content;
    if (!description?.trim()) throw new Error("Empty AI response");
    return Response.json({ description: description.trim() });
  } catch (error) {
    console.error("catalog_copy_generation_failed", error);
    return Response.json(
      { error: "عامل متن‌نویس در دسترس نبود؛ دوباره تلاش کنید." },
      { status: 502 },
    );
  }
}

import { readFile } from "node:fs/promises";

const origin = "http://localhost:3031";
const vars = Object.fromEntries((await readFile(".dev.vars", "utf8")).split(/\r?\n/).filter(Boolean).map((line) => line.split(/=(.*)/s).slice(0, 2)));

const login = await fetch(`${origin}/api/admin/session`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: origin },
  body: JSON.stringify({ password: vars.ADMIN_PASSWORD }),
});
if (!login.ok) throw new Error(`Admin login failed: ${login.status}`);
const cookie = login.headers.getSetCookie().map((value) => value.split(";", 1)[0]).join("; ");

const preview = Buffer.from("UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEAAUAmJaQAA3AA/v89WAAAAA==", "base64");
const front = preview;
const back = preview;
const form = new FormData();
form.set("order", JSON.stringify({ firstName: "Test", lastName: "Customer", phone: "09120000000", designName: "Local test", collectionSlug: "boardgame", materialId: "cotton-28", sizeId: "Large", fitId: "boxy", colorId: "black", printSide: "front", placementId: "center", quantity: 1, unitPrice: 46 }));
form.set("front", new Blob([front], { type: "image/webp" }), "front.webp");
form.set("back", new Blob([back], { type: "image/webp" }), "back.webp");
const created = await fetch(`${origin}/api/orders`, { method: "POST", headers: { Origin: origin }, body: form });
const createdBody = await created.json();
if (created.status !== 201) throw new Error(`Order creation failed: ${created.status} ${JSON.stringify(createdBody)}`);

const list = await fetch(`${origin}/api/admin/orders`, { headers: { Cookie: cookie } });
const listBody = await list.json();
const order = listBody.orders?.find((item) => item.orderCode === createdBody.orderCode);
if (!order) throw new Error("Created order is missing from the admin list");
for (const key of [order.frontImageKey, order.backImageKey]) {
  const image = await fetch(`${origin}/api/admin/order-image/${key}`, { headers: { Cookie: cookie } });
  if (!image.ok || image.headers.get("content-type") !== "image/webp") throw new Error(`Private image failed: ${key}`);
}
const updated = await fetch(`${origin}/api/admin/orders`, { method: "PATCH", headers: { Cookie: cookie, Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify({ id: order.id, status: "confirmed" }) });
if (!updated.ok) throw new Error(`Status update failed: ${updated.status}`);
console.log(JSON.stringify({ ok: true, orderCode: order.orderCode, images: 2, status: "confirmed" }));




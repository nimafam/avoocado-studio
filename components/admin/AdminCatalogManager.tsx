"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Category = { id: number; slug: string; nameFa: string; nameEn: string; sortOrder: number; active: number };
type Design = { id: number; slug: string; name: string; description: string; basePrice: number; artworkKey: string | null; active: number; collectionId: number | null; collectionName: string | null; placements: string | null };
type Catalog = { categories: Category[]; designs: Design[]; placements: string[] };
type DesignDraft = { id?: number; slug: string; name: string; description: string; basePrice: string; artworkKey: string; collectionId: string; placements: string[]; active: boolean };

const placementLabels: Record<string, string> = { left: "Left", right: "Right", center: "Center", large: "Large Center", lower: "Lower Center", upper: "Upper Center" };
const emptyDesign: DesignDraft = { slug: "", name: "", description: "", basePrice: "0", artworkKey: "", collectionId: "", placements: ["center"], active: true };

async function jsonRequest(url: string, init?: RequestInit) {
    const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Something went wrong.");
    return body;
}

export function AdminCatalogManager() {
    const [authenticated, setAuthenticated] = useState<boolean | null>(null);
    const [catalog, setCatalog] = useState<Catalog>({ categories: [], designs: [], placements: [] });
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const [collectionDraft, setCollectionDraft] = useState({ id: 0, slug: "", nameFa: "", nameEn: "", active: true });
    const [designDraft, setDesignDraft] = useState<DesignDraft>(emptyDesign);

    const loadCatalog = useCallback(async () => {
        try {
            const data = await jsonRequest("/api/admin/catalog");
            setCatalog(data);
            setAuthenticated(true);
        } catch { setAuthenticated(false); }
    }, []);

    useEffect(() => {
        void jsonRequest("/api/admin/catalog").then((data) => { setCatalog(data); setAuthenticated(true); }).catch(() => setAuthenticated(false));
    }, []);

    async function login(event: FormEvent) {
        event.preventDefault(); setBusy(true); setMessage("");
        try { await jsonRequest("/api/admin/session", { method: "POST", body: JSON.stringify({ password }) }); setPassword(""); await loadCatalog(); }
        catch (error) { setMessage(error instanceof Error ? error.message : "ورود ناموفق بود."); }
        finally { setBusy(false); }
    }

    async function logout() { await jsonRequest("/api/admin/session", { method: "DELETE" }); setAuthenticated(false); }

    async function saveCollection(event: FormEvent) {
        event.preventDefault(); setBusy(true); setMessage("");
        try {
            const method = collectionDraft.id ? "PATCH" : "POST";
            const data = await jsonRequest("/api/admin/catalog", { method, body: JSON.stringify({ entity: "collection", ...collectionDraft }) });
            setCatalog(data); setCollectionDraft({ id: 0, slug: "", nameFa: "", nameEn: "", active: true });
        } catch (error) { setMessage(error instanceof Error ? error.message : "ذخیره انجام نشد."); }
        finally { setBusy(false); }
    }

    async function uploadArtwork(file: File) {
        const form = new FormData(); form.append("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body: form });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Upload failed.");
        return data as { key: string; url: string };
    }

    async function saveDesign(event: FormEvent<HTMLFormElement>) {
        event.preventDefault(); setBusy(true); setMessage("");
        try {
            const form = new FormData(event.currentTarget);
            const file = form.get("artwork");
            let artworkKey = designDraft.artworkKey;
            if (file instanceof File && file.size) artworkKey = (await uploadArtwork(file)).key;
            const method = designDraft.id ? "PATCH" : "POST";
            const data = await jsonRequest("/api/admin/catalog", { method, body: JSON.stringify({ entity: "design", ...designDraft, artworkKey, basePrice: Number(designDraft.basePrice), collectionId: Number(designDraft.collectionId) }) });
            setCatalog(data); setDesignDraft({ ...emptyDesign, collectionId: String(data.categories[0]?.id ?? "") }); event.currentTarget.reset();
        } catch (error) { setMessage(error instanceof Error ? error.message : "ذخیره انجام نشد."); }
        finally { setBusy(false); }
    }

    async function toggle(entity: "collection" | "design", item: Category | Design) {
        setBusy(true); setMessage("");
        try {
            const payload = entity === "collection"
                ? { entity, id: item.id, slug: (item as Category).slug, nameFa: (item as Category).nameFa, nameEn: (item as Category).nameEn, active: !item.active }
                : { entity, ...(item as Design), active: !item.active, placements: (item as Design).placements?.split(",") ?? ["center"] };
            setCatalog(await jsonRequest("/api/admin/catalog", { method: "PATCH", body: JSON.stringify(payload) }));
        } catch (error) { setMessage(error instanceof Error ? error.message : "تغییر وضعیت انجام نشد."); }
        finally { setBusy(false); }
    }

    async function remove(entity: "collection" | "design", id: number) {
        if (!confirm("این مورد برای همیشه حذف شود؟")) return;
        setBusy(true); setMessage("");
        try { setCatalog(await jsonRequest(`/api/admin/catalog?entity=${entity}&id=${id}`, { method: "DELETE" })); }
        catch (error) { setMessage(error instanceof Error ? error.message : "حذف انجام نشد."); }
        finally { setBusy(false); }
    }

    if (authenticated === null) return <main className="flex min-h-screen items-center justify-center bg-[#efeee9]"><p className="text-sm text-black/45">Loading…</p></main>;
    if (!authenticated) return <main className="flex min-h-screen items-center justify-center bg-[#efeee9] p-6"><form onSubmit={login} className="w-full max-w-sm bg-white p-8 shadow-[0_24px_70px_rgba(0,0,0,.08)]"><p className="text-xs uppercase tracking-[.18em] text-[var(--color-primary)]">Avoocado</p><h1 className="mt-3 text-3xl font-bold">مدیریت کاتالوگ</h1><p className="mt-3 text-sm leading-6 text-black/50">برای مدیریت کالکشن‌ها و طرح‌ها رمز ورود را وارد کنید.</p><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required placeholder="رمز ورود" className="mt-7 w-full border border-black/20 px-4 py-3 outline-none focus:border-black" /><button disabled={busy} className="mt-3 w-full bg-black py-4 text-sm text-white disabled:opacity-50">ورود</button>{message ? <p className="mt-4 text-sm text-red-700">{message}</p> : null}</form></main>;

    return <main className="min-h-screen bg-[#efeee9] px-5 py-8 md:px-10">
        <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-black/15 pb-6"><div><p className="text-xs uppercase tracking-[.18em] text-[var(--color-primary)]">Avoocado</p><h1 className="mt-2 text-3xl font-bold">Catalog manager</h1></div><div className="flex items-center gap-2"><Link href="/admin/orders" className="border border-black/20 px-4 py-2 text-sm transition hover:bg-black hover:text-white">سفارش‌ها</Link><button onClick={logout} className="border border-black/20 px-4 py-2 text-sm">خروج</button></div></header>
        {message ? <p className="mx-auto mt-5 max-w-7xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">{message}</p> : null}
        <div className="mx-auto mt-8 grid max-w-7xl gap-8 xl:grid-cols-2">
            <section className="bg-white p-6"><h2 className="text-2xl font-bold">کالکشن‌ها</h2><form onSubmit={saveCollection} className="mt-5 grid gap-3 sm:grid-cols-2"><input required placeholder="Slug انگلیسی" value={collectionDraft.slug} onChange={(e) => setCollectionDraft({ ...collectionDraft, slug: e.target.value })} className="border border-black/20 p-3"/><input required placeholder="نام فارسی" value={collectionDraft.nameFa} onChange={(e) => setCollectionDraft({ ...collectionDraft, nameFa: e.target.value })} className="border border-black/20 p-3"/><input required placeholder="English name" value={collectionDraft.nameEn} onChange={(e) => setCollectionDraft({ ...collectionDraft, nameEn: e.target.value })} className="border border-black/20 p-3"/><button disabled={busy} className="bg-black p-3 text-white">{collectionDraft.id ? "ذخیره تغییرات" : "افزودن کالکشن"}</button></form><div className="mt-6 divide-y divide-black/10">{catalog.categories.map((item) => <div key={item.id} className="flex items-center gap-3 py-3"><span className={`size-2 rounded-full ${item.active ? "bg-green-600" : "bg-black/20"}`}/><div className="min-w-0 flex-1"><p className="font-medium">{item.nameFa} / {item.nameEn}</p><p className="text-xs text-black/40">{item.slug}</p></div><button onClick={() => setCollectionDraft({ id: item.id, slug: item.slug, nameFa: item.nameFa, nameEn: item.nameEn, active: Boolean(item.active) })} className="text-xs underline">ویرایش</button><button onClick={() => toggle("collection", item)} className="text-xs underline">{item.active ? "غیرفعال" : "فعال"}</button><button onClick={() => remove("collection", item.id)} className="text-xs text-red-700 underline">حذف</button></div>)}</div></section>
            <section className="bg-white p-6"><h2 className="text-2xl font-bold">طرح‌ها</h2><form onSubmit={saveDesign} className="mt-5 space-y-3"><div className="grid gap-3 sm:grid-cols-2"><input required placeholder="نام طرح" value={designDraft.name} onChange={(e) => setDesignDraft({ ...designDraft, name: e.target.value })} className="border border-black/20 p-3"/><input required placeholder="slug-design" value={designDraft.slug} onChange={(e) => setDesignDraft({ ...designDraft, slug: e.target.value })} className="border border-black/20 p-3"/><select required value={designDraft.collectionId} onChange={(e) => setDesignDraft({ ...designDraft, collectionId: e.target.value })} className="border border-black/20 p-3"><option value="">انتخاب کالکشن</option>{catalog.categories.map((item) => <option value={item.id} key={item.id}>{item.nameFa}</option>)}</select><input type="number" min="0" placeholder="قیمت پایه" value={designDraft.basePrice} onChange={(e) => setDesignDraft({ ...designDraft, basePrice: e.target.value })} className="border border-black/20 p-3"/></div><textarea placeholder="توضیحات" value={designDraft.description} onChange={(e) => setDesignDraft({ ...designDraft, description: e.target.value })} className="min-h-24 w-full border border-black/20 p-3"/><label className="block border border-dashed border-black/25 p-4 text-sm">آپلود تصویر طرح <input name="artwork" type="file" accept="image/png,image/jpeg,image/webp" className="mt-2 block w-full"/></label><fieldset><legend className="mb-2 text-sm">Placementهای مجاز</legend><div className="flex flex-wrap gap-2">{catalog.placements.map((placement) => <label key={placement} className="flex items-center gap-2 border border-black/15 px-3 py-2 text-xs"><input type="checkbox" checked={designDraft.placements.includes(placement)} onChange={(e) => setDesignDraft({ ...designDraft, placements: e.target.checked ? [...designDraft.placements, placement] : designDraft.placements.filter((item) => item !== placement) })}/>{placementLabels[placement]}</label>)}</div></fieldset><button disabled={busy} className="w-full bg-black p-4 text-white">{designDraft.id ? "ذخیره تغییرات طرح" : "افزودن طرح"}</button>{designDraft.id ? <button type="button" onClick={() => setDesignDraft({ ...emptyDesign, collectionId: String(catalog.categories[0]?.id ?? "") })} className="w-full border border-black/20 p-3">انصراف از ویرایش</button> : null}</form>
                <div className="mt-7 space-y-3">{catalog.designs.map((item) => <article key={item.id} className="flex gap-3 border border-black/10 p-3">{item.artworkKey ? <div className="relative size-20 shrink-0 bg-[#efeee9]"><Image src={`/api/artwork/${item.artworkKey}`} alt="" fill unoptimized className="object-contain"/></div> : <div className="flex size-20 shrink-0 items-center justify-center bg-[#efeee9] text-xs text-black/35">No image</div>}<div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className={`size-2 rounded-full ${item.active ? "bg-green-600" : "bg-black/20"}`}/><h3 className="truncate font-medium">{item.name}</h3></div><p className="mt-1 text-xs text-black/45">{item.collectionName} · {item.placements?.split(",").map((p) => placementLabels[p]).join(", ")}</p><div className="mt-3 flex gap-3"><button onClick={() => setDesignDraft({ id: item.id, slug: item.slug, name: item.name, description: item.description, basePrice: String(item.basePrice), artworkKey: item.artworkKey ?? "", collectionId: String(item.collectionId ?? ""), placements: item.placements?.split(",") ?? ["center"], active: Boolean(item.active) })} className="text-xs underline">ویرایش</button><button onClick={() => toggle("design", item)} className="text-xs underline">{item.active ? "غیرفعال" : "فعال"}</button><button onClick={() => remove("design", item.id)} className="text-xs text-red-700 underline">حذف</button></div></div></article>)}</div>
            </section>
        </div>
    </main>;
}


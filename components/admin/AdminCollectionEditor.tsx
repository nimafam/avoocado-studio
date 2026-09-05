"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  adminRequest,
  Catalog,
  Design,
  imageUrl,
  slugify,
  Variant,
} from "./catalog-types";

type Props = { collectionId?: number };
type DesignDraft = {
  id?: number;
  name: string;
  slug: string;
  description: string;
  basePrice: string;
  baseCost: string;
  editionLimit: string;
  editionIssued: string;
  artworkKey: string;
  placements: string[];
  active: boolean;
};
type VariantDraft = {
  id?: number;
  sku: string;
  price: string;
  costPrice: string;
  stockQuantity: string;
  materialId: string;
  sizeId: string;
  fitId: string;
  colorId: string;
  printMethodId: string;
  active: boolean;
};
const emptyDesign: DesignDraft = {
  name: "",
  slug: "",
  description: "",
  basePrice: "0",
  baseCost: "0",
  editionLimit: "0",
  editionIssued: "0",
  artworkKey: "",
  placements: ["center"],
  active: true,
};
const placementLabels: Record<string, string> = {
  left: "چپ",
  right: "راست",
  center: "وسط",
  large: "وسط بزرگ",
  lower: "پایین وسط",
  upper: "بالا وسط",
};

function skuFrom(design: DesignDraft, variant: VariantDraft) {
  return [
    design.slug || "design",
    variant.fitId,
    variant.materialId,
    variant.sizeId,
    variant.colorId,
  ]
    .filter(Boolean)
    .join("-")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .toUpperCase();
}

export function AdminCollectionEditor({ collectionId }: Props) {
  const router = useRouter();
  const newFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [collection, setCollection] = useState({
    nameFa: "",
    nameEn: "",
    slug: "",
    description: "",
    active: true,
  });
  const [collectionSlugTouched, setCollectionSlugTouched] = useState(false);
  const [design, setDesign] = useState<DesignDraft>(emptyDesign);
  const [newDesign, setNewDesign] = useState<DesignDraft>(emptyDesign);
  const [designSlugTouched, setDesignSlugTouched] = useState(false);
  const [newDesignSlugTouched, setNewDesignSlugTouched] = useState(false);
  const [editingDesign, setEditingDesign] = useState<Design | null>(null);
  const [variant, setVariant] = useState<VariantDraft>({
    sku: "",
    price: "0",
    costPrice: "0",
    stockQuantity: "0",
    materialId: "",
    sizeId: "",
    fitId: "",
    colorId: "",
    printMethodId: "dtf",
    active: true,
  });
  const [editingVariantId, setEditingVariantId] = useState<number>();
  const [skuTouched, setSkuTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState<"collection" | "design" | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const currentCollection = catalog?.categories.find(
    (item) => item.id === collectionId,
  );
  const designs = useMemo(
    () =>
      catalog?.designs.filter((item) => item.collectionId === collectionId) ??
      [],
    [catalog, collectionId],
  );
  const designVariants = useMemo(
    () =>
      editingDesign
        ? (catalog?.variants.filter(
            (item) => item.designId === editingDesign.id,
          ) ?? [])
        : [],
    [catalog, editingDesign],
  );

  useEffect(() => {
    void adminRequest()
      .then((data) => {
        setCatalog(data);
        const found = data.categories.find((item) => item.id === collectionId);
        if (collectionId && found)
          setCollection({
            nameFa: found.nameFa,
            nameEn: found.nameEn,
            slug: found.slug,
            description: found.description ?? "",
            active: Boolean(found.active),
          });
        setVariant((value) => ({
          ...value,
          materialId: data.materials[0]?.id ?? "",
          sizeId: data.sizes[0]?.id ?? "",
          fitId: data.fits[0]?.id ?? "",
          colorId: data.colors[0]?.id ?? "",
          printMethodId: data.printMethods[0]?.id ?? "dtf",
        }));
      })
      .catch((reason) => {
        if ((reason as Error & { status?: number }).status === 401)
          setUnauthorized(true);
        else
          setError(
            reason instanceof Error ? reason.message : "اطلاعات دریافت نشد.",
          );
      });
  }, [collectionId]);

  function updateCollectionEnglish(value: string) {
    setCollection((item) => ({
      ...item,
      nameEn: value,
      slug: collectionSlugTouched ? item.slug : slugify(value),
    }));
  }
  function updateDesignName(value: string) {
    setDesign((item) => ({
      ...item,
      name: value,
      slug: designSlugTouched ? item.slug : slugify(value),
    }));
  }
  function updateNewDesignName(value: string) {
    setNewDesign((item) => ({
      ...item,
      name: value,
      slug: newDesignSlugTouched ? item.slug : slugify(value),
    }));
  }
  function updateVariant(patch: Partial<VariantDraft>) {
    setVariant((item) => {
      const next = { ...item, ...patch };
      return skuTouched ? next : { ...next, sku: skuFrom(design, next) };
    });
  }

  async function generateDescription(
    kind: "collection" | "design",
    draft?: DesignDraft,
  ) {
    setGenerating(kind);
    setError("");
    try {
      const response = await fetch("/api/admin/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          kind === "collection"
            ? {
                kind,
                nameFa: collection.nameFa,
                nameEn: collection.nameEn,
                current: collection.description,
              }
            : {
                kind,
                name: draft?.name,
                collection: currentCollection?.nameFa,
                current: draft?.description,
              },
        ),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تولید متن انجام نشد.");
      if (kind === "collection")
        setCollection((item) => ({ ...item, description: data.description }));
      else if (draft?.id)
        setDesign((item) => ({ ...item, description: data.description }));
      else setNewDesign((item) => ({ ...item, description: data.description }));
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "تولید متن انجام نشد.",
      );
    } finally {
      setGenerating(null);
    }
  }

  async function saveCollection(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = await adminRequest("/api/admin/catalog", {
        method: collectionId ? "PATCH" : "POST",
        body: JSON.stringify({
          entity: "collection",
          id: collectionId,
          ...collection,
        }),
      });
      setCatalog(data);
      setMessage("کالکشن ذخیره شد.");
      if (!collectionId) {
        const created = data.categories.find(
          (item) => item.slug === collection.slug,
        );
        if (created) router.replace(`/admin/collections/${created.id}`);
      }
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "ذخیره کالکشن انجام نشد.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function uploadArtwork(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "آپلود انجام نشد.");
      return data.key as string;
    } finally {
      setUploading(false);
    }
  }

  async function saveDesign(
    event: FormEvent<HTMLFormElement>,
    draft: DesignDraft,
    createMode = false,
  ) {
    event.preventDefault();
    if (!collectionId) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      let artworkKey = draft.artworkKey;
      const file = new FormData(event.currentTarget).get("artwork");
      if (file instanceof File && file.size)
        artworkKey = await uploadArtwork(file);
      const data = await adminRequest("/api/admin/catalog", {
        method: draft.id ? "PATCH" : "POST",
        body: JSON.stringify({
          entity: "design",
          ...draft,
          artworkKey,
          collectionId,
          basePrice: Number(draft.basePrice),
          baseCost: Number(draft.baseCost),
        }),
      });
      setCatalog(data);
      setMessage(
        draft.id ? "تغییرات طرح ذخیره شد." : "طرح جدید به کالکشن اضافه شد.",
      );
      if (createMode) {
        setNewDesign(emptyDesign);
        setNewDesignSlugTouched(false);
        if (newFileRef.current) newFileRef.current.value = "";
      } else {
        setDesign(emptyDesign);
        setDesignSlugTouched(false);
        setEditingDesign(null);
        if (editFileRef.current) editFileRef.current.value = "";
      }
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "ذخیره طرح انجام نشد.",
      );
    } finally {
      setBusy(false);
    }
  }

  function openDesign(item: Design) {
    const draft = {
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      basePrice: String(item.basePrice),
      baseCost: String(item.baseCost),
      editionLimit: String(item.editionLimit),
      editionIssued: String(item.editionIssued),
      artworkKey: item.artworkKey ?? "",
      placements: item.placements?.split(",").filter(Boolean) ?? ["center"],
      active: Boolean(item.active),
    };
    setEditingDesign(item);
    setDesign(draft);
    setDesignSlugTouched(true);
    setSkuTouched(false);
    setVariant((value) => ({
      ...value,
      sku: skuFrom(draft, value),
      price: String(item.basePrice),
      costPrice: String(item.baseCost),
      stockQuantity: "0",
    }));
  }

  async function saveVariant(event: FormEvent) {
    event.preventDefault();
    if (!editingDesign) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = await adminRequest("/api/admin/catalog", {
        method: editingVariantId ? "PATCH" : "POST",
        body: JSON.stringify({
          entity: "variant",
          id: editingVariantId,
          designId: editingDesign.id,
          ...variant,
          sku: skuTouched ? variant.sku : skuFrom(design, variant),
          price: Number(variant.price),
          costPrice: Number(variant.costPrice),
          stockQuantity: Number(variant.stockQuantity),
        }),
      });
      setCatalog(data);
      setMessage("تنوع محصول ذخیره شد.");
      setEditingVariantId(undefined);
      setSkuTouched(false);
      setVariant((value) => ({
        ...value,
        sku: "",
        price: design.basePrice,
        costPrice: design.baseCost,
        stockQuantity: "0",
      }));
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "ذخیره تنوع انجام نشد.",
      );
    } finally {
      setBusy(false);
    }
  }

  function editVariant(item: Variant) {
    setEditingVariantId(item.id);
    setSkuTouched(true);
    setVariant({
      sku: item.sku,
      price: String(item.price),
      costPrice: String(item.costPrice),
      stockQuantity: String(item.stockQuantity),
      materialId: item.materialId,
      sizeId: item.sizeId,
      fitId: item.fitId,
      colorId: item.colorId,
      printMethodId: item.printMethodId,
      active: Boolean(item.active),
    });
  }
  async function toggle(
    entity: "collection" | "design" | "variant",
    item: typeof currentCollection | Design | Variant,
  ) {
    if (!item) return;
    setBusy(true);
    try {
      const payload =
        entity === "collection"
          ? { entity, ...item, active: !item.active }
          : entity === "design"
            ? {
                entity,
                ...item,
                placements: (item as Design).placements
                  ?.split(",")
                  .filter(Boolean) ?? ["center"],
                active: !item.active,
              }
            : { entity, ...item, active: !item.active };
      setCatalog(
        await adminRequest("/api/admin/catalog", {
          method: "PATCH",
          body: JSON.stringify(payload),
        }),
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "تغییر وضعیت انجام نشد.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove(
    entity: "collection" | "design" | "variant",
    id: number,
  ) {
    if (!confirm("این مورد برای همیشه حذف شود؟")) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = await adminRequest(
        `/api/admin/catalog?entity=${entity}&id=${id}`,
        { method: "DELETE" },
      );
      setCatalog(data);
      setMessage("مورد انتخاب‌شده حذف شد.");
      if (entity === "collection") router.replace("/admin/dashboard");
      if (entity === "design") setEditingDesign(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "حذف انجام نشد.");
    } finally {
      setBusy(false);
    }
  }

  if (unauthorized)
    return (
      <main
        className="grid min-h-screen place-items-center bg-[#f2f1ec]"
        dir="rtl"
      >
        <div className="rounded-3xl bg-white p-8 text-center">
          <h1 className="text-2xl font-black">نشست شما پایان یافته</h1>
          <Link
            href="/admin/login"
            className="mt-5 inline-block rounded-full bg-black px-6 py-3 text-white"
          >
            ورود دوباره
          </Link>
        </div>
      </main>
    );
  if (!catalog)
    return (
      <main className="grid min-h-screen place-items-center bg-[#f2f1ec]">
        <div className="size-10 animate-spin rounded-full border-4 border-black/10 border-t-black" />
      </main>
    );
  if (collectionId && !currentCollection)
    return (
      <main
        className="grid min-h-screen place-items-center bg-[#f2f1ec]"
        dir="rtl"
      >
        <div className="text-center">
          <h1 className="text-3xl font-black">کالکشن پیدا نشد</h1>
          <Link href="/admin/dashboard" className="mt-5 inline-block underline">
            بازگشت
          </Link>
        </div>
      </main>
    );

  const pending = busy || uploading;
  return (
    <main className="min-h-screen bg-[#f2f1ec] pb-24" dir="rtl">
      {pending ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-white/75 backdrop-blur-sm">
          <div className="rounded-3xl bg-black px-8 py-6 text-center text-white shadow-2xl">
            <div className="mx-auto size-9 animate-spin rounded-full border-4 border-white/20 border-t-lime-300" />
            <p className="mt-4 font-bold">
              {uploading ? "در حال آپلود کامل تصویر…" : "در حال ذخیره اطلاعات…"}
            </p>
            <p className="mt-1 text-xs text-white/50">
              لطفاً این صفحه را نبندید
            </p>
          </div>
        </div>
      ) : null}
      <header className="border-b border-black/8 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 md:px-10">
          <div>
            <Link
              href="/admin/dashboard"
              className="text-xs font-bold text-[#668000]"
            >
              ← بازگشت به کالکشن‌ها
            </Link>
            <h1 className="mt-2 text-3xl font-black">
              {collectionId
                ? `ویرایش ${currentCollection?.nameFa}`
                : "ساخت کالکشن جدید"}
            </h1>
          </div>
          <Link
            href="/admin/orders"
            className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-bold"
          >
            سفارش‌ها
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-10">
        {error ? (
          <p className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {message}
          </p>
        ) : null}
        <form
          onSubmit={saveCollection}
          className="rounded-[2rem] bg-white p-6 md:p-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold tracking-widest text-[#668000]">
                COLLECTION
              </p>
              <h2 className="mt-1 text-2xl font-black">اطلاعات کالکشن</h2>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={collection.active}
                onChange={(e) =>
                  setCollection({ ...collection, active: e.target.checked })
                }
              />{" "}
              فعال باشد
            </label>
          </div>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-bold">
              نام فارسی
              <input
                required
                value={collection.nameFa}
                onChange={(e) =>
                  setCollection({ ...collection, nameFa: e.target.value })
                }
                className="mt-2 w-full rounded-xl border border-black/12 bg-[#fafaf8] p-3.5 outline-none focus:border-black"
              />
            </label>
            <label className="text-sm font-bold">
              نام انگلیسی
              <input
                required
                dir="ltr"
                value={collection.nameEn}
                onChange={(e) => updateCollectionEnglish(e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/12 bg-[#fafaf8] p-3.5 text-left outline-none focus:border-black"
              />
            </label>
            <label className="text-sm font-bold md:col-span-2">
              Slug{" "}
              <span className="font-normal text-black/35">
                — خودکار و قابل ویرایش
              </span>
              <div
                className="mt-2 flex overflow-hidden rounded-xl border border-black/12 bg-[#fafaf8]"
                dir="ltr"
              >
                <span className="border-r border-black/10 px-4 py-3.5 text-black/35">
                  /collections/
                </span>
                <input
                  required
                  value={collection.slug}
                  onChange={(e) => {
                    setCollectionSlugTouched(true);
                    setCollection({
                      ...collection,
                      slug: slugify(e.target.value),
                    });
                  }}
                  className="min-w-0 flex-1 bg-transparent px-3 outline-none"
                />
              </div>
            </label>
            <label className="text-sm font-bold md:col-span-2">
              <span className="flex items-center justify-between gap-3">
                <span>توضیحات کالکشن</span>
                <button
                  type="button"
                  disabled={generating !== null}
                  onClick={() => void generateDescription("collection")}
                  className="rounded-full bg-lime-300 px-4 py-2 text-xs text-black disabled:opacity-50"
                >
                  {generating === "collection"
                    ? "در حال نوشتن…"
                    : "✦ پیشنهاد با هوش مصنوعی"}
                </button>
              </span>
              <textarea
                value={collection.description}
                onChange={(e) =>
                  setCollection({ ...collection, description: e.target.value })
                }
                className="mt-2 min-h-32 w-full rounded-xl border border-black/12 bg-[#fafaf8] p-3.5 outline-none focus:border-black"
              />
            </label>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              disabled={pending}
              className="rounded-xl bg-black px-7 py-3.5 font-bold text-white transition hover:bg-lime-300 hover:text-black"
            >
              {collectionId ? "ذخیره تغییرات کالکشن" : "ساخت کالکشن و ادامه"}
            </button>
            {collectionId ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => void remove("collection", collectionId)}
                className="rounded-xl px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
              >
                حذف کالکشن
              </button>
            ) : null}
          </div>
        </form>

        {collectionId ? (
          <section className="mt-8 rounded-[2rem] bg-white p-6 md:p-8">
            <div>
              <p className="text-xs font-bold tracking-widest text-[#668000]">
                ARTWORKS
              </p>
              <h2 className="mt-1 text-2xl font-black">طرح‌های این کالکشن</h2>
              <p className="mt-2 text-sm text-black/45">
                طرح جدید را همین‌جا اضافه کنید؛ برای ویرایش روی هر طرح بزنید.
              </p>
            </div>
            <DesignForm
              design={newDesign}
              setDesign={setNewDesign}
              setSlugTouched={setNewDesignSlugTouched}
              updateName={updateNewDesignName}
              placements={catalog.placements}
              fileRef={newFileRef}
              pending={pending}
              onSubmit={(event) => void saveDesign(event, newDesign, true)}
              createMode
              onGenerate={() => void generateDescription("design", newDesign)}
              generating={generating === "design"}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {designs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openDesign(item)}
                  className="group overflow-hidden rounded-2xl border border-black/8 bg-[#fafaf8] text-right transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] bg-[#eeede7]">
                    {item.artworkKey ? (
                      <Image
                        src={imageUrl(item.artworkKey)}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-contain p-6"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-sm text-black/30">
                        بدون تصویر
                      </div>
                    )}
                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${item.active ? "bg-green-100 text-green-800" : "bg-white text-black/40"}`}
                    >
                      {item.active ? "فعال" : "غیرفعال"}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-black">{item.name}</h3>
                    <p className="mt-2 text-xs text-black/40">
                      {item.basePrice.toLocaleString("fa-IR")} تومان · ویرایش ←
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {editingDesign ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !pending)
              setEditingDesign(null);
          }}
        >
          <div className="mx-auto my-6 max-w-4xl rounded-[2rem] bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#668000]">EDIT ARTWORK</p>
                <h2 className="mt-1 text-2xl font-black">ویرایش طرح</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={pending}
                  onClick={() => void remove("design", editingDesign.id)}
                  className="rounded-full px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
                >
                  حذف طرح
                </button>
                <button
                  disabled={pending}
                  onClick={() => setEditingDesign(null)}
                  className="grid size-11 place-items-center rounded-full bg-black/5 text-xl"
                >
                  ×
                </button>
              </div>
            </div>
            <DesignForm
              design={design}
              setDesign={setDesign}
              setSlugTouched={setDesignSlugTouched}
              updateName={updateDesignName}
              placements={catalog.placements}
              fileRef={editFileRef}
              pending={pending}
              onSubmit={(event) => void saveDesign(event, design)}
              onGenerate={() => void generateDescription("design", design)}
              generating={generating === "design"}
            />
            <div className="mt-8 border-t border-black/10 pt-8">
              <h3 className="text-xl font-black">قیمت و موجودی</h3>
              <p className="mt-1 text-sm text-black/45">
                برای هر ترکیب قابل فروش یک SKU تعریف کنید.
              </p>
              <form onSubmit={saveVariant} className="mt-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <Select
                    label="استایل"
                    value={variant.fitId}
                    onChange={(value) => updateVariant({ fitId: value })}
                    options={catalog.fits.map((x) => [x.id, x.nameFa])}
                  />
                  <Select
                    label="جنس"
                    value={variant.materialId}
                    onChange={(value) => updateVariant({ materialId: value })}
                    options={catalog.materials.map((x) => [x.id, x.nameFa])}
                  />
                  <Select
                    label="سایز"
                    value={variant.sizeId}
                    onChange={(value) => updateVariant({ sizeId: value })}
                    options={catalog.sizes.map((x) => [x.id, x.label])}
                  />
                  <Select
                    label="رنگ"
                    value={variant.colorId}
                    onChange={(value) => updateVariant({ colorId: value })}
                    options={catalog.colors.map((x) => [x.id, x.nameFa])}
                  />
                  <Select
                    label="چاپ"
                    value={variant.printMethodId}
                    onChange={(value) =>
                      updateVariant({ printMethodId: value })
                    }
                    options={catalog.printMethods.map((x) => [x.id, x.nameFa])}
                  />
                </div>
                <label className="mt-4 block text-sm font-bold">
                  SKU{" "}
                  <span className="font-normal text-black/35">
                    — خودکار و قابل ویرایش
                  </span>
                  <input
                    required
                    dir="ltr"
                    value={skuTouched ? variant.sku : skuFrom(design, variant)}
                    onChange={(e) => {
                      setSkuTouched(true);
                      setVariant({
                        ...variant,
                        sku: e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9-]/g, "-"),
                      });
                    }}
                    className="mt-2 w-full rounded-xl border border-black/12 bg-[#fafaf8] p-3 text-left font-mono outline-none focus:border-black"
                  />
                </label>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <label className="rounded-2xl border border-black/10 bg-[#fafaf8] p-4 text-sm font-bold">
                    <span className="text-black/45">قیمت فروش</span>
                    <div className="mt-2 flex items-center">
                      <input
                        required
                        type="number"
                        min="0"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant({ price: e.target.value })
                        }
                        className="min-w-0 flex-1 bg-transparent text-2xl font-black outline-none"
                      />
                      <span className="text-xs text-black/40">تومان</span>
                    </div>
                  </label>
                  <label className="rounded-2xl border border-black/10 bg-[#fafaf8] p-4 text-sm font-bold">
                    <span className="text-black/45">قیمت تمام‌شده</span>
                    <div className="mt-2 flex items-center">
                      <input
                        required
                        type="number"
                        min="0"
                        value={variant.costPrice}
                        onChange={(e) =>
                          updateVariant({ costPrice: e.target.value })
                        }
                        className="min-w-0 flex-1 bg-transparent text-2xl font-black outline-none"
                      />
                      <span className="text-xs text-black/40">تومان</span>
                    </div>
                    <span className="mt-2 block text-xs font-normal text-[#668000]">
                      سود واحد:{" "}
                      {Math.max(
                        0,
                        Number(variant.price) - Number(variant.costPrice),
                      ).toLocaleString("fa-IR")}{" "}
                      تومان
                    </span>
                  </label>
                  <label className="rounded-2xl border border-black/10 bg-[#fafaf8] p-4 text-sm font-bold">
                    <span className="text-black/45">موجودی قابل فروش</span>
                    <div className="mt-2 flex items-center">
                      <input
                        required
                        type="number"
                        min="0"
                        step="1"
                        value={variant.stockQuantity}
                        onChange={(e) =>
                          updateVariant({ stockQuantity: e.target.value })
                        }
                        className="min-w-0 flex-1 bg-transparent text-2xl font-black outline-none"
                      />
                      <span className="text-xs text-black/40">عدد</span>
                    </div>
                  </label>
                </div>
                <button
                  disabled={pending}
                  className="mt-4 rounded-xl bg-black px-6 py-3 font-bold text-white"
                >
                  {editingVariantId ? "ذخیره تغییرات تنوع" : "+ افزودن تنوع"}
                </button>
              </form>
              <div className="mt-5 space-y-2">
                {designVariants.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-black/8 p-3 text-sm"
                  >
                    <code dir="ltr" className="ml-auto font-bold">
                      {item.sku}
                    </code>
                    <span>{item.price.toLocaleString("fa-IR")} تومان</span>
                    <span className="text-[#668000]">
                      سود{" "}
                      {(item.price - item.costPrice).toLocaleString("fa-IR")}
                    </span>
                    <span className="rounded-full bg-black/5 px-2 py-1">
                      {item.stockQuantity} عدد
                    </span>
                    <button
                      onClick={() => editVariant(item)}
                      className="font-bold underline"
                    >
                      ویرایش
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => void toggle("variant", item)}
                      className="underline"
                    >
                      {item.active ? "غیرفعال" : "فعال"}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => void remove("variant", item.id)}
                      className="text-red-700 underline"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="text-xs font-bold text-black/50">
      {label}
      <select
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-black/12 bg-[#fafaf8] p-3 text-sm text-black outline-none"
      >
        <option value="">انتخاب</option>
        {options.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}

function DesignForm({
  design,
  setDesign,
  setSlugTouched,
  updateName,
  placements,
  fileRef,
  pending,
  onSubmit,
  createMode = false,
  onGenerate,
  generating,
}: {
  design: DesignDraft;
  setDesign: (value: DesignDraft) => void;
  setSlugTouched: (value: boolean) => void;
  updateName: (value: string) => void;
  placements: string[];
  fileRef: React.RefObject<HTMLInputElement | null>;
  pending: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  createMode?: boolean;
  onGenerate: () => void;
  generating: boolean;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={`mt-6 ${createMode ? "rounded-2xl border border-dashed border-black/15 bg-[#fafaf8] p-5" : ""}`}
    >
      <h3 className="font-black">
        {createMode ? "+ افزودن طرح جدید" : design.name}
      </h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold">
          نام طرح
          <input
            required
            value={design.name}
            onChange={(e) => updateName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/12 bg-white p-3 outline-none focus:border-black"
          />
        </label>
        <label className="text-sm font-bold">
          Slug خودکار
          <input
            required
            dir="ltr"
            value={design.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setDesign({ ...design, slug: slugify(e.target.value) });
            }}
            className="mt-2 w-full rounded-xl border border-black/12 bg-white p-3 text-left outline-none focus:border-black"
          />
        </label>
        <label className="text-sm font-bold md:col-span-2">
          <span className="flex items-center justify-between gap-3">
            <span>توضیحات طرح</span>
            <button
              type="button"
              disabled={generating}
              onClick={onGenerate}
              className="rounded-full bg-lime-300 px-4 py-2 text-xs text-black disabled:opacity-50"
            >
              {generating ? "در حال نوشتن…" : "✦ پیشنهاد با هوش مصنوعی"}
            </button>
          </span>
          <textarea
            value={design.description}
            onChange={(e) =>
              setDesign({ ...design, description: e.target.value })
            }
            className="mt-2 min-h-24 w-full rounded-xl border border-black/12 bg-white p-3 outline-none focus:border-black"
          />
        </label>
        <label className="rounded-xl border border-dashed border-black/15 bg-white p-4 text-sm font-bold">
          تصویر طرح
          <input
            ref={fileRef}
            name="artwork"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            required={!design.artworkKey}
            className="mt-2 block w-full text-xs font-normal"
          />
          {design.artworkKey ? (
            <span className="mt-2 block text-xs font-normal text-green-700">
              تصویر فعلی حفظ می‌شود مگر فایل جدید انتخاب کنید.
            </span>
          ) : null}
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-bold">
            قیمت فروش پایه
            <input
              required
              type="number"
              min="0"
              value={design.basePrice}
              onChange={(e) =>
                setDesign({ ...design, basePrice: e.target.value })
              }
              className="mt-2 w-full rounded-xl border border-black/12 bg-white p-3 outline-none focus:border-black"
            />
          </label>
          <label className="text-sm font-bold">
            قیمت تمام‌شده پایه
            <input
              required
              type="number"
              min="0"
              value={design.baseCost}
              onChange={(e) =>
                setDesign({ ...design, baseCost: e.target.value })
              }
              className="mt-2 w-full rounded-xl border border-black/12 bg-white p-3 outline-none focus:border-black"
            />
            <span className="mt-2 block text-xs font-normal leading-5 text-black/45">
              هزینه تولید یک تیشرت سفارشی؛ برای محاسبه سود در حسابداری استفاده
              می‌شود.
            </span>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:col-span-2">
          <label className="text-sm font-bold">
            تعداد کل نسخه محدود
            <input
              required
              type="number"
              min="0"
              value={design.editionLimit}
              onChange={(e) =>
                setDesign({ ...design, editionLimit: e.target.value })
              }
              className="mt-2 w-full rounded-xl border border-black/12 bg-white p-3 outline-none focus:border-black"
            />
            <span className="mt-2 block text-xs font-normal text-black/45">
              صفر یعنی بدون شماره‌گذاری محدود.
            </span>
          </label>
          <label className="text-sm font-bold">
            تعداد نسخه‌های چاپ‌شده قبلی
            <input
              required
              type="number"
              min="0"
              value={design.editionIssued}
              onChange={(e) =>
                setDesign({ ...design, editionIssued: e.target.value })
              }
              className="mt-2 w-full rounded-xl border border-black/12 bg-white p-3 outline-none focus:border-black"
            />
            <span className="mt-2 block text-xs font-normal text-black/45">
              قابل ویرایش؛ سفارش بعدی از شماره بعد از این مقدار شروع می‌شود.
            </span>
          </label>
        </div>
      </div>
      <fieldset className="mt-4">
        <legend className="text-sm font-bold">جانمایی‌های مجاز</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {placements.map((item) => (
            <label
              key={item}
              className={`rounded-full border px-3 py-2 text-xs ${design.placements.includes(item) ? "border-black bg-black text-white" : "border-black/10 bg-white"}`}
            >
              <input
                className="sr-only"
                type="checkbox"
                checked={design.placements.includes(item)}
                onChange={(e) =>
                  setDesign({
                    ...design,
                    placements: e.target.checked
                      ? [...design.placements, item]
                      : design.placements.filter((x) => x !== item),
                  })
                }
              />
              {placementLabels[item] ?? item}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={design.active}
          onChange={(e) => setDesign({ ...design, active: e.target.checked })}
        />{" "}
        طرح فعال باشد
      </label>
      <button
        disabled={pending}
        className="mt-5 rounded-xl bg-black px-6 py-3 font-bold text-white disabled:opacity-50"
      >
        {pending
          ? "در حال تکمیل…"
          : createMode
            ? "آپلود و افزودن طرح"
            : "ذخیره تغییرات طرح"}
      </button>
    </form>
  );
}

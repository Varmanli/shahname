"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiEdit3,
  FiImage,
  FiLoader,
  FiMonitor,
  FiPlus,
  FiSave,
  FiSliders,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  AdminField,
  AdminSelect,
  AdminTextarea,
  AdminTextInput,
} from "@/components/admin/admin-form-controls";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { cn } from "@/lib/utils";
import type {
  HomeHeroContentPosition,
  HomeHeroSlide,
} from "@/types/home-hero-slide";

type HomeHeroSlidesSettingsProps = {
  initialSlides: HomeHeroSlide[];
};

type SlideFormState = {
  title: string;
  subtitle: string;
  image: string;
  primaryButtonLabel: string;
  primaryButtonHref: string;
  secondaryButtonLabel: string;
  secondaryButtonHref: string;
  contentPosition: HomeHeroContentPosition;
  order: string;
  isActive: boolean;
};

const contentPositionOptions = [
  { label: "محتوای سمت راست", value: "right" },
  { label: "محتوای سمت چپ", value: "left" },
];

const toFaNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

function sortSlides(slides: HomeHeroSlide[]) {
  return [...slides].sort((a, b) => a.order - b.order);
}

function createEmptyForm(nextOrder: number): SlideFormState {
  return {
    title: "",
    subtitle: "",
    image: "",
    primaryButtonLabel: "",
    primaryButtonHref: "",
    secondaryButtonLabel: "",
    secondaryButtonHref: "",
    contentPosition: "right",
    order: String(nextOrder),
    isActive: true,
  };
}

function createFormFromSlide(slide: HomeHeroSlide): SlideFormState {
  return {
    title: slide.title,
    subtitle: slide.subtitle,
    image: slide.image,
    primaryButtonLabel: slide.primaryButtonLabel,
    primaryButtonHref: slide.primaryButtonHref,
    secondaryButtonLabel: slide.secondaryButtonLabel,
    secondaryButtonHref: slide.secondaryButtonHref,
    contentPosition: slide.contentPosition,
    order: String(slide.order),
    isActive: slide.isActive,
  };
}

function isSuccessStatus(message: string) {
  return (
    message.includes("ذخیره") ||
    message.includes("ایجاد") ||
    message.includes("ویرایش") ||
    message.includes("حذف") ||
    message.includes("آپلود")
  );
}

function getUploadedImageUrl(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";

  const data = payload as {
    file?: { url?: unknown };
    imageUrl?: unknown;
    path?: unknown;
    url?: unknown;
  };

  if (typeof data.url === "string" && data.url.trim()) {
    return data.url.trim();
  }

  if (typeof data.imageUrl === "string" && data.imageUrl.trim()) {
    return data.imageUrl.trim();
  }

  if (typeof data.path === "string" && data.path.trim()) {
    return data.path.trim();
  }

  if (
    data.file &&
    typeof data.file === "object" &&
    typeof data.file.url === "string" &&
    data.file.url.trim()
  ) {
    return data.file.url.trim();
  }

  return "";
}

export function HomeHeroSlidesSettings({
  initialSlides,
}: HomeHeroSlidesSettingsProps) {
  const [slides, setSlides] = useState(() => sortSlides(initialSlides));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SlideFormState>(() =>
    createEmptyForm(initialSlides.length + 1),
  );
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const activeSlidesCount = useMemo(
    () => slides.filter((slide) => slide.isActive).length,
    [slides],
  );

  function resetForm(nextSlides = slides) {
    setEditingId(null);
    setForm(createEmptyForm(nextSlides.length + 1));
  }

  function updateField<K extends keyof SlideFormState>(
    field: K,
    value: SlideFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleImageUpload(file: File | null) {
    if (!file) {
      updateField("image", "");
      return;
    }

    setIsUploadingImage(true);
    setStatus("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();
      const imageUrl = getUploadedImageUrl(payload);

      if (!response.ok || !imageUrl) {
        throw new Error(payload.message ?? "آپلود تصویر با خطا روبه‌رو شد.");
      }

      updateField("image", imageUrl);
      setStatus("تصویر اسلاید آپلود شد.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "آپلود تصویر با خطا روبه‌رو شد.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setStatus("");

    const method = editingId ? "PUT" : "POST";
    const endpoint = editingId
      ? `/api/admin/home-hero-slides/${editingId}`
      : "/api/admin/home-hero-slides";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          order: Number(form.order),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? "ذخیره اسلاید با خطا روبه‌رو شد.");
      }

      const nextSlide = (payload.slide ?? null) as HomeHeroSlide | null;

      const nextSlides = sortSlides(
        editingId
          ? slides.map((slide) =>
              slide.id === editingId && nextSlide ? nextSlide : slide,
            )
          : nextSlide
            ? [...slides, nextSlide]
            : slides,
      );

      setSlides(nextSlides);
      resetForm(nextSlides);
      setStatus(editingId ? "اسلاید ویرایش شد." : "اسلاید جدید ایجاد شد.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "ذخیره اسلاید با خطا روبه‌رو شد.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit(slide: HomeHeroSlide) {
    setEditingId(slide.id);
    setForm(createFormFromSlide(slide));
    setStatus("");
  }

  async function handleDelete(slide: HomeHeroSlide) {
    const confirmed = window.confirm(`اسلاید «${slide.title}» حذف شود؟`);
    if (!confirmed) return;

    setStatus("");

    try {
      const response = await fetch(`/api/admin/home-hero-slides/${slide.id}`, {
        method: "DELETE",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? "حذف اسلاید با خطا روبه‌رو شد.");
      }

      const nextSlides = slides.filter((item) => item.id !== slide.id);
      setSlides(nextSlides);

      if (editingId === slide.id) {
        resetForm(nextSlides);
      }

      setStatus("اسلاید حذف شد.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "حذف اسلاید با خطا روبه‌رو شد.",
      );
    }
  }

  return (
    <section className="relative overflow-visible rounded-[1.8rem] border border-shah-gold-500/14 bg-white/72 p-4 text-card-foreground shadow-xl shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5 md:p-5">
      <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-shah-gold-500/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-12 size-72 rounded-full bg-shah-lapis-500/8 blur-3xl" />

      <div className="relative grid gap-5">
        <HeroSettingsHeader
          activeSlidesCount={activeSlidesCount}
          slidesCount={slides.length}
        />

        {status ? <StatusMessage message={status} /> : null}

        <div className="grid gap-5 xl:grid-cols-[24rem_minmax(0,1fr)] xl:items-start">
          <aside className="grid gap-4 xl:sticky xl:top-24">
            <SlideFormPanel
              editingId={editingId}
              form={form}
              isSaving={isSaving}
              isUploadingImage={isUploadingImage}
              onCancel={() => resetForm()}
              onFieldChange={updateField}
              onImageUpload={handleImageUpload}
              onSave={handleSave}
            />
          </aside>

          <section className="grid gap-4">
            <div className="rounded-[1.55rem] border border-shah-gold-500/14 bg-white/62 p-4 shadow-xl shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4 md:p-5">
              <SectionTitle
                eyebrow="Preview"
                title="پیش‌نمایش زنده اسلاید"
                description="این نما با هر تغییر فرم، بنر، دکمه‌ها و جایگاه محتوا را به‌صورت زنده به‌روزرسانی می‌کند."
              />

              <div className="mt-4">
                <HeroSlidePreview form={form} />
              </div>
            </div>

            <div className="grid gap-4">
              <SectionTitle
                eyebrow="Slides"
                title="اسلایدهای ساخته‌شده"
                description="ترتیب، وضعیت و کارت‌های ذخیره‌شده هدر صفحه اصلی."
              />

              {slides.length ? (
                <div className="grid gap-3">
                  {slides.map((slide) => (
                    <HeroSlideCard
                      key={slide.id}
                      active={slide.isActive}
                      editing={editingId === slide.id}
                      slide={slide}
                      onDelete={() => handleDelete(slide)}
                      onEdit={() => handleEdit(slide)}
                    />
                  ))}
                </div>
              ) : (
                <EmptySlides />
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function HeroSettingsHeader({
  activeSlidesCount,
  slidesCount,
}: {
  activeSlidesCount: number;
  slidesCount: number;
}) {
  return (
    <header className="relative overflow-hidden rounded-[1.65rem] border border-white/10 bg-shah-lapis-950 p-5 text-white shadow-xl shadow-shah-lapis-950/18 md:p-6">
      <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-shah-gold-400/18 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-10 size-72 rounded-full bg-blue-500/16 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-shah-gold-200">
            <FiMonitor aria-hidden className="size-3.5" />
            Hero Slider
          </div>

          <h2 className="mt-3 text-2xl font-black md:text-3xl">
            اسلایدر هدر صفحه اصلی
          </h2>

          <p className="mt-2 max-w-2xl text-xs font-bold leading-6 text-white/62 md:text-sm">
            بنرها، متن‌ها، دکمه‌ها، جایگاه محتوا و وضعیت نمایش اسلایدهای صفحه
            اصلی را مدیریت کن.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:w-72">
          <HeroStat label="کل اسلایدها" value={slidesCount} />
          <HeroStat label="فعال" value={activeSlidesCount} />
        </div>
      </div>
    </header>
  );
}

function SlideFormPanel({
  editingId,
  form,
  isSaving,
  isUploadingImage,
  onCancel,
  onFieldChange,
  onImageUpload,
  onSave,
}: {
  editingId: string | null;
  form: SlideFormState;
  isSaving: boolean;
  isUploadingImage: boolean;
  onCancel: () => void;
  onFieldChange: <K extends keyof SlideFormState>(
    field: K,
    value: SlideFormState[K],
  ) => void;
  onImageUpload: (file: File | null) => void;
  onSave: () => void;
}) {
  return (
    <section className="overflow-visible rounded-[1.55rem] border border-shah-gold-500/14 bg-white/62 p-4 shadow-xl shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-shah-gold-800 dark:text-shah-gold-200">
            {editingId ? "Edit Slide" : "New Slide"}
          </p>

          <h3 className="mt-2 text-lg font-black text-foreground">
            {editingId ? "ویرایش اسلاید" : "ایجاد اسلاید جدید"}
          </h3>
        </div>

        {editingId ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-shah-gold-500/12 bg-white/70 px-3 text-xs font-black text-foreground transition hover:bg-shah-gold-500/10 dark:border-white/10 dark:bg-white/4.5"
          >
            <FiX aria-hidden className="size-3.5" />
            انصراف
          </button>
        ) : null}
      </div>

      <div className="grid gap-4">
        <div className="rounded-2xl border border-shah-gold-500/12 bg-white/48 p-3 dark:border-white/8 dark:bg-black/12">
          <AdminImageUpload
            label="بنر اسلاید"
            required
            preview={form.image}
            ratioClass="aspect-[16/7]"
            onChange={onImageUpload}
            onRemove={() => onFieldChange("image", "")}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-1">
          <AdminField label="عنوان اسلاید" required>
            <AdminTextInput
              value={form.title}
              onChange={(event) => onFieldChange("title", event.target.value)}
              placeholder="مثلاً روایت‌های شاهنامه"
            />
          </AdminField>

          <AdminField label="ترتیب نمایش" required>
            <AdminTextInput
              inputMode="numeric"
              value={form.order}
              onChange={(event) => onFieldChange("order", event.target.value)}
              placeholder="مثلاً ۱"
            />
          </AdminField>
        </div>

        <AdminField label="زیرعنوان" required>
          <AdminTextarea
            className="min-h-24 resize-y py-3 text-sm leading-7"
            value={form.subtitle}
            onChange={(event) => onFieldChange("subtitle", event.target.value)}
            placeholder="متن کوتاه و جذاب برای نمایش روی بنر..."
          />
        </AdminField>

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-1">
          <AdminField label="متن دکمه اصلی" required>
            <AdminTextInput
              value={form.primaryButtonLabel}
              onChange={(event) =>
                onFieldChange("primaryButtonLabel", event.target.value)
              }
              placeholder="شروع مطالعه"
            />
          </AdminField>

          <AdminField label="لینک دکمه اصلی" required>
            <AdminTextInput
              dir="ltr"
              value={form.primaryButtonHref}
              onChange={(event) =>
                onFieldChange("primaryButtonHref", event.target.value)
              }
              placeholder="/stories"
            />
          </AdminField>
        </div>

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-1">
          <AdminField label="متن دکمه دوم">
            <AdminTextInput
              value={form.secondaryButtonLabel}
              onChange={(event) =>
                onFieldChange("secondaryButtonLabel", event.target.value)
              }
              placeholder="مشاهده شخصیت‌ها"
            />
          </AdminField>

          <AdminField label="لینک دکمه دوم">
            <AdminTextInput
              dir="ltr"
              value={form.secondaryButtonHref}
              onChange={(event) =>
                onFieldChange("secondaryButtonHref", event.target.value)
              }
              placeholder="/characters"
            />
          </AdminField>
        </div>

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-1">
          <AdminField label="موقعیت محتوا" required>
            <AdminSelect
              value={form.contentPosition}
              onChange={(value) =>
                onFieldChange(
                  "contentPosition",
                  value as HomeHeroContentPosition,
                )
              }
              options={contentPositionOptions}
              placeholder="موقعیت را انتخاب کن"
            />
          </AdminField>

          <ActiveToggle
            active={form.isActive}
            onToggle={() => onFieldChange("isActive", !form.isActive)}
          />
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || isUploadingImage}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-black shadow-lg transition active:scale-95",
            isSaving || isUploadingImage
              ? "cursor-not-allowed bg-shah-lapis-900/55 text-white/65"
              : "bg-shah-lapis-900 text-shah-gold-100 shadow-shah-lapis-900/15 hover:-translate-y-0.5 hover:bg-shah-lapis-800 hover:text-white dark:bg-shah-gold-500 dark:text-shah-black-950 dark:hover:bg-shah-gold-400",
          )}
        >
          {isUploadingImage ? (
            <FiLoader aria-hidden className="size-4 animate-spin" />
          ) : editingId ? (
            <FiSave aria-hidden className="size-4" />
          ) : (
            <FiPlus aria-hidden className="size-4" />
          )}

          {isUploadingImage
            ? "در حال آپلود تصویر..."
            : isSaving
              ? "در حال ذخیره..."
              : editingId
                ? "ذخیره تغییرات"
                : "ایجاد اسلاید"}
        </button>
      </div>
    </section>
  );
}

function HeroSlideCard({
  active,
  editing,
  slide,
  onDelete,
  onEdit,
}: {
  active: boolean;
  editing: boolean;
  slide: HomeHeroSlide;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[1.55rem] border bg-white/64 shadow-xl shadow-shah-black-900/5 backdrop-blur-xl transition hover:-translate-y-0.5 dark:bg-white/4",
        editing
          ? "border-shah-gold-500/45 ring-4 ring-shah-gold-500/10"
          : "border-shah-gold-500/12 hover:border-shah-gold-500/28 dark:border-white/10",
      )}
    >
      <div className="grid gap-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="relative aspect-16/8 overflow-hidden bg-shah-lapis-950 lg:aspect-auto lg:min-h-44">
          {slide.image ? (
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              sizes="(min-width: 1280px) 22rem, 100vw"
              className="object-cover transition duration-500 group-hover:scale-105"
              unoptimized={slide.image.startsWith("/uploads/")}
            />
          ) : (
            <div className="grid h-full place-items-center text-shah-gold-200">
              <FiImage aria-hidden className="size-6" />
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/12 to-transparent" />

          <div className="absolute right-3 top-3 flex flex-wrap gap-2">
            <Badge tone={active ? "green" : "muted"}>
              {active ? "فعال" : "غیرفعال"}
            </Badge>

            <Badge tone="gold">#{toFaNumber(slide.order)}</Badge>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-4 p-4">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge tone="muted">
                {slide.contentPosition === "right"
                  ? "محتوا سمت راست"
                  : "محتوا سمت چپ"}
              </Badge>

              {editing ? <Badge tone="gold">در حال ویرایش</Badge> : null}
            </div>

            <h3 className="line-clamp-1 text-lg font-black text-foreground">
              {slide.title || "بدون عنوان"}
            </h3>

            <p className="mt-2 line-clamp-2 text-xs font-bold leading-6 text-muted-foreground">
              {slide.subtitle || "زیرعنوانی برای این اسلاید ثبت نشده است."}
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <ButtonPreview
                label={slide.primaryButtonLabel || "دکمه اصلی"}
                href={slide.primaryButtonHref}
              />

              {slide.secondaryButtonLabel ? (
                <ButtonPreview
                  label={slide.secondaryButtonLabel}
                  href={slide.secondaryButtonHref}
                  muted
                />
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-shah-gold-500/10 pt-3 dark:border-white/8">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-shah-gold-500/12 bg-shah-gold-500/8 px-3 text-xs font-black text-shah-gold-800 transition hover:bg-shah-gold-500 hover:text-shah-black-950 dark:border-shah-gold-300/12 dark:text-shah-gold-100"
            >
              <FiEdit3 aria-hidden className="size-3.5" />
              ویرایش
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-red-500/16 bg-red-500/8 px-3 text-xs font-black text-red-600 transition hover:bg-red-500 hover:text-white dark:border-red-400/16 dark:text-red-200"
            >
              <FiTrash2 aria-hidden className="size-3.5" />
              حذف
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function HeroSlidePreview({ form }: { form: SlideFormState }) {
  return (
    <div className="relative min-h-90 overflow-hidden rounded-[1.45rem] border border-shah-gold-500/12 bg-shah-black-950 p-5 text-white md:min-h-105 md:p-7">
      <div className="absolute inset-0 bg-linear-to-br from-shah-lapis-950 via-shah-black-950 to-shah-black-900" />

      {form.image ? (
        <Image
          src={form.image}
          alt={form.title || "پیش‌نمایش اسلاید"}
          fill
          sizes="(min-width: 1280px) 60vw, 100vw"
          className="object-cover opacity-50"
          unoptimized={form.image.startsWith("/uploads/")}
        />
      ) : null}

      <div className="absolute inset-0 bg-linear-to-t from-black/82 via-black/45 to-black/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,134,11,0.22),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(26,62,141,0.18),transparent_30%)]" />

      <div
        className={cn(
          "relative z-10 flex h-full flex-col justify-end text-right",
          form.contentPosition === "right"
            ? "mr-auto max-w-xl"
            : "ml-auto max-w-xl",
        )}
      >
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] font-black text-shah-gold-200 backdrop-blur-xl">
          <span className="size-1.5 rounded-full bg-shah-gold-400" />
          {form.isActive ? "اسلاید فعال" : "اسلاید غیرفعال"}
        </div>

        <p className="mt-4 line-clamp-3 text-2xl font-black leading-tight text-white md:text-4xl">
          {form.title || "عنوان اسلاید"}
        </p>

        <p className="mt-3 line-clamp-4 max-w-2xl text-sm font-medium leading-7 text-white/80 md:text-base md:leading-8">
          {form.subtitle || "زیرعنوان اسلاید در این بخش نمایش داده می‌شود."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex h-10 items-center rounded-xl bg-shah-gold-500 px-4 text-sm font-black text-shah-black-950 shadow-[0_12px_30px_rgba(184,134,11,0.22)]">
            {form.primaryButtonLabel || "دکمه اصلی"}
          </span>

          {form.secondaryButtonLabel ? (
            <span className="inline-flex h-10 items-center rounded-xl border border-white/18 bg-white/8 px-4 text-sm font-black text-white backdrop-blur-xl">
              {form.secondaryButtonLabel}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ActiveToggle({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="grid gap-1.5 text-[13px] font-bold text-foreground">
      <span>وضعیت نمایش</span>

      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex h-11 items-center justify-between rounded-xl border px-3.5 text-[13px] font-black transition",
          active
            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
            : "border-shah-gold-500/16 bg-white/80 text-muted-foreground dark:border-white/10 dark:bg-white/4.5",
        )}
      >
        <span>{active ? "فعال" : "غیرفعال"}</span>

        {active ? (
          <FiCheckCircle aria-hidden className="size-4" />
        ) : (
          <span className="size-2 rounded-full bg-current opacity-50" />
        )}
      </button>
    </label>
  );
}

function ButtonPreview({
  href,
  label,
  muted,
}: {
  href: string;
  label: string;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border px-3 py-2",
        muted
          ? "border-white/10 bg-muted/40"
          : "border-shah-gold-500/12 bg-shah-gold-500/8",
      )}
    >
      <p className="truncate text-xs font-black text-foreground">{label}</p>
      <p
        className="mt-0.5 truncate text-[11px] font-bold text-muted-foreground"
        dir="ltr"
      >
        {href || "بدون لینک"}
      </p>
    </div>
  );
}

function SectionTitle({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-shah-gold-800 dark:text-shah-gold-200">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-lg font-black text-foreground">{title}</h3>
      <p className="mt-1 text-xs font-bold leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function EmptySlides() {
  return (
    <div className="rounded-[1.55rem] border border-dashed border-shah-gold-500/20 bg-white/55 px-5 py-12 text-center shadow-inner shadow-white/20 dark:border-white/10 dark:bg-white/3">
      <div className="mx-auto grid size-14 place-items-center rounded-3xl border border-shah-gold-500/14 bg-shah-gold-500/10 text-shah-gold-800 dark:text-shah-gold-200">
        <FiSliders aria-hidden className="size-6" />
      </div>

      <p className="mt-4 text-sm font-black text-foreground">
        هنوز اسلایدی برای هدر ساخته نشده است
      </p>

      <p className="mx-auto mt-2 max-w-sm text-xs font-bold leading-6 text-muted-foreground">
        اولین اسلاید را از فرم سمت چپ ایجاد کن تا در هدر صفحه اصلی نمایش داده
        شود.
      </p>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-xl">
      <p className="text-[11px] font-bold text-white/48">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{toFaNumber(value)}</p>
    </div>
  );
}

function StatusMessage({ message }: { message: string }) {
  const success = isSuccessStatus(message);

  return (
    <div
      className={cn(
        "rounded-[1.25rem] border px-4 py-3 text-sm font-black leading-7 shadow-lg",
        success
          ? "border-emerald-500/18 bg-emerald-500/10 text-emerald-700 shadow-emerald-950/5 dark:text-emerald-200"
          : "border-red-500/18 bg-red-50/90 text-red-700 shadow-red-950/5 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-200",
      )}
    >
      {message}
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "gold" | "green" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-[10px] font-black backdrop-blur-xl",
        tone === "gold" &&
          "border border-shah-gold-500/20 bg-shah-gold-500/14 text-shah-gold-100",
        tone === "green" &&
          "border border-emerald-400/20 bg-emerald-500/14 text-emerald-100",
        tone === "muted" && "border border-white/12 bg-black/26 text-white/78",
      )}
    >
      {children}
    </span>
  );
}

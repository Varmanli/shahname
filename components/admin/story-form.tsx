"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

import {
  AdminField,
  AdminTextInput,
  AdminTextarea,
} from "@/components/admin/admin-form-controls";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type { Character } from "@/types/character";
import type {
  Story,
  StoryCharacterReference,
  StorySection,
} from "@/types/story";

type StoryFormProps = {
  characters: Character[];
  story?: Story;
};

type StorySectionForm = StorySection & {
  imageFile: File | null;
  imagePreview: string;
  imageRemoved: boolean;
};

type StoryFormState = {
  title: string;
  subtitle: string;
  shortDescription: string;
  sections: StorySectionForm[];
  characters: StoryCharacterReference[];
  coverImageFile: File | null;
  coverImagePreview: string;
  coverImageRemoved: boolean;
  quote: string;
  order: string;
};

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toSectionForm(section: StorySection): StorySectionForm {
  return {
    ...section,
    imageFile: null,
    imagePreview: section.image ?? "",
    imageRemoved: false,
  };
}

function newSection(): StorySectionForm {
  return {
    id: crypto.randomUUID(),
    title: "",
    content: "",
    image: "",
    imageFile: null,
    imagePreview: "",
    imageRemoved: false,
  };
}

function getCharacterImage(character?: Character) {
  return character?.portraitImage?.trim() || character?.sceneImage?.trim() || "";
}

const toFaNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

function createInitialForm(story?: Story): StoryFormState {
  return {
    title: story?.title ?? "",
    subtitle: story?.subtitle ?? "",
    shortDescription: story?.shortDescription ?? "",
    sections: story?.sections.length
      ? story.sections.map(toSectionForm)
      : [newSection()],
    characters: story?.characters ?? [],
    coverImageFile: null,
    coverImagePreview: story?.coverImage ?? "",
    coverImageRemoved: false,
    quote: story?.quote ?? "",
    order: String(story?.order ?? 0),
  };
}

export function StoryForm({ characters, story }: StoryFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<StoryFormState>(() => createInitialForm(story));
  const [characterQuery, setCharacterQuery] = useState("");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const coverObjectUrl = useRef("");

  const charactersBySlug = useMemo(
    () => new Map(characters.map((character) => [character.slug, character])),
    [characters],
  );

  const selectedCharacters = useMemo(
    () =>
      form.characters.map((reference) => ({
        reference,
        character: charactersBySlug.get(reference.slug),
      })),
    [charactersBySlug, form.characters],
  );

  const filteredCharacters = useMemo(() => {
    const normalizedQuery = characterQuery.trim().toLowerCase();
    const selectedSlugs = new Set(form.characters.map((item) => item.slug));

    return characters
      .filter((character) => !selectedSlugs.has(character.slug))
      .filter((character) => {
        if (!normalizedQuery) return true;

        return [
          character.name,
          character.slug,
          character.title,
          character.role,
          character.dynasty,
          ...character.epithets,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [characterQuery, characters, form.characters]);
  const formModeText = story ? "ویرایش داستان" : "ایجاد داستان جدید";

  function updateField(
    field: "title" | "subtitle" | "shortDescription" | "quote" | "order",
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateCover(file: File | null) {
    if (coverObjectUrl.current) {
      URL.revokeObjectURL(coverObjectUrl.current);
      coverObjectUrl.current = "";
    }

    if (!file) {
      setForm((current) => ({
        ...current,
        coverImageFile: null,
        coverImagePreview: "",
      }));
      return;
    }

    const preview = URL.createObjectURL(file);
    coverObjectUrl.current = preview;
    setForm((current) => ({
      ...current,
      coverImageFile: file,
      coverImagePreview: preview,
      coverImageRemoved: false,
    }));
  }

  function removeCover() {
    if (coverObjectUrl.current) {
      URL.revokeObjectURL(coverObjectUrl.current);
      coverObjectUrl.current = "";
    }

    setForm((current) => ({
      ...current,
      coverImageFile: null,
      coverImagePreview: "",
      coverImageRemoved: true,
    }));
  }

  function updateSection(id: string, field: "title" | "content", value: string) {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section,
      ),
    }));
  }

  function updateSectionImage(id: string, file: File | null) {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== id) return section;

        if (section.imagePreview.startsWith("blob:")) {
          URL.revokeObjectURL(section.imagePreview);
        }

        if (!file) {
          return {
            ...section,
            imageFile: null,
            imagePreview: "",
            image: "",
          };
        }

        return {
          ...section,
          imageFile: file,
          imagePreview: URL.createObjectURL(file),
          imageRemoved: false,
        };
      }),
    }));
  }

  function removeSectionImage(id: string) {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== id) return section;

        if (section.imagePreview.startsWith("blob:")) {
          URL.revokeObjectURL(section.imagePreview);
        }

        return {
          ...section,
          image: "",
          imageFile: null,
          imagePreview: "",
          imageRemoved: true,
        };
      }),
    }));
  }

  function addCharacter(character: Character) {
    setForm((current) => {
      const exists = current.characters.some((item) => item.slug === character.slug);
      if (exists) return current;

      return {
        ...current,
        characters: [
          ...current.characters,
          { name: character.name, slug: character.slug },
        ],
      };
    });
    setCharacterQuery("");
  }

  function removeCharacter(slug: string) {
    setForm((current) => ({
      ...current,
      characters: current.characters.filter((item) => item.slug !== slug),
    }));
  }

  function buildFormData() {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("slug", createSlug(form.title));
    formData.append("subtitle", form.subtitle);
    formData.append("shortDescription", form.shortDescription);
    formData.append("content", "");
    formData.append(
      "sections",
      JSON.stringify(
        form.sections.map(
          ({ content, id, image, imageRemoved, imagePreview, title }) => ({
            id,
            title,
            content,
            image: imageRemoved ? "" : image || imagePreview || "",
          }),
        ),
      ),
    );
    formData.append("characters", JSON.stringify(form.characters));
    formData.append("existingScenes", "[]");
    formData.append("quote", form.quote);
    formData.append("order", form.order);

    if (form.coverImageFile) formData.append("coverImage", form.coverImageFile);
    if (form.coverImagePreview && !form.coverImagePreview.startsWith("blob:")) {
      formData.append("coverImageUrl", form.coverImagePreview);
    }
    if (form.coverImageRemoved) formData.append("removeCoverImage", "true");
    for (const section of form.sections) {
      if (section.imageFile) {
        formData.append(`sectionImage:${section.id}`, section.imageFile);
      }
    }

    return formData;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("");

    const response = await fetch(story ? `/api/stories/${story.id}` : "/api/stories", {
      method: story ? "PUT" : "POST",
      body: buildFormData(),
    });
    const payload = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setStatus(payload.message ?? "ذخیره داستان با خطا روبه‌رو شد.");
      return;
    }

    router.push("/admin/stories");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 pb-28" dir="rtl">
      {status ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700 shadow-sm dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {status}
        </div>
      ) : null}

      <FormSection
        eyebrow="گام ۱"
        title="اطلاعات اصلی"
        description="عنوان، زیرعنوان، خلاصه و جایگاه زمانی داستان را ثبت کنید. این اطلاعات در کارت‌ها و صفحه جزئیات نمایش داده می‌شود."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="عنوان داستان" required>
            <AdminTextInput
              placeholder="مثلاً رستم و سهراب"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </AdminField>
          <AdminField label="زیرعنوان" required>
            <AdminTextInput
              placeholder="یک جمله کوتاه برای معرفی حال‌وهوای روایت"
              value={form.subtitle}
              onChange={(event) => updateField("subtitle", event.target.value)}
            />
          </AdminField>
          <AdminField label="ترتیب زمانی">
            <AdminTextInput
              type="number"
              placeholder="مثلاً ۱۰"
              value={form.order}
              onChange={(event) => updateField("order", event.target.value)}
            />
          </AdminField>
          <div className="md:col-span-2">
            <AdminField label="خلاصه کوتاه" required>
              <AdminTextarea
                className="min-h-36 leading-8"
                placeholder="خلاصه‌ای خوانا برای نمایش در آرشیو و مقدمه صفحه داستان..."
                value={form.shortDescription}
                onChange={(event) =>
                  updateField("shortDescription", event.target.value)
                }
              />
            </AdminField>
          </div>
        </div>
      </FormSection>

      <FormSection
        eyebrow="گام ۲"
        title="بخش‌های داستان"
        description="داستان را به بخش‌های قابل خواندن تقسیم کنید. هر بخش می‌تواند عنوان، متن و تصویر مستقل داشته باشد."
      >
        <div className="grid gap-5">
          {form.sections.map((section, index) => (
            <div
              key={section.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-shah-gold-500/30"
            >
              <div className="flex flex-col gap-4 border-b border-border bg-muted/25 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-shah-lapis-700 text-sm font-black text-white shadow-sm">
                    {toFaNumber(index + 1)}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black text-foreground">
                      {section.title.trim() || "هنوز عنوانی وارد نشده"}
                    </h3>
                    <p className="mt-1 text-xs font-bold text-muted-foreground">
                      بخش {toFaNumber(index + 1)} از {toFaNumber(form.sections.length)}
                    </p>
                  </div>
                </div>
                {form.sections.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        sections: current.sections.filter(
                          (item) => item.id !== section.id,
                        ),
                      }))
                    }
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-black text-red-700 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/25 dark:text-red-200 dark:hover:bg-red-950/45"
                  >
                    حذف
                  </button>
                ) : null}
              </div>
              <div className="grid gap-5 p-4 md:p-5">
                <AdminField label="عنوان بخش">
                  <AdminTextInput
                    placeholder="عنوان کوتاه و قابل اسکن برای این بخش"
                    value={section.title}
                    onChange={(event) =>
                      updateSection(section.id, "title", event.target.value)
                    }
                  />
                </AdminField>
                <AdminField label="متن بخش">
                  <RichTextEditor
                    minHeightClass="min-h-36"
                    placeholder="متن این بخش..."
                    value={section.content}
                    onChange={(value) => updateSection(section.id, "content", value)}
                  />
                </AdminField>
                <div className="rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="grid gap-4">
                    <AdminImageUpload
                      label="تصویر این بخش"
                      preview={section.imagePreview}
                      ratioClass="aspect-[16/9]"
                      onChange={(file) => updateSectionImage(section.id, file)}
                      onRemove={() => removeSectionImage(section.id)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setForm((current) => ({
                ...current,
                sections: [...current.sections, newSection()],
              }))
            }
            className="flex min-h-14 items-center justify-center rounded-2xl border border-dashed border-shah-gold-500/45 bg-shah-gold-500/10 px-5 text-base font-black text-shah-gold-800 transition hover:border-shah-gold-500 hover:bg-shah-gold-500 hover:text-white dark:text-shah-gold-100 dark:hover:text-shah-black-950"
          >
            افزودن بخش جدید
          </button>
        </div>
      </FormSection>

      <FormSection
        eyebrow="گام ۳"
        title="شخصیت‌ها"
        description="شخصیت‌های موجود را جستجو و به داستان اضافه کنید. فقط شخصیت‌های ثبت‌شده در پنل قابل انتخاب هستند."
      >
        <div className="grid gap-5">
          <div className="grid gap-4 rounded-2xl border border-border bg-muted/20 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="flex-1">
                <AdminField label="جستجوی شخصیت‌های موجود">
                  <AdminTextInput
                    value={characterQuery}
                    onChange={(event) => setCharacterQuery(event.target.value)}
                    placeholder="نام، لقب، نقش یا دودمان شخصیت را جستجو کنید..."
                  />
                </AdminField>
              </div>
              <span className="rounded-xl border border-shah-lapis-700/20 bg-shah-lapis-700/5 px-4 py-3 text-sm font-black text-shah-lapis-800 dark:text-shah-lapis-100">
                {toFaNumber(selectedCharacters.length)} شخصیت انتخاب شده
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {filteredCharacters.length ? (
                filteredCharacters.map((character) => (
                  <button
                    key={character.id}
                    type="button"
                    onClick={() => addCharacter(character)}
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-3 text-right shadow-sm transition hover:-translate-y-0.5 hover:border-shah-gold-500/45 hover:bg-shah-gold-500/5"
                  >
                    <CharacterAvatar character={character} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black text-foreground">
                        {character.name}
                      </span>
                      <span className="mt-1 block truncate text-xs font-bold text-muted-foreground">
                        {character.title || character.role || "شخصیت شاهنامه"}
                      </span>
                    </span>
                    <span className="rounded-xl bg-shah-gold-500/10 px-3 py-2 text-xs font-black text-shah-gold-700 transition group-hover:bg-shah-gold-500 group-hover:text-white dark:text-shah-gold-200">
                      افزودن
                    </span>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card/60 px-4 py-8 text-center md:col-span-2">
                  <p className="text-sm font-black text-foreground">
                    نتیجه‌ای پیدا نشد
                  </p>
                  <p className="mt-2 text-xs font-bold text-muted-foreground">
                    عبارت جستجو را کوتاه‌تر کنید یا ابتدا شخصیت را در بخش شخصیت‌ها بسازید.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-foreground">
                شخصیت‌های انتخاب‌شده
              </p>
              <span className="text-xs font-bold text-muted-foreground">
                {toFaNumber(selectedCharacters.length)} مورد
              </span>
            </div>
            {selectedCharacters.length ? (
              <div className="flex flex-wrap gap-3">
                {selectedCharacters.map(({ character, reference }) => (
                  <div
                    key={reference.slug}
                    className="flex items-center gap-3 rounded-2xl border border-shah-lapis-700/20 bg-shah-lapis-700/5 p-2 pr-3 shadow-sm dark:border-shah-lapis-300/15"
                  >
                    <CharacterAvatar character={character} name={reference.name} />
                    <span className="max-w-40 truncate text-sm font-black text-foreground">
                      {reference.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCharacter(reference.slug)}
                      className="grid size-8 place-items-center rounded-xl bg-red-500/10 text-lg font-black leading-none text-red-600 transition hover:bg-red-600 hover:text-white"
                      aria-label={`حذف ${reference.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-7 text-center">
                <p className="text-sm font-black text-foreground">
                  هنوز شخصیتی انتخاب نشده است
                </p>
                <p className="mt-2 text-xs font-bold text-muted-foreground">
                  از نتایج جستجو، شخصیت‌های مرتبط با روایت را اضافه کنید.
                </p>
              </div>
            )}
          </div>
        </div>
      </FormSection>

      <FormSection
        eyebrow="گام ۴"
        title="رسانه"
        description="تصویر کاور با نسبت ۱۶:۹ در کارت‌ها، آرشیو و هدر داستان استفاده می‌شود."
      >
        <div className="rounded-2xl border border-border bg-muted/20 p-4">
          <div className="grid gap-4">
            <AdminImageUpload
              label="تصویر کاور"
              required={!story}
              preview={form.coverImagePreview}
              ratioClass="aspect-[16/9]"
              onChange={updateCover}
              onRemove={removeCover}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        eyebrow="گام ۵"
        title="بیت برگزیده"
        description="اگر داستان بیت یا نقل قول شاخصی دارد، آن را اینجا ثبت کنید تا در صفحه داستان برجسته شود."
      >
        <AdminField label="نقل قول یا بیت">
          <RichTextEditor
            minHeightClass="min-h-28"
            placeholder="بیت شاهنامه یا نقل قول مرتبط..."
            value={form.quote}
            onChange={(value) => updateField("quote", value)}
          />
        </AdminField>
      </FormSection>

      <div className="sticky bottom-4 z-30 rounded-2xl border border-border bg-card/95 p-4 shadow-2xl shadow-shah-black-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-shah-black-950/90 dark:shadow-black/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-right">
            <p className="text-sm font-black text-foreground">{formModeText}</p>
            <p className="mt-1 text-xs font-bold text-muted-foreground">
              پس از ذخیره، به فهرست داستان‌ها بازمی‌گردید.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/stories")}
              className="h-12 rounded-xl border border-border px-6 text-base font-bold text-foreground transition hover:bg-muted/70"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="h-12 rounded-xl bg-primary px-7 text-base font-bold text-white shadow-md transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "در حال ذخیره..." : "ذخیره داستان"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function FormSection({
  children,
  description,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm md:p-6">
      <header className="mb-6 border-b border-border pb-5 text-right">
        <span className="text-[11px] font-black text-shah-gold-700 dark:text-shah-gold-300">
          {eyebrow}
        </span>
        <h2 className="mt-2 text-xl font-black text-foreground">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm font-medium leading-7 text-muted-foreground">
          {description}
        </p>
      </header>
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

function CharacterAvatar({
  character,
  name,
}: {
  character?: Character;
  name?: string;
}) {
  const image = getCharacterImage(character);
  const displayName = character?.name ?? name ?? "؟";

  return (
    <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-shah-gold-500/20 bg-shah-lapis-700 text-sm font-black text-white shadow-sm">
      {image ? (
        <Image
          src={image}
          alt={displayName}
          fill
          sizes="48px"
          className="object-cover"
          unoptimized={image.startsWith("/uploads/")}
        />
      ) : (
        <span className="relative z-10">{displayName.slice(0, 1)}</span>
      )}
    </span>
  );
}

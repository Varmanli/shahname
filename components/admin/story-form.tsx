"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  FiAlertCircle,
  FiBookOpen,
  FiCheckCircle,
  FiFileText,
  FiImage,
  FiInfo,
  FiPlus,
  FiSave,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";

import {
  AdminField,
  AdminTextInput,
  AdminTextarea,
} from "@/components/admin/admin-form-controls";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { shouldUseUnoptimizedImage } from "@/lib/images";
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

const toFaNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function richTextHasContent(value: string) {
  return (
    value
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, "")
      .trim().length > 0
  );
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
  return (
    character?.portraitImage?.trim() || character?.sceneImage?.trim() || ""
  );
}

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

function countCompletedFields(form: StoryFormState) {
  const sectionContentCount = form.sections.filter(
    (section) => section.title.trim() && richTextHasContent(section.content),
  ).length;

  const checks = [
    form.title.trim(),
    form.subtitle.trim(),
    form.shortDescription.trim(),
    form.order.trim(),
    form.coverImagePreview,
    form.characters.length,
    form.sections.length,
    sectionContentCount === form.sections.length,
    richTextHasContent(form.quote),
  ];

  return checks.filter(Boolean).length;
}

export function StoryForm({ characters, story }: StoryFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<StoryFormState>(() =>
    createInitialForm(story),
  );
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

  const completion = useMemo(() => {
    const total = 9;
    return Math.round((countCompletedFields(form) / total) * 100);
  }, [form]);

  const slugPreview = useMemo(() => createSlug(form.title), [form.title]);
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

  function updateSection(
    id: string,
    field: "title" | "content",
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section,
      ),
    }));
  }

  function removeSection(id: string) {
    setForm((current) => ({
      ...current,
      sections: current.sections.filter((section) => section.id !== id),
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
      const exists = current.characters.some(
        (item) => item.slug === character.slug,
      );

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

    if (form.coverImageFile) {
      formData.append("coverImage", form.coverImageFile);
    }

    if (form.coverImagePreview && !form.coverImagePreview.startsWith("blob:")) {
      formData.append("coverImageUrl", form.coverImagePreview);
    }

    if (form.coverImageRemoved) {
      formData.append("removeCoverImage", "true");
    }

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

    const response = await fetch(
      story ? `/api/stories/${story.id}` : "/api/stories",
      {
        method: story ? "PUT" : "POST",
        body: buildFormData(),
      },
    );

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
    <form onSubmit={handleSubmit} className="grid gap-5 pb-8" dir="rtl">
      <StoryFormHero
        completion={completion}
        isEdit={Boolean(story)}
        selectedCharactersCount={selectedCharacters.length}
        sectionsCount={form.sections.length}
        slugPreview={slugPreview}
        title={form.title}
      />

      {status ? <StatusMessage message={status} /> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
        <div className="grid gap-5">
          <FormSection
            icon={<FiInfo aria-hidden className="size-4" />}
            title="اطلاعات اصلی"
            description="عنوان، زیرعنوان، خلاصه و جایگاه زمانی داستان را ثبت کن."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="عنوان داستان" required>
                <AdminTextInput
                  placeholder="مثلاً رستم و سهراب"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                />
              </AdminField>

              <AdminField label="زیرعنوان" required>
                <AdminTextInput
                  placeholder="یک جمله کوتاه برای معرفی روایت"
                  value={form.subtitle}
                  onChange={(event) =>
                    updateField("subtitle", event.target.value)
                  }
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
                    className="min-h-28 text-sm leading-7"
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
            icon={<FiFileText aria-hidden className="size-4" />}
            title="بخش‌های داستان"
            description="داستان را به بخش‌های کوتاه و قابل خواندن تقسیم کن."
          >
            <div className="grid gap-4">
              {form.sections.map((section, index) => (
                <StorySectionEditor
                  canDelete={form.sections.length > 1}
                  index={index}
                  key={section.id}
                  section={section}
                  total={form.sections.length}
                  onDelete={() => removeSection(section.id)}
                  onImageChange={(file) => updateSectionImage(section.id, file)}
                  onImageRemove={() => removeSectionImage(section.id)}
                  onUpdate={(field, value) =>
                    updateSection(section.id, field, value)
                  }
                />
              ))}

              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    sections: [...current.sections, newSection()],
                  }))
                }
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-dashed border-shah-gold-500/32 bg-shah-gold-500/8 px-5 text-sm font-black text-shah-gold-800 transition hover:border-shah-gold-500/60 hover:bg-shah-gold-500 hover:text-shah-black-950 dark:text-shah-gold-100"
              >
                <FiPlus aria-hidden className="size-4" />
                افزودن بخش جدید
              </button>
            </div>
          </FormSection>

          <FormSection
            icon={<FiUsers aria-hidden className="size-4" />}
            title="شخصیت‌ها"
            description="شخصیت‌های مرتبط با این روایت را انتخاب کن."
          >
            <CharacterPicker
              characterQuery={characterQuery}
              filteredCharacters={filteredCharacters}
              selectedCharacters={selectedCharacters}
              onAddCharacter={addCharacter}
              onQueryChange={setCharacterQuery}
              onRemoveCharacter={removeCharacter}
            />
          </FormSection>

          <FormSection
            icon={<FiImage aria-hidden className="size-4" />}
            title="رسانه"
            description="تصویر کاور با نسبت ۱۶:۹ در کارت‌ها، آرشیو و هدر داستان استفاده می‌شود."
          >
            <div className="rounded-2xl border border-shah-gold-500/12 bg-white/48 p-3 dark:border-white/8 dark:bg-black/12">
              <AdminImageUpload
                label="تصویر کاور"
                required={!story}
                preview={form.coverImagePreview}
                ratioClass="aspect-[16/9]"
                onChange={updateCover}
                onRemove={removeCover}
              />
            </div>
          </FormSection>

          <FormSection
            icon={<FiBookOpen aria-hidden className="size-4" />}
            title="بیت برگزیده"
            description="اگر داستان بیت یا نقل قول شاخصی دارد، آن را اینجا ثبت کن."
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
        </div>

        <StorySidebar
          completion={completion}
          form={form}
          formModeText={formModeText}
          isSaving={isSaving}
          selectedCharactersCount={selectedCharacters.length}
          slugPreview={slugPreview}
          onCancel={() => router.push("/admin/stories")}
        />
      </div>
    </form>
  );
}

function StoryFormHero({
  completion,
  isEdit,
  sectionsCount,
  selectedCharactersCount,
  slugPreview,
  title,
}: {
  completion: number;
  isEdit: boolean;
  sectionsCount: number;
  selectedCharactersCount: number;
  slugPreview: string;
  title: string;
}) {
  return (
    <section className="relative isolate overflow-hidden rounded-[1.8rem] border border-shah-gold-500/14 bg-shah-lapis-950 px-5 py-5 text-white shadow-xl shadow-shah-lapis-950/20 md:px-6">
      <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-shah-gold-400/18 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-10 size-72 rounded-full bg-blue-500/16 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-shah-gold-200">
            <FiBookOpen aria-hidden className="size-3.5" />
            {isEdit ? "Edit Story" : "New Story"}
          </div>

          <h1 className="mt-3 truncate text-2xl font-black md:text-3xl">
            {title || (isEdit ? "ویرایش داستان" : "ایجاد داستان جدید")}
          </h1>

          <p className="mt-2 max-w-2xl text-xs font-bold leading-6 text-white/62 md:text-sm">
            روایت را با ساختار بخش‌بندی‌شده، شخصیت‌های مرتبط، کاور و بیت برگزیده
            آماده انتشار کن.
          </p>

          {slugPreview ? (
            <div className="mt-3 inline-flex max-w-full rounded-xl border border-white/12 bg-white/8 px-3 py-2 text-[11px] font-bold text-white/60">
              <span className="truncate">/stories/{slugPreview}</span>
            </div>
          ) : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-3 lg:w-108">
          <HeroStat label="تکمیل" value={`${toFaNumber(completion)}٪`} />
          <HeroStat label="بخش‌ها" value={toFaNumber(sectionsCount)} />
          <HeroStat
            label="شخصیت‌ها"
            value={toFaNumber(selectedCharactersCount)}
          />
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-xl">
      <p className="text-[11px] font-bold text-white/48">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-white">{value}</p>
    </div>
  );
}

function StorySectionEditor({
  canDelete,
  index,
  onDelete,
  onImageChange,
  onImageRemove,
  onUpdate,
  section,
  total,
}: {
  canDelete: boolean;
  index: number;
  onDelete: () => void;
  onImageChange: (file: File | null) => void;
  onImageRemove: () => void;
  onUpdate: (field: "title" | "content", value: string) => void;
  section: StorySectionForm;
  total: number;
}) {
  return (
    <article className="overflow-hidden rounded-[1.35rem] border border-shah-gold-500/12 bg-white/58 shadow-lg shadow-shah-black-900/4 backdrop-blur-xl transition hover:border-shah-gold-500/26 dark:border-white/8 dark:bg-white/[0.035]">
      <header className="flex flex-col gap-3 border-b border-shah-gold-500/10 bg-white/52 px-4 py-3 dark:border-white/8 dark:bg-white/[0.035] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-shah-lapis-900 text-xs font-black text-shah-gold-100">
            {toFaNumber(index + 1)}
          </span>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-foreground">
              {section.title.trim() || "هنوز عنوانی وارد نشده"}
            </h3>

            <p className="mt-0.5 text-[11px] font-bold text-muted-foreground">
              بخش {toFaNumber(index + 1)} از {toFaNumber(total)}
            </p>
          </div>
        </div>

        {canDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-500/16 bg-red-500/8 px-3 text-xs font-black text-red-700 transition hover:bg-red-500 hover:text-white dark:border-red-400/16 dark:text-red-200"
          >
            <FiTrash2 aria-hidden className="size-3.5" />
            حذف بخش
          </button>
        ) : null}
      </header>

      <div className="grid gap-4 p-4">
        <AdminField label="عنوان بخش">
          <AdminTextInput
            placeholder="عنوان کوتاه و قابل اسکن برای این بخش"
            value={section.title}
            onChange={(event) => onUpdate("title", event.target.value)}
          />
        </AdminField>

        <AdminField label="متن بخش">
          <RichTextEditor
            minHeightClass="min-h-36"
            placeholder="متن این بخش..."
            value={section.content}
            onChange={(value) => onUpdate("content", value)}
          />
        </AdminField>

        <div className="rounded-2xl border border-shah-gold-500/12 bg-white/48 p-3 dark:border-white/8 dark:bg-black/12">
          <AdminImageUpload
            label="تصویر این بخش"
            preview={section.imagePreview}
            ratioClass="aspect-[16/9]"
            onChange={onImageChange}
            onRemove={onImageRemove}
          />
        </div>
      </div>
    </article>
  );
}

function CharacterPicker({
  characterQuery,
  filteredCharacters,
  onAddCharacter,
  onQueryChange,
  onRemoveCharacter,
  selectedCharacters,
}: {
  characterQuery: string;
  filteredCharacters: Character[];
  selectedCharacters: Array<{
    reference: StoryCharacterReference;
    character?: Character;
  }>;
  onAddCharacter: (character: Character) => void;
  onQueryChange: (value: string) => void;
  onRemoveCharacter: (slug: string) => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="rounded-[1.35rem] border border-shah-gold-500/12 bg-white/48 p-3 dark:border-white/8 dark:bg-black/12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <AdminField label="جستجوی شخصیت‌های موجود">
              <div className="relative">
                <FiSearch
                  aria-hidden
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/65"
                />

                <AdminTextInput
                  value={characterQuery}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="نام، لقب، نقش یا دودمان شخصیت..."
                  className="pr-9"
                />
              </div>
            </AdminField>
          </div>

          <span className="inline-flex h-10 shrink-0 items-center rounded-xl border border-shah-gold-500/12 bg-shah-gold-500/8 px-3 text-xs font-black text-shah-gold-800 dark:border-shah-gold-300/12 dark:text-shah-gold-100">
            {toFaNumber(selectedCharacters.length)} شخصیت انتخاب شده
          </span>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {filteredCharacters.length ? (
            filteredCharacters.map((character) => (
              <button
                key={character.id}
                type="button"
                onClick={() => onAddCharacter(character)}
                className="group flex items-center gap-3 rounded-2xl border border-shah-gold-500/12 bg-white/62 p-2.5 text-right transition hover:-translate-y-0.5 hover:border-shah-gold-500/35 hover:bg-white dark:border-white/8 dark:bg-white/4 dark:hover:bg-white/[0.07]"
              >
                <CharacterAvatar character={character} />

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-black text-foreground">
                    {character.name}
                  </span>

                  <span className="mt-0.5 block truncate text-[11px] font-bold text-muted-foreground">
                    {character.title || character.role || "شخصیت شاهنامه"}
                  </span>
                </span>

                <span className="rounded-xl bg-shah-gold-500/10 px-2.5 py-1.5 text-[11px] font-black text-shah-gold-800 transition group-hover:bg-shah-gold-500 group-hover:text-shah-black-950 dark:text-shah-gold-100">
                  افزودن
                </span>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-shah-gold-500/18 bg-white/52 px-4 py-8 text-center dark:border-white/10 dark:bg-white/[0.035] md:col-span-2">
              <p className="text-sm font-black text-foreground">
                نتیجه‌ای پیدا نشد
              </p>
              <p className="mt-2 text-xs font-bold text-muted-foreground">
                عبارت جستجو را کوتاه‌تر کنید یا ابتدا شخصیت را در بخش شخصیت‌ها
                بسازید.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-black text-foreground">
            شخصیت‌های انتخاب‌شده
          </p>

          <span className="text-[11px] font-bold text-muted-foreground">
            {toFaNumber(selectedCharacters.length)} مورد
          </span>
        </div>

        {selectedCharacters.length ? (
          <div className="flex flex-wrap gap-2">
            {selectedCharacters.map(({ character, reference }) => (
              <div
                key={reference.slug}
                className="inline-flex items-center gap-2 rounded-full border border-shah-gold-500/14 bg-shah-gold-500/8 py-1 pl-1 pr-2 text-xs font-black text-foreground dark:border-shah-gold-300/12"
              >
                <CharacterAvatar
                  character={character}
                  name={reference.name}
                  size="sm"
                />

                <span className="max-w-36 truncate">{reference.name}</span>

                <button
                  type="button"
                  onClick={() => onRemoveCharacter(reference.slug)}
                  className="grid size-6 place-items-center rounded-full bg-red-500/10 text-red-600 transition hover:bg-red-600 hover:text-white dark:text-red-200"
                  aria-label={`حذف ${reference.name}`}
                >
                  <FiX aria-hidden className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-shah-gold-500/18 bg-white/46 px-4 py-7 text-center dark:border-white/10 dark:bg-white/3">
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
  );
}

function StorySidebar({
  completion,
  form,
  formModeText,
  isSaving,
  selectedCharactersCount,
  slugPreview,
  onCancel,
}: {
  completion: number;
  form: StoryFormState;
  formModeText: string;
  isSaving: boolean;
  selectedCharactersCount: number;
  slugPreview: string;
  onCancel: () => void;
}) {
  const completedSections = form.sections.filter(
    (section) => section.title.trim() && richTextHasContent(section.content),
  ).length;

  return (
    <aside className="grid gap-4 xl:sticky xl:top-24">
      <section className="rounded-[1.7rem] border border-shah-gold-500/14 bg-white/72 p-4 shadow-xl shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-shah-gold-800 dark:text-shah-gold-200">
          Actions
        </p>

        <h2 className="mt-2 text-base font-black text-foreground">
          {formModeText}
        </h2>

        <div className="mt-4 grid gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl text-sm font-black shadow-lg transition active:scale-95 ${
              isSaving
                ? "cursor-not-allowed bg-shah-lapis-900/55 text-white/65"
                : "bg-shah-lapis-900 text-shah-gold-100 shadow-shah-lapis-900/15 hover:-translate-y-0.5 hover:bg-shah-lapis-800 hover:text-white dark:bg-shah-gold-500 dark:text-shah-black-950 dark:hover:bg-shah-gold-400"
            }`}
          >
            <FiSave aria-hidden className="size-4" />
            {isSaving ? "در حال ذخیره..." : "ذخیره داستان"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-shah-gold-500/12 bg-white/60 text-xs font-black text-foreground transition hover:bg-muted/70 active:scale-95 dark:border-white/10 dark:bg-white/4.5"
          >
            <FiX aria-hidden className="size-4" />
            انصراف
          </button>
        </div>
      </section>

      <section className="rounded-[1.7rem] border border-shah-gold-500/14 bg-white/72 p-4 shadow-xl shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-muted-foreground">تکمیل فرم</p>
            <p className="mt-1 text-2xl font-black text-foreground">
              {toFaNumber(completion)}٪
            </p>
          </div>

          <div className="grid size-11 place-items-center rounded-2xl bg-shah-gold-500/10 text-shah-gold-800 dark:text-shah-gold-200">
            <FiCheckCircle aria-hidden className="size-5" />
          </div>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-shah-gold-500/12">
          <div
            className="h-full rounded-full bg-linear-to-l from-shah-gold-500 to-shah-lapis-800 transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>

        <div className="mt-4 grid gap-2">
          <ChecklistItem done={Boolean(form.title.trim())} label="عنوان" />
          <ChecklistItem
            done={Boolean(form.subtitle.trim())}
            label="زیرعنوان"
          />
          <ChecklistItem
            done={Boolean(form.shortDescription.trim())}
            label="خلاصه کوتاه"
          />
          <ChecklistItem
            done={completedSections === form.sections.length}
            label={`${toFaNumber(completedSections)} از ${toFaNumber(form.sections.length)} بخش کامل`}
          />
          <ChecklistItem
            done={selectedCharactersCount > 0}
            label={`${toFaNumber(selectedCharactersCount)} شخصیت انتخاب شده`}
          />
          <ChecklistItem
            done={Boolean(form.coverImagePreview)}
            label="تصویر کاور"
          />
        </div>
      </section>

      <section className="rounded-[1.7rem] border border-shah-gold-500/14 bg-shah-lapis-950 p-4 text-white shadow-xl shadow-shah-lapis-950/15">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-shah-gold-300">
          Preview
        </p>

        <div className="mt-3 grid gap-3 text-xs font-bold leading-6 text-white/62">
          {slugPreview ? (
            <div className="rounded-2xl border border-white/12 bg-white/8 p-3">
              <p className="text-[11px] font-bold text-white/42">آدرس داستان</p>
              <p className="mt-1 truncate text-xs font-black text-shah-gold-100">
                /stories/{slugPreview}
              </p>
            </div>
          ) : null}

          <p>
            بخش‌ها را کوتاه و قابل اسکن نگه دار تا صفحه داستان برای خواندن
            راحت‌تر باشد.
          </p>

          <p>
            تصویر کاور با نسبت ۱۶:۹ بهترین نتیجه را در آرشیو و صفحه جزئیات
            می‌دهد.
          </p>
        </div>
      </section>
    </aside>
  );
}

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-shah-gold-500/10 bg-white/48 px-3 py-2 text-xs font-black dark:border-white/8 dark:bg-white/[0.035]">
      <span
        className={`grid size-6 shrink-0 place-items-center rounded-full ${
          done
            ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-200"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? (
          <FiCheckCircle aria-hidden className="size-3.5" />
        ) : (
          <span className="size-1.5 rounded-full bg-current opacity-60" />
        )}
      </span>

      <span className={done ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}

function FormSection({
  children,
  description,
  icon,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[1.7rem] border border-shah-gold-500/14 bg-white/72 p-4 text-card-foreground shadow-xl shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5 md:p-5">
      <header className="mb-5 flex items-start gap-3 text-right">
        <div className="grid size-10 shrink-0 place-items-center rounded-2xl border border-shah-gold-500/14 bg-shah-gold-500/10 text-shah-gold-800 dark:border-shah-gold-300/15 dark:text-shah-gold-200">
          {icon}
        </div>

        <div>
          <h2 className="text-base font-black text-foreground md:text-lg">
            {title}
          </h2>

          <p className="mt-1 text-xs font-bold leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </header>

      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function StatusMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[1.35rem] border border-red-500/18 bg-red-50/90 px-4 py-3 text-sm font-black leading-7 text-red-700 shadow-lg shadow-red-950/5 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-200">
      <FiAlertCircle aria-hidden className="mt-1 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function CharacterAvatar({
  character,
  name,
  size = "md",
}: {
  character?: Character;
  name?: string;
  size?: "sm" | "md";
}) {
  const image = getCharacterImage(character);
  const displayName = character?.name ?? name ?? "؟";
  const sizeClass = size === "sm" ? "size-6" : "size-10";
  const textClass = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <span
      className={`relative grid ${sizeClass} shrink-0 place-items-center overflow-hidden rounded-xl border border-shah-gold-500/14 bg-shah-lapis-900 ${textClass} font-black text-shah-gold-100`}
    >
      {image ? (
        <Image
          src={image}
          alt={displayName}
          fill
          sizes={size === "sm" ? "24px" : "40px"}
          className="object-cover"
          unoptimized={shouldUseUnoptimizedImage(image)}
        />
      ) : (
        <span className="relative z-10">{displayName.slice(0, 1)}</span>
      )}
    </span>
  );
}

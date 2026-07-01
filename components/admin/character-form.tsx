"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";

import {
  AdminField,
  AdminSelect,
  AdminTextInput,
} from "@/components/admin/admin-form-controls";
import { CharacterRelationSelect } from "@/components/admin/character-relation-select";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { RelationshipManager } from "@/components/admin/relationship-manager";
import { TraitSelector } from "@/components/admin/trait-selector";
import type { CharacterTrait } from "@/lib/traits";
import type { Character, CharacterSummary } from "@/types/character";
import type { Lineage } from "@/types/lineage";
import type { Relationship } from "@/types/relationship";

type CharacterFormProps = {
  character?: Character;
};

type CharacterFormState = {
  name: string;
  title: string;
  epithets: string[];
  role: string;
  visualRole: string;
  nationality: string;
  nameMeaning: string;
  father: string;
  mother: string;
  fatherId: string;
  motherId: string;
  spouseIds: string[];
  childrenIds: string[];
  siblingIds: string[];
  dynasty: string;
  lineageGroup: string;
  lineageId: string;
  enemies: string[];
  shortDescription: string;
  fullDescription: string;
  traits: CharacterTrait[];
  achievements: string[];
  quote: string;
  portraitImageFile: File | null;
  sceneImageFile: File | null;
  portraitImagePreview: string;
  sceneImagePreview: string;
  portraitImageRemoved: boolean;
  sceneImageRemoved: boolean;
};

const requiredMessage =
  "نام، عنوان، نقش، دودمان، خلاصه، روایت کامل و تصاویر الزامی هستند.";
const editRequiredMessage =
  "نام، عنوان، نقش، دودمان، خلاصه و روایت کامل الزامی هستند.";

function richTextHasContent(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").trim().length > 0;
}

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function createInitialForm(character?: Character): CharacterFormState {
  return {
    name: character?.name ?? "",
    title: character?.title ?? "",
    epithets: character?.epithets ?? [],
    role: character?.role ?? "",
    visualRole: character?.visualRole ?? "",
    nationality: character?.nationality ?? "",
    nameMeaning: character?.nameMeaning ?? "",
    father: character?.father ?? "",
    mother: character?.mother ?? "",
    fatherId: character?.fatherId ?? "",
    motherId: character?.motherId ?? "",
    spouseIds: character?.spouseIds ?? [],
    childrenIds: character?.childrenIds ?? [],
    siblingIds: character?.siblingIds ?? [],
    dynasty: character?.dynasty ?? "",
    lineageGroup: character?.lineageGroup ?? character?.dynasty ?? "",
    lineageId: character?.lineageId ?? "",
    enemies: character?.enemies ?? [],
    shortDescription: character?.shortDescription ?? "",
    fullDescription: character?.fullDescription ?? "",
    traits: character?.traits ?? [],
    achievements: character?.achievements ?? [],
    quote: character?.quote ?? "",
    portraitImageFile: null,
    sceneImageFile: null,
    portraitImagePreview: character?.portraitImage ?? "",
    sceneImagePreview: character?.sceneImage ?? "",
    portraitImageRemoved: false,
    sceneImageRemoved: false,
  };
}

export function CharacterForm({ character }: CharacterFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<CharacterFormState>(() =>
    createInitialForm(character),
  );
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [relationOptions, setRelationOptions] = useState<CharacterSummary[]>([]);
  const [relationOptionsStatus, setRelationOptionsStatus] = useState("در حال دریافت شخصیت‌ها...");
  const [lineageOptions, setLineageOptions] = useState<Lineage[]>([]);
  const [relationshipOptions, setRelationshipOptions] = useState<Relationship[]>([]);
  const portraitObjectUrl = useRef("");
  const sceneObjectUrl = useRef("");

  useEffect(() => {
    let isMounted = true;

    fetch("/api/characters/options")
      .then((response) => response.json())
      .then((payload) => {
        if (!isMounted) return;
        setRelationOptions(payload.characters ?? []);
        setRelationOptionsStatus("");
      })
      .catch(() => {
        if (!isMounted) return;
        setRelationOptionsStatus("دریافت فهرست شخصیت‌ها با خطا روبه‌رو شد.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!character) return;
    let isMounted = true;

    fetch("/api/relationships")
      .then((response) => response.json())
      .then((payload) => {
        if (!isMounted) return;
        setRelationshipOptions(
          (payload.relationships ?? []).filter(
            (relationship: Relationship) =>
              relationship.sourceCharacterId === character.id ||
              relationship.targetCharacterId === character.id,
          ),
        );
      })
      .catch(() => {
        if (!isMounted) return;
        setRelationshipOptions([]);
      });

    return () => {
      isMounted = false;
    };
  }, [character]);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/lineages")
      .then((response) => response.json())
      .then((payload) => {
        if (!isMounted) return;
        setLineageOptions(payload.lineages ?? []);
      })
      .catch(() => {
        if (!isMounted) return;
        setLineageOptions([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function updateField(
    field: keyof Pick<
      CharacterFormState,
      | "name"
      | "title"
      | "role"
      | "visualRole"
      | "nationality"
      | "nameMeaning"
      | "father"
      | "mother"
      | "fatherId"
      | "motherId"
      | "dynasty"
      | "lineageGroup"
      | "lineageId"
      | "shortDescription"
      | "fullDescription"
      | "quote"
    >,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateTags(
    field: "epithets" | "achievements" | "enemies" | "spouseIds" | "childrenIds" | "siblingIds",
    value: string[],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateTraits(value: CharacterTrait[]) {
    setForm((current) => ({ ...current, traits: value }));
  }

  function updateFile(field: "portraitImage" | "sceneImage", file: File | null) {
    const ref = field === "portraitImage" ? portraitObjectUrl : sceneObjectUrl;

    if (ref.current) {
      URL.revokeObjectURL(ref.current);
      ref.current = "";
    }

    if (!file) {
      setForm((current) => ({
        ...current,
        [`${field}File`]: null,
        [`${field}Preview`]: "",
      }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    ref.current = previewUrl;

    setForm((current) => ({
      ...current,
      [`${field}File`]: file,
      [`${field}Preview`]: previewUrl,
      [`${field}Removed`]: false,
    }));
  }

  function removeFile(field: "portraitImage" | "sceneImage") {
    const ref = field === "portraitImage" ? portraitObjectUrl : sceneObjectUrl;

    if (ref.current) {
      URL.revokeObjectURL(ref.current);
      ref.current = "";
    }

    setForm((current) => ({
      ...current,
      [`${field}File`]: null,
      [`${field}Preview`]: "",
      [`${field}Removed`]: true,
    }));
  }

  function buildFormData() {
    const formData = new FormData();

    for (const field of [
      "name",
      "title",
      "role",
      "visualRole",
      "nationality",
      "nameMeaning",
      "father",
      "mother",
      "fatherId",
      "motherId",
      "dynasty",
      "lineageGroup",
      "lineageId",
      "shortDescription",
      "fullDescription",
      "quote",
    ] as const) {
      formData.append(field, form[field]);
    }
    formData.append("slug", createSlug(form.name));

    for (const field of [
      "epithets",
      "traits",
      "achievements",
      "enemies",
      "spouseIds",
      "childrenIds",
      "siblingIds",
    ] as const) {
      formData.append(field, JSON.stringify(form[field]));
    }

    if (form.portraitImageFile) {
      formData.append("portraitImage", form.portraitImageFile);
    }

    if (form.sceneImageFile) {
      formData.append("sceneImage", form.sceneImageFile);
    }

    if (
      form.portraitImagePreview &&
      !form.portraitImagePreview.startsWith("blob:")
    ) {
      formData.append("portraitImageUrl", form.portraitImagePreview);
    }

    if (form.sceneImagePreview && !form.sceneImagePreview.startsWith("blob:")) {
      formData.append("sceneImageUrl", form.sceneImagePreview);
    }

    if (form.portraitImageRemoved) {
      formData.append("removePortraitImage", "true");
    }

    if (form.sceneImageRemoved) {
      formData.append("removeSceneImage", "true");
    }

    return formData;
  }

  function validate() {
    const hasRequiredRichText =
      Boolean(character) ||
      (richTextHasContent(form.shortDescription) &&
        richTextHasContent(form.fullDescription));

    return Boolean(
      form.name.trim() &&
        form.title.trim() &&
        form.role.trim() &&
        form.dynasty.trim() &&
        hasRequiredRichText &&
        (character || form.portraitImagePreview) &&
        (character || form.sceneImagePreview),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      setStatus(character ? editRequiredMessage : requiredMessage);
      return;
    }

    setIsSaving(true);
    setStatus("");

    const response = await fetch(
      character ? `/api/characters/${character.id}` : "/api/characters",
      {
        method: character ? "PUT" : "POST",
        body: buildFormData(),
      },
    );
    const payload = await response.json();

    setIsSaving(false);

    if (!response.ok) {
      setStatus(payload.message ?? "ذخیره شخصیت با خطا روبه‌رو شد.");
      return;
    }

    router.push("/admin/characters");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      {status ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {status}
        </div>
      ) : null}

      <FormSection title="اطلاعات اصلی">
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="نام شخصیت" required>
            <AdminTextInput
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
            />
          </AdminField>
          <AdminField label="عنوان کوتاه" required>
            <AdminTextInput
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </AdminField>
          <AdminField label="نقش" required>
            <AdminTextInput
              value={form.role}
              onChange={(event) => updateField("role", event.target.value)}
            />
          </AdminField>
          <AdminField label="نوع نمایشی در تبارنامه">
            <AdminSelect
              value={form.visualRole}
              onChange={(value) => updateField("visualRole", value)}
              placeholder="تشخیص خودکار از نقش"
              options={[
                { label: "تشخیص خودکار از نقش", value: "" },
                { label: "پادشاه", value: "king" },
                { label: "همسر شاه / بانو", value: "queen" },
                { label: "پهلوان", value: "hero" },
                { label: "خردمند / موبد", value: "sage" },
                { label: "شاهزاده / خاندان شاهی", value: "royal-family" },
                { label: "مردم عادی / نام‌دار", value: "notable" },
              ]}
            />
          </AdminField>
          <AdminField label="ملیت">
            <AdminTextInput
              value={form.nationality}
              onChange={(event) =>
                updateField("nationality", event.target.value)
              }
            />
          </AdminField>
          <AdminField label="معنای نام">
            <AdminTextInput
              value={form.nameMeaning}
              onChange={(event) =>
                updateField("nameMeaning", event.target.value)
              }
            />
          </AdminField>
          <AdminField label="دودمان" required>
            <AdminTextInput
              value={form.dynasty}
              onChange={(event) => {
                updateField("dynasty", event.target.value);
                if (!form.lineageGroup || form.lineageGroup === form.dynasty) {
                  updateField("lineageGroup", event.target.value);
                }
              }}
            />
          </AdminField>
          <TagInput
            label="لقب‌ها"
            values={form.epithets}
            onChange={(value) => updateTags("epithets", value)}
            placeholder="مثلا دیوبند"
          />
        </div>
      </FormSection>

      <FormSection title="تبار و روابط خانوادگی">
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="گروه تبارنامه / دودمان">
            <AdminTextInput
              value={form.lineageGroup}
              onChange={(event) => updateField("lineageGroup", event.target.value)}
            />
          </AdminField>
          <AdminField label="تبارنامه رسمی">
            <AdminSelect
              value={form.lineageId}
              onChange={(value) => updateField("lineageId", value)}
              placeholder="بدون تبارنامه رسمی"
              options={[
                { label: "بدون تبارنامه رسمی", value: "" },
                ...lineageOptions.map((lineage) => ({
                  label: `${lineage.title}${lineage.isApproved ? " - منتشر شده" : " - پیش‌نویس"}`,
                  value: lineage.id,
                })),
              ]}
            />
          </AdminField>
          {relationOptionsStatus ? (
            <div className="md:col-span-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm font-bold text-muted-foreground">
              {relationOptionsStatus}
            </div>
          ) : null}
          <CharacterRelationSelect
            label="پدر"
            value={form.fatherId}
            options={relationOptions}
            currentCharacterId={character?.id}
            onChange={(value) => updateField("fatherId", value as string)}
          />
          <CharacterRelationSelect
            label="مادر"
            value={form.motherId}
            options={relationOptions}
            currentCharacterId={character?.id}
            onChange={(value) => updateField("motherId", value as string)}
          />
          <CharacterRelationSelect
            label="همسر/همسران"
            multiple
            value={form.spouseIds}
            options={relationOptions}
            currentCharacterId={character?.id}
            onChange={(value) => updateTags("spouseIds", value as string[])}
          />
          <CharacterRelationSelect
            label="فرزندان"
            multiple
            value={form.childrenIds}
            options={relationOptions}
            currentCharacterId={character?.id}
            onChange={(value) => updateTags("childrenIds", value as string[])}
          />
          <div className="md:col-span-2">
            <CharacterRelationSelect
              label="خواهر/برادرها"
              multiple
              value={form.siblingIds}
              options={relationOptions}
              currentCharacterId={character?.id}
              onChange={(value) => updateTags("siblingIds", value as string[])}
            />
          </div>
        </div>
      </FormSection>

      {character ? (
        <RelationshipManager
          characterOptions={relationOptions}
          fixedCharacterId={character.id}
          initialRelationships={relationshipOptions}
          title="رابطه‌های مستقل این شخصیت"
        />
      ) : null}

      <FormSection title="روایت">
        <div className="grid gap-5">
          <AdminField label="خلاصه کوتاه" required={!character}>
            <RichTextEditor
              minHeightClass="min-h-36"
              placeholder="خلاصه کوتاه شخصیت را وارد کنید..."
              value={form.shortDescription}
              onChange={(value) => updateField("shortDescription", value)}
            />
          </AdminField>
          <AdminField label="روایت کامل" required={!character}>
            <RichTextEditor
              allowImages
              placeholder="روایت کامل شخصیت را با متن، شعر، لینک و تصویر وارد کنید..."
              value={form.fullDescription}
              onChange={(value) => updateField("fullDescription", value)}
            />
          </AdminField>
          <AdminField label="بیت یا نقل قول">
            <RichTextEditor
              minHeightClass="min-h-28"
              placeholder="بیت یا نقل قول را وارد کنید..."
              value={form.quote}
              onChange={(value) => updateField("quote", value)}
            />
          </AdminField>
        </div>
      </FormSection>

      <FormSection title="ویژگی‌ها و دستاوردها">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <span className="mb-3 block text-base font-semibold text-foreground">
              ویژگی‌ها
            </span>
            <TraitSelector value={form.traits} onChange={updateTraits} />
          </div>
          <TagInput
            label="دشمنان"
            values={form.enemies}
            onChange={(value) => updateTags("enemies", value)}
            placeholder="مثلا دیوان"
          />
          <div className="md:col-span-2">
            <TagInput
              label="دستاوردها"
              values={form.achievements}
              onChange={(value) => updateTags("achievements", value)}
              placeholder="مثلا به بند کشیدن دیوان"
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="رسانه">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="grid gap-4">
            <AdminImageUpload
              label="عکس پرتره"
              required={!character}
              preview={form.portraitImagePreview}
              ratioClass="aspect-square"
              onChange={(file) => updateFile("portraitImage", file)}
              onRemove={() => removeFile("portraitImage")}
            />
          </div>
          <div className="grid gap-4">
            <AdminImageUpload
              label="بنر"
              required={!character}
              preview={form.sceneImagePreview}
              ratioClass="aspect-[16/9]"
              onChange={(file) => updateFile("sceneImage", file)}
              onRemove={() => removeFile("sceneImage")}
            />
          </div>
        </div>
      </FormSection>

      <div className="sticky bottom-4 flex justify-end gap-4 rounded-2xl border border-border bg-card/90 p-5 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-shah-black-950/80">
        <button
          type="button"
          onClick={() => router.push("/admin/characters")}
          className="h-12 rounded-xl border border-border px-6 text-base font-bold text-foreground transition-all duration-300 hover:bg-muted/70 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className={`h-12 rounded-xl px-7 text-base font-bold text-white shadow-md transition-all duration-300 ${
            isSaving
              ? "cursor-not-allowed bg-primary/60"
              : "bg-primary hover:bg-primary-hover active:scale-95 dark:bg-shah-gold-500 dark:hover:bg-shah-gold-600"
          }`}
        >
          {isSaving ? "در حال ذخیره..." : "ذخیره شخصیت"}
        </button>
      </div>
    </form>
  );
}

function FormSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <h2 className="mb-5 text-lg font-black">{title}</h2>
      {children}
    </section>
  );
}

function TagInput({
  label,
  onChange,
  placeholder,
  values,
}: {
  label: string;
  onChange: (values: string[]) => void;
  placeholder: string;
  values: string[];
}) {
  const [draft, setDraft] = useState("");

  function addTag(value: string) {
    const tag = value.trim();
    if (!tag || values.includes(tag)) return;
    onChange([...values, tag]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
    }

    if (event.key === "Backspace" && !draft && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div className="grid gap-2">
      <span className="text-base font-semibold text-foreground">{label}</span>
      <div className="flex min-h-14 flex-wrap items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 transition-all duration-300 focus-within:border-shah-gold-500 focus-within:ring-2 focus-within:ring-shah-gold-400">
        {values.map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => onChange(values.filter((item) => item !== value))}
            className="rounded-full border border-shah-gold-500/30 bg-shah-gold-50 px-3 py-1 text-sm font-bold text-shah-gold-900 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:bg-shah-gold-500/15 dark:text-shah-gold-100"
          >
            {value}
          </button>
        ))}
        <input
          value={draft}
          onBlur={() => addTag(draft)}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={values.length ? "" : placeholder}
          className="min-w-40 flex-1 bg-transparent px-2 py-2 text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import {
  FiAlertCircle,
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiImage,
  FiInfo,
  FiLink,
  FiLoader,
  FiPlus,
  FiSave,
  FiTag,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";

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

const toFaNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

function richTextHasContent(value: string) {
  return (
    value
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, "")
      .trim().length > 0
  );
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

function countCompletedFields(form: CharacterFormState) {
  const checks = [
    form.name.trim(),
    form.title.trim(),
    form.role.trim(),
    form.dynasty.trim(),
    form.nationality.trim(),
    form.nameMeaning.trim(),
    form.lineageGroup.trim(),
    richTextHasContent(form.shortDescription),
    richTextHasContent(form.fullDescription),
    richTextHasContent(form.quote),
    form.portraitImagePreview,
    form.sceneImagePreview,
    form.epithets.length,
    form.traits.length,
    form.achievements.length,
    form.enemies.length,
    form.fatherId || form.father,
    form.motherId || form.mother,
    form.spouseIds.length,
    form.childrenIds.length,
    form.siblingIds.length,
  ];

  return checks.filter(Boolean).length;
}

export function CharacterForm({ character }: CharacterFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<CharacterFormState>(() =>
    createInitialForm(character),
  );
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [relationOptions, setRelationOptions] = useState<CharacterSummary[]>(
    [],
  );
  const [relationOptionsStatus, setRelationOptionsStatus] = useState(
    "در حال دریافت شخصیت‌ها...",
  );
  const [lineageOptions, setLineageOptions] = useState<Lineage[]>([]);
  const [relationshipOptions, setRelationshipOptions] = useState<
    Relationship[]
  >([]);

  const portraitObjectUrl = useRef("");
  const sceneObjectUrl = useRef("");

  const completion = useMemo(() => {
    const total = 20;
    const completed = countCompletedFields(form);
    return Math.min(100, Math.round((completed / total) * 100));
  }, [form]);

  const slugPreview = useMemo(() => createSlug(form.name), [form.name]);

  const isEdit = Boolean(character);

  const requiredChecks = useMemo(
    () => [
      { label: "نام شخصیت", done: Boolean(form.name.trim()) },
      { label: "عنوان کوتاه", done: Boolean(form.title.trim()) },
      { label: "نقش", done: Boolean(form.role.trim()) },
      { label: "دودمان", done: Boolean(form.dynasty.trim()) },
      ...(!isEdit
        ? [
            {
              label: "خلاصه کوتاه",
              done: richTextHasContent(form.shortDescription),
            },
            {
              label: "روایت کامل",
              done: richTextHasContent(form.fullDescription),
            },
            { label: "عکس پرتره", done: Boolean(form.portraitImagePreview) },
            { label: "بنر", done: Boolean(form.sceneImagePreview) },
          ]
        : []),
    ],
    [form, isEdit],
  );

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
    field:
      | "epithets"
      | "achievements"
      | "enemies"
      | "spouseIds"
      | "childrenIds"
      | "siblingIds",
    value: string[],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateTraits(value: CharacterTrait[]) {
    setForm((current) => ({ ...current, traits: value }));
  }

  function updateFile(
    field: "portraitImage" | "sceneImage",
    file: File | null,
  ) {
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
    <form onSubmit={handleSubmit} className="grid gap-5">
      <CharacterFormHeader character={character} slugPreview={slugPreview} />

      {status ? <StatusMessage message={status} /> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <div className="grid gap-5 xl:order-1">
          <FormSection
            icon={<FiInfo aria-hidden className="size-4" />}
            title="اطلاعات اصلی"
            description="اطلاعات هویتی و نمایشی شخصیت را وارد کن."
          >
            <div className="grid gap-4 md:grid-cols-2">
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

                    if (
                      !form.lineageGroup ||
                      form.lineageGroup === form.dynasty
                    ) {
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

          <FormSection
            icon={<FiUsers aria-hidden className="size-4" />}
            title="تبار و روابط خانوادگی"
            description="ارتباطات خانوادگی و تبارنامه‌ای شخصیت را مدیریت کن."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="گروه تبارنامه / دودمان">
                <AdminTextInput
                  value={form.lineageGroup}
                  onChange={(event) =>
                    updateField("lineageGroup", event.target.value)
                  }
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
                      label: `${lineage.title}${
                        lineage.isApproved ? " - منتشر شده" : " - پیش‌نویس"
                      }`,
                      value: lineage.id,
                    })),
                  ]}
                />
              </AdminField>

              {relationOptionsStatus ? (
                <div className="md:col-span-2 rounded-xl border border-shah-gold-500/14 bg-shah-gold-500/8 px-3.5 py-2.5 text-[12px] font-black leading-6 text-muted-foreground dark:border-white/10 dark:bg-white/4">
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
                onChange={(value) =>
                  updateTags("childrenIds", value as string[])
                }
              />

              <div className="md:col-span-2">
                <CharacterRelationSelect
                  label="خواهر/برادرها"
                  multiple
                  value={form.siblingIds}
                  options={relationOptions}
                  currentCharacterId={character?.id}
                  onChange={(value) =>
                    updateTags("siblingIds", value as string[])
                  }
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

          <FormSection
            icon={<FiBookOpen aria-hidden className="size-4" />}
            title="روایت"
            description="خلاصه، روایت کامل و نقل‌قول‌های مربوط به شخصیت."
          >
            <div className="grid gap-4">
              <AdminField label="خلاصه کوتاه" required={!character}>
                <RichTextEditor
                  minHeightClass="min-h-28"
                  placeholder="خلاصه کوتاه شخصیت را وارد کنید..."
                  value={form.shortDescription}
                  onChange={(value) => updateField("shortDescription", value)}
                />
              </AdminField>

              <AdminField label="روایت کامل" required={!character}>
                <RichTextEditor
                  allowImages
                  minHeightClass="min-h-48"
                  placeholder="روایت کامل شخصیت را با متن، شعر، لینک و تصویر وارد کنید..."
                  value={form.fullDescription}
                  onChange={(value) => updateField("fullDescription", value)}
                />
              </AdminField>

              <AdminField label="بیت یا نقل قول">
                <RichTextEditor
                  minHeightClass="min-h-20"
                  placeholder="بیت یا نقل قول را وارد کنید..."
                  value={form.quote}
                  onChange={(value) => updateField("quote", value)}
                />
              </AdminField>
            </div>
          </FormSection>

          <FormSection
            icon={<FiTag aria-hidden className="size-4" />}
            title="ویژگی‌ها و دستاوردها"
            description="ویژگی‌های شخصیتی، دشمنان و دستاوردهای مهم را ثبت کن."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <span className="mb-2 block text-[13px] font-bold text-foreground">
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

          <FormSection
            icon={<FiImage aria-hidden className="size-4" />}
            title="رسانه"
            description="پرتره و تصویر صحنه، ظاهر اصلی شخصیت را در سایت می‌سازند."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <AdminImageUpload
                label="عکس پرتره"
                required={!character}
                preview={form.portraitImagePreview}
                ratioClass="aspect-square"
                onChange={(file) => updateFile("portraitImage", file)}
                onRemove={() => removeFile("portraitImage")}
              />

              <AdminImageUpload
                label="بنر"
                required={!character}
                preview={form.sceneImagePreview}
                ratioClass="aspect-[16/9]"
                onChange={(file) => updateFile("sceneImage", file)}
                onRemove={() => removeFile("sceneImage")}
              />
            </div>
          </FormSection>
        </div>

        <aside className="grid gap-4 xl:sticky xl:top-20 xl:order-2 xl:self-start">
          <CharacterFormSidebar
            completion={completion}
            isEdit={isEdit}
            isSaving={isSaving}
            onCancel={() => router.push("/admin/characters")}
            requiredChecks={requiredChecks}
            slugPreview={slugPreview}
          />
        </aside>
      </div>
    </form>
  );
}

function CharacterFormHeader({
  character,
  slugPreview,
}: {
  character?: Character;
  slugPreview: string;
}) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-shah-gold-500/14 bg-white/78 px-4 py-3.5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-shah-gold-500/25 bg-shah-gold-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-shah-gold-800 dark:text-shah-gold-200">
          <span className="size-1.5 rounded-full bg-shah-gold-500" />
          {character ? "Edit" : "New"}
        </span>
        <h1 className="text-base font-black text-foreground">
          {character ? "ویرایش شخصیت" : "ایجاد شخصیت جدید"}
        </h1>
      </div>

      {slugPreview ? (
        <div className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-shah-gold-500/14 bg-shah-gold-500/6 px-3 py-1.5 text-[11px] font-bold text-muted-foreground dark:border-white/10 dark:bg-white/4">
          <FiLink aria-hidden className="size-3.5 shrink-0 text-shah-gold-700 dark:text-shah-gold-300" />
          <span className="truncate text-foreground/80" dir="ltr">
            {slugPreview}
          </span>
        </div>
      ) : null}
    </section>
  );
}

function CharacterFormSidebar({
  completion,
  isEdit,
  isSaving,
  onCancel,
  requiredChecks,
  slugPreview,
}: {
  completion: number;
  isEdit: boolean;
  isSaving: boolean;
  onCancel: () => void;
  requiredChecks: { label: string; done: boolean }[];
  slugPreview: string;
}) {
  const pendingCount = requiredChecks.filter((item) => !item.done).length;

  return (
    <section className="relative rounded-3xl border border-shah-gold-500/16 bg-white/82 p-4 shadow-lg shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-[13px] font-black shadow-md transition active:scale-[0.98] ${
              isSaving
                ? "cursor-not-allowed bg-shah-lapis-900/50 text-white/70"
                : "bg-shah-lapis-900 text-shah-gold-100 hover:-translate-y-0.5 hover:bg-shah-lapis-800 hover:text-white dark:bg-shah-gold-500 dark:text-shah-black-950 dark:hover:bg-shah-gold-400"
            }`}
          >
            {isSaving ? (
              <FiLoader aria-hidden className="size-4 animate-spin" />
            ) : (
              <FiSave aria-hidden className="size-4" />
            )}
            {isSaving
              ? "در حال ذخیره..."
              : isEdit
                ? "ذخیره تغییرات"
                : "ایجاد شخصیت"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-shah-gold-500/14 bg-transparent px-4 text-[12px] font-bold text-muted-foreground transition hover:bg-muted/60 dark:border-white/10 dark:hover:bg-white/6"
          >
            <FiArrowRight aria-hidden className="size-3.5" />
            انصراف و بازگشت
          </button>
        </div>

        <div className="h-px bg-shah-gold-500/10 dark:bg-white/8" />

        <div>
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-black">
            <span className="text-muted-foreground">تکمیل فرم</span>
            <span className="text-foreground">{toFaNumber(completion)}٪</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-shah-gold-500/12">
            <div
              className="h-full rounded-full bg-linear-to-l from-shah-gold-500 to-shah-lapis-700 transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-muted-foreground">
              فیلدهای الزامی
            </span>
            {pendingCount > 0 ? (
              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-black text-red-600 dark:text-red-300">
                {toFaNumber(pendingCount)} باقی‌مانده
              </span>
            ) : (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                تکمیل
              </span>
            )}
          </div>

          <div className="grid gap-1">
            {requiredChecks.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-lg border border-shah-gold-500/10 bg-white/50 px-2.5 py-1.5 dark:border-white/8 dark:bg-white/2"
              >
                {item.done ? (
                  <FiCheckCircle
                    aria-hidden
                    className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-300"
                  />
                ) : (
                  <span className="size-3.5 shrink-0 rounded-full border-2 border-muted-foreground/25" />
                )}
                <span
                  className={`truncate text-[11px] font-bold ${
                    item.done
                      ? "text-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {slugPreview ? (
          <div className="grid gap-1">
            <span className="text-[11px] font-black text-muted-foreground">
              پیش‌نمایش نامک
            </span>
            <div className="flex items-center gap-1.5 rounded-lg border border-shah-gold-500/12 bg-shah-gold-500/6 px-2.5 py-1.5 dark:border-white/8 dark:bg-white/3">
              <FiLink aria-hidden className="size-3 shrink-0 text-shah-gold-700 dark:text-shah-gold-300" />
              <span className="truncate text-[11px] font-bold text-foreground/75" dir="ltr">
                {slugPreview}
              </span>
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-shah-gold-500/10 bg-shah-gold-500/5 px-3 py-2.5 text-[10.5px] font-medium leading-5 text-muted-foreground dark:border-white/8 dark:bg-white/2">
          تغییرات پس از ذخیره بلافاصله در سایت اعمال می‌شوند. پیش از خروج از
          صفحه، از ذخیره اطلاعات مطمئن شوید.
        </div>
      </div>
    </section>
  );
}

function StatusMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-500/16 bg-red-50/90 px-3.5 py-2.5 text-[12px] font-bold leading-6 text-red-700 shadow-sm dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-200">
      <FiAlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
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
  description?: string;
  icon?: ReactNode;
  title: string;
}) {
  return (
    <section className="relative rounded-3xl border border-shah-gold-500/14 bg-white/78 p-4 text-card-foreground shadow-lg shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5 md:p-5">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
        <div className="absolute -left-14 -top-14 size-40 rounded-full bg-shah-gold-500/8 blur-3xl" />
      </div>

      <div className="relative mb-4 flex items-start gap-3">
        {icon ? (
          <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-shah-gold-500/14 bg-shah-gold-500/10 text-shah-gold-800 dark:border-shah-gold-300/15 dark:text-shah-gold-200">
            {icon}
          </div>
        ) : null}

        <div className="min-w-0">
          <h2 className="text-sm font-black text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 text-[11px] font-bold leading-5 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="relative">{children}</div>
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
    <div className="grid gap-1.5">
      <span className="text-[13px] font-bold text-foreground">{label}</span>

      <div className="group flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-shah-gold-500/14 bg-white/65 px-2.5 py-1.5 transition focus-within:border-shah-gold-500/40 focus-within:bg-white focus-within:ring-2 focus-within:ring-shah-gold-500/15 dark:border-white/10 dark:bg-black/16 dark:focus-within:bg-black/24">
        {values.map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => onChange(values.filter((item) => item !== value))}
            className="group/tag inline-flex items-center gap-1.5 rounded-full border border-shah-gold-500/22 bg-shah-gold-500/10 px-2.5 py-1 text-[11px] font-bold text-shah-gold-900 transition hover:border-red-400/35 hover:bg-red-500/10 hover:text-red-700 dark:text-shah-gold-100 dark:hover:text-red-200"
          >
            <span>{value}</span>
            <FiTrash2
              aria-hidden
              className="size-3 opacity-50 transition group-hover/tag:opacity-100"
            />
          </button>
        ))}

        <div className="flex min-w-32 flex-1 items-center gap-1.5">
          {values.length === 0 ? (
            <FiPlus
              aria-hidden
              className="size-3.5 shrink-0 text-muted-foreground/70"
            />
          ) : null}

          <input
            value={draft}
            onBlur={() => addTag(draft)}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={values.length ? "" : placeholder}
            className="min-w-24 flex-1 bg-transparent px-1 py-1 text-[12px] font-bold text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <p className="text-[10px] font-bold text-muted-foreground">
        برای افزودن، Enter یا ویرگول را بزن.
      </p>
    </div>
  );
}

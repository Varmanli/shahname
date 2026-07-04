"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiGitBranch,
  FiInfo,
  FiSave,
  FiToggleLeft,
  FiUsers,
  FiX,
} from "react-icons/fi";

import {
  AdminField,
  AdminTextarea,
  AdminTextInput,
} from "@/components/admin/admin-form-controls";
import { CharacterRelationSelect } from "@/components/admin/character-relation-select";
import { RelationshipManager } from "@/components/admin/relationship-manager";
import type { CharacterSummary } from "@/types/character";
import type { Lineage } from "@/types/lineage";
import type { Relationship } from "@/types/relationship";

type LineageFormProps = {
  lineage?: Lineage;
  characterIds?: string[];
  characterOptions: CharacterSummary[];
  relationships?: Relationship[];
};

const toFaNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

export function LineageForm({
  characterIds = [],
  characterOptions,
  lineage,
  relationships = [],
}: LineageFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(lineage?.title ?? "");
  const [description, setDescription] = useState(lineage?.description ?? "");
  const [isApproved, setIsApproved] = useState(lineage?.isApproved ?? false);
  const [order, setOrder] = useState(String(lineage?.order ?? 0));
  const [selectedCharacterIds, setSelectedCharacterIds] =
    useState(characterIds);
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const completion = useMemo(() => {
    const checks = [
      title.trim(),
      description.trim(),
      selectedCharacterIds.length,
      order.trim(),
      isApproved,
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [description, isApproved, order, selectedCharacterIds.length, title]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setStatus("عنوان تبارنامه الزامی است.");
      return;
    }

    setIsSaving(true);
    setStatus("");

    const response = await fetch(
      lineage ? `/api/lineages/${lineage.id}` : "/api/lineages",
      {
        body: JSON.stringify({
          title,
          description,
          isApproved,
          order: Number(order) || 0,
          characterIds: selectedCharacterIds,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: lineage ? "PUT" : "POST",
      },
    );

    const payload = await response.json();

    setIsSaving(false);

    if (!response.ok) {
      setStatus(payload.message ?? "ذخیره تبارنامه با خطا روبه‌رو شد.");
      return;
    }

    router.push("/admin/lineages");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <LineageFormHero
        characterCount={selectedCharacterIds.length}
        completion={completion}
        isApproved={isApproved}
        isEdit={Boolean(lineage)}
        title={title}
      />

      {status ? <StatusMessage message={status} /> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <div className="grid gap-5">
          <FormSection
            icon={<FiInfo aria-hidden className="size-4" />}
            title="اطلاعات تبارنامه"
            description="عنوان، توضیح کوتاه و وضعیت انتشار تبارنامه را مشخص کن."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="عنوان تبارنامه" required>
                <AdminTextInput
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="مثلا پیشدادیان"
                />
              </AdminField>

              <AdminField label="ترتیب نمایش">
                <AdminTextInput
                  inputMode="numeric"
                  value={order}
                  onChange={(event) => setOrder(event.target.value)}
                  placeholder="مثلا ۱"
                />
              </AdminField>

              <div className="md:col-span-2">
                <AdminField label="توضیح">
                  <AdminTextarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="توضیح کوتاه برای نمایش بالای درخت"
                    className="min-h-28 text-sm"
                  />
                </AdminField>
              </div>

              <div className="md:col-span-2">
                <PublishSwitch checked={isApproved} onChange={setIsApproved} />
              </div>
            </div>
          </FormSection>

          <FormSection
            icon={<FiUsers aria-hidden className="size-4" />}
            title="شخصیت‌های تبارنامه"
            description="شخصیت‌هایی را انتخاب کن که باید در این lineage نمایش داده شوند."
          >
            <CharacterRelationSelect
              label="شخصیت‌های این تبارنامه"
              multiple
              value={selectedCharacterIds}
              options={characterOptions}
              onChange={(value) => setSelectedCharacterIds(value as string[])}
            />

            <div className="mt-4 rounded-2xl border border-shah-gold-500/12 bg-shah-gold-500/8 px-4 py-3 text-xs font-bold leading-6 text-muted-foreground dark:border-white/10 dark:bg-white/[0.035]">
              رابطه پدر/مادر هر شخصیت همچنان در فرم خود شخصیت تنظیم می‌شود. این
              بخش فقط تعیین می‌کند چه شخصیت‌هایی عضو این تبارنامه باشند.
            </div>
          </FormSection>

          {lineage ? (
            <div className="[&>section]:border-shah-gold-500/14 [&>section]:bg-white/72 [&>section]:shadow-xl [&>section]:shadow-shah-black-900/5 [&>section]:backdrop-blur-xl dark:[&>section]:border-white/10 dark:[&>section]:bg-white/4.5">
              <RelationshipManager
                characterOptions={characterOptions.filter((character) =>
                  selectedCharacterIds.includes(character.id),
                )}
                initialRelationships={relationships}
                title="رابطه‌های نمایشی این تبارنامه"
              />
            </div>
          ) : null}
        </div>

        <LineageSidebar
          characterCount={selectedCharacterIds.length}
          completion={completion}
          description={description}
          isApproved={isApproved}
          isEdit={Boolean(lineage)}
          isSaving={isSaving}
          order={order}
          title={title}
          onCancel={() => router.push("/admin/lineages")}
        />
      </div>
    </form>
  );
}

function LineageFormHero({
  characterCount,
  completion,
  isApproved,
  isEdit,
  title,
}: {
  characterCount: number;
  completion: number;
  isApproved: boolean;
  isEdit: boolean;
  title: string;
}) {
  return (
    <section className="relative isolate overflow-hidden rounded-[1.8rem] border border-shah-gold-500/14 bg-shah-lapis-950 px-5 py-5 text-white shadow-xl shadow-shah-lapis-950/20 md:px-6">
      <div className="pointer-events-none absolute -left-20 -top-24 size-56 rounded-full bg-shah-gold-400/18 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-10 size-60 rounded-full bg-blue-500/16 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-shah-gold-200">
            <FiGitBranch aria-hidden className="size-3.5" />
            {isEdit ? "Edit Lineage" : "New Lineage"}
          </div>

          <h1 className="mt-3 truncate text-2xl font-black md:text-3xl">
            {title || (isEdit ? "ویرایش تبارنامه" : "ایجاد تبارنامه جدید")}
          </h1>

          <p className="mt-2 max-w-2xl text-xs font-bold leading-6 text-white/62 md:text-sm">
            ساختار نمایش تبارنامه، اعضای آن و وضعیت انتشار را از اینجا مدیریت
            کن.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 lg:w-104">
          <HeroStat label="تکمیل" value={`${toFaNumber(completion)}٪`} />
          <HeroStat label="شخصیت‌ها" value={toFaNumber(characterCount)} />
          <HeroStat label="وضعیت" value={isApproved ? "منتشر" : "پیش‌نویس"} />
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

function LineageSidebar({
  characterCount,
  completion,
  description,
  isApproved,
  isEdit,
  isSaving,
  order,
  title,
  onCancel,
}: {
  characterCount: number;
  completion: number;
  description: string;
  isApproved: boolean;
  isEdit: boolean;
  isSaving: boolean;
  order: string;
  title: string;
  onCancel: () => void;
}) {
  return (
    <aside className="grid gap-4 xl:sticky xl:top-24">
      <section className="rounded-[1.7rem] border border-shah-gold-500/14 bg-white/72 p-4 shadow-xl shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-shah-gold-800 dark:text-shah-gold-200">
          Actions
        </p>

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
            {isSaving
              ? "در حال ذخیره..."
              : isEdit
                ? "ذخیره تغییرات"
                : "ایجاد تبارنامه"}
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
          <ChecklistItem done={Boolean(title.trim())} label="عنوان" />
          <ChecklistItem done={Boolean(order.trim())} label="ترتیب نمایش" />
          <ChecklistItem done={Boolean(description.trim())} label="توضیح" />
          <ChecklistItem
            done={characterCount > 0}
            label={`${toFaNumber(characterCount)} شخصیت انتخاب شده`}
          />
          <ChecklistItem
            done={isApproved}
            label={isApproved ? "منتشر شده" : "هنوز پیش‌نویس است"}
          />
        </div>
      </section>

      <section className="rounded-[1.7rem] border border-shah-gold-500/14 bg-shah-lapis-950 p-4 text-white shadow-xl shadow-shah-lapis-950/15">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-shah-gold-300">
          Tips
        </p>

        <div className="mt-3 grid gap-3 text-xs font-bold leading-6 text-white/62">
          <p>
            تبارنامه فقط گروه نمایش را مشخص می‌کند؛ رابطه‌های پدر و مادر از فرم
            شخصیت‌ها خوانده می‌شود.
          </p>
          <p>
            قبل از انتشار، مطمئن شو شخصیت‌های اصلی عضو این تبارنامه انتخاب
            شده‌اند.
          </p>
        </div>

        <div className="mt-4 inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] font-black text-white/62">
          {isEdit ? "حالت ویرایش" : "حالت ایجاد"}
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

function PublishSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`group flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-right transition ${
        checked
          ? "border-emerald-500/18 bg-emerald-500/8"
          : "border-shah-gold-500/12 bg-white/55 dark:border-white/10 dark:bg-white/[0.035]"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-2xl ${
            checked
              ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-200"
              : "bg-shah-gold-500/10 text-shah-gold-800 dark:text-shah-gold-200"
          }`}
        >
          {checked ? (
            <FiCheckCircle aria-hidden className="size-5" />
          ) : (
            <FiToggleLeft aria-hidden className="size-5" />
          )}
        </span>

        <span className="min-w-0">
          <span className="block text-sm font-black text-foreground">
            انتشار در صفحه عمومی
          </span>
          <span className="mt-1 block text-xs font-bold leading-5 text-muted-foreground">
            {checked
              ? "این تبارنامه در سایت عمومی قابل مشاهده است."
              : "فعلاً به صورت پیش‌نویس باقی می‌ماند."}
          </span>
        </span>
      </span>

      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-emerald-500" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-1 size-5 rounded-full bg-white shadow-md transition ${
            checked ? "right-6" : "right-1"
          }`}
        />
      </span>
    </button>
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
    <section className="rounded-[1.7rem] border border-shah-gold-500/14 bg-white/72 p-4 text-card-foreground shadow-xl shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5 md:p-5">
      <div className="mb-5 flex items-start gap-3">
        {icon ? (
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl border border-shah-gold-500/14 bg-shah-gold-500/10 text-shah-gold-800 dark:border-shah-gold-300/15 dark:text-shah-gold-200">
            {icon}
          </div>
        ) : null}

        <div>
          <h2 className="text-base font-black text-foreground md:text-lg">
            {title}
          </h2>

          {description ? (
            <p className="mt-1 text-xs font-bold leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {children}
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

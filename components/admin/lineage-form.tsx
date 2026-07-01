"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

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
  const [selectedCharacterIds, setSelectedCharacterIds] = useState(characterIds);
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
    <form onSubmit={handleSubmit} className="grid gap-6">
      {status ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {status}
        </div>
      ) : null}

      <section className="grid gap-5 rounded-[1.5rem] border border-border bg-card p-6 text-card-foreground shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
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
            />
          </AdminField>
          <div className="md:col-span-2">
            <AdminField label="توضیح">
              <AdminTextarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="توضیح کوتاه برای نمایش بالای درخت"
              />
            </AdminField>
          </div>
          <label className="inline-flex w-fit items-center gap-3 rounded-2xl border border-border bg-muted/35 px-4 py-3 text-sm font-black">
            <input
              type="checkbox"
              checked={isApproved}
              onChange={(event) => setIsApproved(event.target.checked)}
              className="size-5 accent-shah-gold-500"
            />
            انتشار در صفحه عمومی
          </label>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-border bg-card p-6 text-card-foreground shadow-sm">
        <CharacterRelationSelect
          label="شخصیت‌های این تبارنامه"
          multiple
          value={selectedCharacterIds}
          options={characterOptions}
          onChange={(value) => setSelectedCharacterIds(value as string[])}
        />
        <p className="mt-3 text-xs font-bold leading-6 text-muted-foreground">
          رابطه پدر/مادر هر شخصیت همچنان در فرم خود شخصیت تنظیم می‌شود. این بخش فقط تعیین می‌کند چه شخصیت‌هایی عضو این lineage باشند.
        </p>
      </section>

      {lineage ? (
        <RelationshipManager
          characterOptions={characterOptions.filter((character) =>
            selectedCharacterIds.includes(character.id),
          )}
          initialRelationships={relationships}
          title="رابطه‌های نمایشی این تبارنامه"
        />
      ) : null}

      <div className="sticky bottom-4 flex justify-end gap-4 rounded-2xl border border-border bg-card/90 p-5 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-shah-black-950/80">
        <button
          type="button"
          onClick={() => router.push("/admin/lineages")}
          className="h-12 rounded-xl border border-border px-6 text-base font-bold text-foreground transition hover:bg-muted/70"
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="h-12 rounded-xl bg-primary px-7 text-base font-bold text-white shadow-md transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 dark:bg-shah-gold-500 dark:text-shah-black-950"
        >
          {isSaving ? "در حال ذخیره..." : "ذخیره تبارنامه"}
        </button>
      </div>
    </form>
  );
}

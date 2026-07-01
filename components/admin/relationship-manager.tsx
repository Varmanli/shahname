"use client";

import { useMemo, useState } from "react";

import {
  AdminSelect,
  AdminTextarea,
  AdminTextInput,
} from "@/components/admin/admin-form-controls";
import type { CharacterSummary } from "@/types/character";
import type {
  Relationship,
  RelationshipConfidence,
  RelationshipType,
} from "@/types/relationship";

type RelationshipManagerProps = {
  characterOptions: CharacterSummary[];
  initialRelationships: Relationship[];
  fixedCharacterId?: string;
  title?: string;
};

const relationshipLabels: Record<RelationshipType, string> = {
  parent_child: "پدر/مادر و فرزند",
  spouse: "همسر",
  indirect_lineage: "وابستگی دودمانی",
  ally: "همراه / متحد",
  other: "سایر",
};

const confidenceLabels: Record<RelationshipConfidence, string> = {
  confirmed: "تاییدشده",
  inferred: "استنباطی",
  legendary: "روایی / اسطوره‌ای",
};

export function RelationshipManager({
  characterOptions,
  fixedCharacterId,
  initialRelationships,
  title = "مدیریت رابطه‌های روایی",
}: RelationshipManagerProps) {
  const [relationships, setRelationships] = useState(initialRelationships);
  const [sourceCharacterId, setSourceCharacterId] = useState(fixedCharacterId ?? "");
  const [targetCharacterId, setTargetCharacterId] = useState("");
  const [type, setType] = useState<RelationshipType>("indirect_lineage");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [confidence, setConfidence] = useState<RelationshipConfidence>("inferred");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const characterById = useMemo(
    () => new Map(characterOptions.map((character) => [character.id, character])),
    [characterOptions],
  );
  const selectableTargets = characterOptions.filter(
    (character) => character.id !== (fixedCharacterId ?? sourceCharacterId),
  );

  async function saveRelationship() {
    if (!sourceCharacterId || !targetCharacterId) {
      setStatus("مبدا و مقصد رابطه را انتخاب کنید.");
      return;
    }

    setIsSaving(true);
    setStatus("");

    const response = await fetch("/api/relationships", {
      body: JSON.stringify({
        sourceCharacterId,
        targetCharacterId,
        type,
        label,
        description,
        confidence,
        order: relationships.length + 1,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const payload = await response.json();

    setIsSaving(false);

    if (!response.ok) {
      setStatus(payload.message ?? "ذخیره رابطه با خطا روبه‌رو شد.");
      return;
    }

    setRelationships((current) => [...current, payload.relationship]);
    setTargetCharacterId("");
    setLabel("");
    setDescription("");
  }

  async function removeRelationship(relationship: Relationship) {
    const response = await fetch(`/api/relationships/${relationship.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const payload = await response.json();
      setStatus(payload.message ?? "حذف رابطه با خطا روبه‌رو شد.");
      return;
    }

    setRelationships((current) =>
      current.filter((item) => item.id !== relationship.id),
    );
    setStatus("");
  }

  return (
    <section className="grid gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div>
        <h2 className="text-lg font-black">{title}</h2>
        <p className="mt-2 text-xs font-bold leading-6 text-muted-foreground">
          این روابط برای پیوندهای غیر از پدر/مادر مستقیم استفاده می‌شوند؛ مثل همسر، وابستگی دودمانی یا همراهی.
        </p>
      </div>

      {status ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {status}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {!fixedCharacterId ? (
          <label className="grid gap-2 text-sm font-black">
            شخصیت مبدا
            <AdminSelect
              value={sourceCharacterId}
              onChange={setSourceCharacterId}
              placeholder="انتخاب شخصیت"
              options={[
                { label: "انتخاب شخصیت", value: "" },
                ...characterOptions.map((character) => ({
                  label: character.name,
                  value: character.id,
                })),
              ]}
            />
          </label>
        ) : null}
        <label className="grid gap-2 text-sm font-black">
          شخصیت مقصد
          <AdminSelect
            value={targetCharacterId}
            onChange={setTargetCharacterId}
            placeholder="انتخاب شخصیت"
            options={[
              { label: "انتخاب شخصیت", value: "" },
              ...selectableTargets.map((character) => ({
                label: character.name,
                value: character.id,
              })),
            ]}
          />
        </label>
        <label className="grid gap-2 text-sm font-black">
          نوع رابطه
          <AdminSelect
            value={type}
            onChange={(value) => setType(value as RelationshipType)}
            placeholder="نوع رابطه"
            options={Object.entries(relationshipLabels).map(([value, text]) => ({
              label: text,
              value,
            }))}
          />
        </label>
        <label className="grid gap-2 text-sm font-black">
          میزان قطعیت
          <AdminSelect
            value={confidence}
            onChange={(value) =>
              setConfidence(value as RelationshipConfidence)
            }
            placeholder="میزان قطعیت"
            options={Object.entries(confidenceLabels).map(([value, text]) => ({
              label: text,
              value,
            }))}
          />
        </label>
        <label className="grid gap-2 text-sm font-black">
          برچسب
          <AdminTextInput
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="مثلا وابستگی با میانجی"
          />
        </label>
        <label className="grid gap-2 text-sm font-black md:col-span-2">
          توضیح
          <AdminTextarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="توضیح تاریخی/روایی درباره این رابطه"
          />
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={isSaving}
          onClick={saveRelationship}
          className="h-11 rounded-xl bg-shah-lapis-800 px-5 text-sm font-black text-shah-gold-100 transition hover:bg-shah-lapis-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-shah-gold-500 dark:text-shah-black-950"
        >
          {isSaving ? "در حال ذخیره..." : "افزودن رابطه"}
        </button>
      </div>

      {relationships.length ? (
        <div className="grid gap-3">
          {relationships.map((relationship) => (
            <div
              key={relationship.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/25 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="text-sm font-bold leading-7">
                <span className="font-black">
                  {characterById.get(relationship.sourceCharacterId)?.name ?? "نامشخص"}
                </span>
                <span className="px-2 text-muted-foreground">←</span>
                <span className="font-black">
                  {characterById.get(relationship.targetCharacterId)?.name ?? "نامشخص"}
                </span>
                <span className="mx-2 rounded-full bg-shah-gold-500/10 px-2 py-1 text-xs text-shah-gold-800 dark:text-shah-gold-200">
                  {relationship.label || relationshipLabels[relationship.type]}
                </span>
                {relationship.description ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {relationship.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => removeRelationship(relationship)}
                className="h-10 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-black text-red-700 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm font-bold text-muted-foreground">
          هنوز رابطه مستقلی ثبت نشده است.
        </div>
      )}
    </section>
  );
}

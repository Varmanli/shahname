"use client";

import { useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiGitPullRequest,
  FiLink,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

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
  const [sourceCharacterId, setSourceCharacterId] = useState(
    fixedCharacterId ?? "",
  );
  const [targetCharacterId, setTargetCharacterId] = useState("");
  const [type, setType] = useState<RelationshipType>("indirect_lineage");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [confidence, setConfidence] =
    useState<RelationshipConfidence>("inferred");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const characterById = useMemo(
    () =>
      new Map(characterOptions.map((character) => [character.id, character])),
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
    <section className="rounded-[1.7rem] border border-shah-gold-500/14 bg-white/72 p-4 text-card-foreground shadow-xl shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5 md:p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl border border-shah-gold-500/14 bg-shah-gold-500/10 text-shah-gold-800 dark:border-shah-gold-300/15 dark:text-shah-gold-200">
            <FiGitPullRequest aria-hidden className="size-4" />
          </div>

          <div>
            <h2 className="text-base font-black text-foreground">{title}</h2>
            <p className="mt-1 max-w-2xl text-xs font-bold leading-6 text-muted-foreground">
              رابطه‌های غیرمستقیم یا روایی مثل همسر، متحد، وابستگی دودمانی یا
              پیوندهای اسطوره‌ای را از اینجا ثبت کن.
            </p>
          </div>
        </div>

        <div className="inline-flex h-8 shrink-0 items-center gap-1.5 self-start rounded-full border border-shah-gold-500/12 bg-shah-gold-500/8 px-3 text-[11px] font-black text-shah-gold-800 dark:border-shah-gold-300/12 dark:text-shah-gold-100">
          <FiLink aria-hidden className="size-3.5" />
          {relationships.length} رابطه
        </div>
      </div>

      {status ? <StatusMessage message={status} /> : null}

      <div className="rounded-[1.35rem] border border-shah-gold-500/12 bg-white/48 p-3 dark:border-white/8 dark:bg-black/12 md:p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-foreground">
              افزودن رابطه جدید
            </h3>
            <p className="mt-1 text-[11px] font-bold text-muted-foreground">
              مقصد، نوع رابطه و میزان قطعیت را مشخص کن.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {!fixedCharacterId ? (
            <CompactField label="شخصیت مبدا">
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
            </CompactField>
          ) : null}

          <CompactField label="شخصیت مقصد">
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
          </CompactField>

          <CompactField label="نوع رابطه">
            <AdminSelect
              value={type}
              onChange={(value) => setType(value as RelationshipType)}
              placeholder="نوع رابطه"
              options={Object.entries(relationshipLabels).map(
                ([value, text]) => ({
                  label: text,
                  value,
                }),
              )}
            />
          </CompactField>

          <CompactField label="میزان قطعیت">
            <AdminSelect
              value={confidence}
              onChange={(value) =>
                setConfidence(value as RelationshipConfidence)
              }
              placeholder="میزان قطعیت"
              options={Object.entries(confidenceLabels).map(
                ([value, text]) => ({
                  label: text,
                  value,
                }),
              )}
            />
          </CompactField>

          <CompactField label="برچسب">
            <AdminTextInput
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="مثلا وابستگی با میانجی"
            />
          </CompactField>

          <div className="md:col-span-2">
            <CompactField label="توضیح">
              <AdminTextarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="توضیح تاریخی/روایی درباره این رابطه"
              />
            </CompactField>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={isSaving}
            onClick={saveRelationship}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-4 text-xs font-black shadow-lg transition active:scale-95 ${
              isSaving
                ? "cursor-not-allowed bg-shah-lapis-900/55 text-white/65"
                : "bg-shah-lapis-900 text-shah-gold-100 shadow-shah-lapis-900/15 hover:-translate-y-0.5 hover:bg-shah-lapis-800 hover:text-white dark:bg-shah-gold-500 dark:text-shah-black-950 dark:hover:bg-shah-gold-400"
            }`}
          >
            <FiPlus aria-hidden className="size-4" />
            {isSaving ? "در حال ذخیره..." : "افزودن رابطه"}
          </button>
        </div>
      </div>

      <div className="mt-4">
        {relationships.length ? (
          <div className="grid gap-2">
            {relationships.map((relationship) => (
              <RelationshipCard
                key={relationship.id}
                relationship={relationship}
                sourceName={
                  characterById.get(relationship.sourceCharacterId)?.name ??
                  "نامشخص"
                }
                targetName={
                  characterById.get(relationship.targetCharacterId)?.name ??
                  "نامشخص"
                }
                onDelete={() => removeRelationship(relationship)}
              />
            ))}
          </div>
        ) : (
          <EmptyRelationships />
        )}
      </div>
    </section>
  );
}

function CompactField({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-black text-foreground">
      {label}
      {children}
    </label>
  );
}

function RelationshipCard({
  onDelete,
  relationship,
  sourceName,
  targetName,
}: {
  onDelete: () => void;
  relationship: Relationship;
  sourceName: string;
  targetName: string;
}) {
  return (
    <div className="group rounded-[1.15rem] border border-shah-gold-500/12 bg-white/58 p-3 transition hover:border-shah-gold-500/26 hover:bg-white/82 dark:border-white/8 dark:bg-white/[0.035] dark:hover:bg-white/6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-black">
            <span className="truncate text-foreground">{sourceName}</span>

            <span className="inline-flex size-6 items-center justify-center rounded-full bg-shah-gold-500/10 text-shah-gold-800 dark:text-shah-gold-100">
              ←
            </span>

            <span className="truncate text-foreground">{targetName}</span>

            <span className="rounded-full border border-shah-gold-500/14 bg-shah-gold-500/8 px-2.5 py-1 text-[10px] font-black text-shah-gold-800 dark:border-shah-gold-300/12 dark:text-shah-gold-100">
              {relationship.label || relationshipLabels[relationship.type]}
            </span>

            <span className="rounded-full border border-white/10 bg-muted/50 px-2.5 py-1 text-[10px] font-black text-muted-foreground dark:bg-white/4.5">
              {confidenceLabels[relationship.confidence ?? "inferred"]}
            </span>
          </div>

          {relationship.description ? (
            <p className="mt-2 line-clamp-2 text-xs font-bold leading-6 text-muted-foreground">
              {relationship.description}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-red-500/16 bg-red-500/8 px-3 text-[11px] font-black text-red-700 transition hover:bg-red-500 hover:text-white dark:border-red-400/16 dark:text-red-200"
        >
          <FiTrash2 aria-hidden className="size-3.5" />
          حذف
        </button>
      </div>
    </div>
  );
}

function StatusMessage({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-500/18 bg-red-50/90 px-4 py-3 text-xs font-black leading-6 text-red-700 shadow-lg shadow-red-950/5 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-200">
      <FiAlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function EmptyRelationships() {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-shah-gold-500/20 bg-white/42 px-4 py-8 text-center dark:border-white/10 dark:bg-white/3">
      <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-shah-gold-500/10 text-shah-gold-800 dark:text-shah-gold-200">
        <FiLink aria-hidden className="size-5" />
      </div>

      <p className="mt-3 text-xs font-black text-foreground">
        هنوز رابطه مستقلی ثبت نشده است.
      </p>

      <p className="mx-auto mt-1 max-w-sm text-[11px] font-bold leading-5 text-muted-foreground">
        بعد از انتخاب شخصیت مقصد و نوع رابطه، می‌توانی اولین پیوند روایی را
        اضافه کنی.
      </p>
    </div>
  );
}

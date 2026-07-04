"use client";

import { FiStar } from "react-icons/fi";

import { TRAIT_PRESETS } from "@/lib/traits";
import type {
  CharacterTrait,
  TraitCategory,
  TraitKey,
  TraitLevel,
} from "@/lib/traits";
import { cn } from "@/lib/utils";

type TraitSelectorProps = {
  value: CharacterTrait[];
  onChange: (value: CharacterTrait[]) => void;
};

const levelOptions: TraitLevel[] = [1, 2, 3, 4, 5];

const toneClasses = {
  gold: "text-shah-gold-300 border-shah-gold-400/25 bg-shah-gold-500/8",
  lapis: "text-blue-200 border-blue-300/20 bg-shah-lapis-700/25",
  red: "text-red-200 border-red-300/20 bg-red-500/8",
  emerald: "text-emerald-200 border-emerald-300/20 bg-emerald-500/8",
  violet: "text-violet-200 border-violet-300/20 bg-violet-500/8",
};

const categoryLabels: Record<TraitCategory, string> = {
  positive: "ویژگی‌های مثبت",
  neutral: "ویژگی‌های میانی",
  negative: "ویژگی‌های تاریک",
};

const categoryHints: Record<TraitCategory, string> = {
  positive: "نور، شکوه و پهلوانی",
  neutral: "سرنوشت، رمز و روایت‌های چندوجهی",
  negative: "تاریکی، تهدید و شرارت",
};

const traitGroups: TraitCategory[] = ["positive", "neutral", "negative"];

export function TraitSelector({ onChange, value }: TraitSelectorProps) {
  function getSelected(key: TraitKey) {
    return value.find((trait) => trait.key === key) ?? null;
  }

  function toggleTrait(key: TraitKey) {
    const selected = getSelected(key);

    if (selected) {
      onChange(value.filter((trait) => trait.key !== key));
      return;
    }

    onChange([...value, { key, level: 3, featured: false }]);
  }

  function updateLevel(key: TraitKey, level: TraitLevel) {
    onChange(
      value.map((trait) => (trait.key === key ? { ...trait, level } : trait)),
    );
  }

  function toggleFeatured(key: TraitKey) {
    onChange(
      value.map((trait) =>
        trait.key === key ? { ...trait, featured: !trait.featured } : trait,
      ),
    );
  }

  return (
    <div className="grid gap-5">
      {traitGroups.map((category) => {
        const presets = TRAIT_PRESETS.filter(
          (trait) => trait.category === category,
        );

        if (!presets.length) return null;

        const isNegative = category === "negative";
        const selectedCount = presets.filter((trait) =>
          getSelected(trait.key),
        ).length;

        return (
          <section key={category} className="grid gap-2.5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h3
                  className={cn(
                    "text-[13px] font-black",
                    isNegative ? "text-red-200" : "text-shah-gold-200",
                  )}
                >
                  {categoryLabels[category]}
                </h3>
                <p className="mt-0.5 text-[10px] font-semibold text-zinc-500">
                  {categoryHints[category]}
                </p>
              </div>

              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black",
                  isNegative
                    ? "border-red-400/25 bg-red-500/8 text-red-200"
                    : "border-shah-gold-400/20 bg-shah-gold-500/8 text-shah-gold-200",
                )}
              >
                {new Intl.NumberFormat("fa-IR").format(selectedCount)} /{" "}
                {new Intl.NumberFormat("fa-IR").format(presets.length)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
              {presets.map((trait) => {
                const selected = getSelected(trait.key);
                const Icon = trait.icon;
                const traitIsNegative = trait.category === "negative";

                return (
                  <div
                    role="button"
                    tabIndex={0}
                    key={trait.key}
                    onClick={() => toggleTrait(trait.key)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleTrait(trait.key);
                      }
                    }}
                    className={cn(
                      "group relative cursor-pointer rounded-xl border p-2.5 text-right transition-all duration-200",
                      "bg-[#101010]/70 hover:-translate-y-0.5",
                      traitIsNegative
                        ? "hover:border-red-300/40 hover:bg-red-500/8"
                        : "hover:border-shah-gold-300/40 hover:bg-shah-gold-500/5",
                      selected
                        ? traitIsNegative
                          ? "border-red-300/60 bg-red-500/8"
                          : "border-shah-gold-300/60 bg-shah-gold-500/6"
                        : traitIsNegative
                          ? "border-red-400/15"
                          : "border-white/10",
                    )}
                  >
                    {selected?.featured ? (
                      <span
                        className={cn(
                          "absolute left-2 top-2 grid size-4 place-items-center rounded-full border",
                          traitIsNegative
                            ? "border-red-300/30 bg-red-500/15 text-red-200"
                            : "border-shah-gold-300/30 bg-shah-gold-500/15 text-shah-gold-200",
                        )}
                        title="ویژگی شاخص"
                      >
                        <FiStar aria-hidden className="size-2.5" />
                      </span>
                    ) : null}

                    <div className="flex items-start gap-2.5">
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg border text-base transition group-hover:scale-105",
                          toneClasses[trait.tone],
                        )}
                      >
                        <Icon />
                      </div>

                      <div className="min-w-0 pt-0.5">
                        <h3 className="truncate text-[12px] font-black text-zinc-100">
                          {trait.label}
                        </h3>
                        <p className="mt-0.5 line-clamp-1 text-[10px] font-medium leading-4 text-zinc-500">
                          {trait.description}
                        </p>
                      </div>
                    </div>

                    {selected ? (
                      <div
                        className="relative z-10 mt-2.5 flex items-center justify-between gap-2 border-t border-white/8 pt-2"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="flex gap-1">
                          {levelOptions.map((level) => (
                            <button
                              type="button"
                              key={level}
                              onClick={() => updateLevel(trait.key, level)}
                              className={cn(
                                "h-2 w-2 rounded-full transition",
                                level <= selected.level
                                  ? traitIsNegative
                                    ? "bg-red-300"
                                    : "bg-shah-gold-300"
                                  : "bg-white/12 hover:bg-white/25",
                              )}
                              aria-label={`شدت ${level}`}
                            />
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleFeatured(trait.key)}
                          title="ویژگی شاخص"
                          aria-pressed={Boolean(selected.featured)}
                          className={cn(
                            "grid size-5 place-items-center rounded-full border transition",
                            selected.featured
                              ? traitIsNegative
                                ? "border-red-300/50 bg-red-500/15 text-red-200"
                                : "border-shah-gold-300/50 bg-shah-gold-500/15 text-shah-gold-200"
                              : "border-white/12 text-white/30 hover:text-white/60",
                          )}
                        >
                          <FiStar aria-hidden className="size-2.5" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

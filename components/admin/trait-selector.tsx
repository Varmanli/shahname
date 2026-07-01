"use client";

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
  gold: "text-shah-gold-300 border-shah-gold-400/30 bg-shah-gold-500/10",
  lapis: "text-blue-200 border-blue-300/20 bg-shah-lapis-700/30",
  red: "text-red-200 border-red-300/20 bg-red-500/10",
  emerald: "text-emerald-200 border-emerald-300/20 bg-emerald-500/10",
  violet: "text-violet-200 border-violet-300/20 bg-violet-500/10",
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
    <div className="grid gap-8">
      {traitGroups.map((category) => {
        const presets = TRAIT_PRESETS.filter(
          (trait) => trait.category === category,
        );

        if (!presets.length) return null;

        const isNegative = category === "negative";

        return (
          <section key={category} className="grid gap-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3
                  className={cn(
                    "text-lg font-black",
                    isNegative ? "text-red-100" : "text-shah-gold-200",
                  )}
                >
                  {categoryLabels[category]}
                </h3>
                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  {categoryHints[category]}
                </p>
              </div>

              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-[10px] font-black",
                  isNegative
                    ? "border-red-400/30 bg-red-500/10 text-red-100"
                    : "border-shah-gold-400/25 bg-shah-gold-500/10 text-shah-gold-200",
                )}
              >
                {new Intl.NumberFormat("fa-IR").format(presets.length)}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                      "cursor-pointer",
                      "group relative overflow-hidden rounded-2xl border p-4 text-right transition duration-300",
                      "bg-[#101010]/80 hover:-translate-y-1",
                      traitIsNegative
                        ? "hover:border-red-300/50 hover:bg-red-500/10"
                        : "hover:border-shah-gold-300/50 hover:bg-shah-gold-500/5",
                      selected
                        ? traitIsNegative
                          ? "border-red-300/70 shadow-[0_0_30px_rgba(239,68,68,0.18)]"
                          : "border-shah-gold-300/70 shadow-[0_0_30px_rgba(184,134,11,0.22)]"
                        : traitIsNegative
                          ? "border-red-400/20"
                          : "border-white/10",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100",
                        traitIsNegative
                          ? "bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.2),transparent_55%)]"
                          : "bg-[radial-gradient(circle_at_50%_0%,rgba(250,204,21,0.2),transparent_55%)]",
                      )}
                    />

                    {selected?.featured ? (
                      <span
                        className={cn(
                          "absolute left-4 top-4 rounded-full border px-3 py-1 text-[10px] font-black",
                          traitIsNegative
                            ? "border-red-300/30 bg-red-500/10 text-red-100"
                            : "border-shah-gold-300/30 bg-shah-gold-500/10 text-shah-gold-200",
                        )}
                      >
                        شاخص
                      </span>
                    ) : null}

                    <div className="relative z-10 flex items-start gap-4">
                      <div
                        className={cn(
                          "flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-2xl transition group-hover:scale-110",
                          traitIsNegative
                            ? "shadow-[0_0_20px_rgba(239,68,68,0.18)]"
                            : "shadow-[0_0_20px_rgba(184,134,11,0.2)]",
                          toneClasses[trait.tone],
                        )}
                      >
                        <Icon />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-base font-black text-zinc-100">
                          {trait.label}
                        </h3>
                        <p className="mt-2 text-xs font-medium leading-6 text-zinc-400">
                          {trait.description}
                        </p>
                      </div>
                    </div>

                    {selected ? (
                      <div className="relative z-10 mt-5 grid gap-4 border-t border-white/10 pt-4">
                        <div
                          className="grid gap-2"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <span
                            className={cn(
                              "text-xs font-black",
                              traitIsNegative
                                ? "text-red-100"
                                : "text-shah-gold-200",
                            )}
                          >
                            شدت ویژگی
                          </span>
                          <div className="flex gap-2">
                            {levelOptions.map((level) => (
                              <button
                                type="button"
                                key={level}
                                onClick={() => updateLevel(trait.key, level)}
                                className={cn(
                                  "h-3 w-3 rounded-full transition",
                                  level <= selected.level
                                    ? traitIsNegative
                                      ? "bg-red-300 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                                      : "bg-shah-gold-300 shadow-[0_0_8px_rgba(250,204,21,0.7)]"
                                    : "bg-white/15 hover:bg-white/30",
                                )}
                                aria-label={`شدت ${level}`}
                              />
                            ))}
                          </div>
                        </div>

                        <label
                          className="flex cursor-pointer items-center justify-between gap-3 text-xs font-black text-zinc-200"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <span>ویژگی شاخص</span>
                          <input
                            type="checkbox"
                            checked={Boolean(selected.featured)}
                            onChange={() => toggleFeatured(trait.key)}
                            className={cn(
                              "h-5 w-5",
                              traitIsNegative
                                ? "accent-red-500"
                                : "accent-shah-gold-500",
                            )}
                          />
                        </label>
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

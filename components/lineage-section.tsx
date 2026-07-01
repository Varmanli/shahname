import { LineageExplorer } from "@/components/lineage-explorer";
import type { ApprovedLineageTree } from "@/types/lineage";

type LineageSectionProps = {
  currentCharacterId?: string;
  lineage: ApprovedLineageTree;
};

export function LineageSection({
  currentCharacterId,
  lineage,
}: LineageSectionProps) {
  return (
    <section className="rounded-3xl border border-shah-gold-500/20 bg-white/75 p-5 shadow-[0_20px_70px_rgba(26,26,26,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5.5 dark:shadow-black/30 md:p-7">
      <header className="relative mb-12 overflow-hidden rounded-3xl border border-shah-gold-500/15 bg-linear-to-br from-white via-shah-cream-50 to-white px-6 py-7 shadow-[0_12px_40px_rgba(26,26,26,0.06)] backdrop-blur dark:from-white/4 dark:via-white/3 dark:to-transparent md:px-8 md:py-8">
        {/* glow subtle */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(212,175,55,0.12),transparent_45%)] dark:bg-[radial-gradient(circle_at_20%_0%,rgba(212,175,55,0.08),transparent_45%)]" />

        <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
          {/* left content */}
          <div>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 md:text-4xl dark:text-white">
              {lineage.title}
            </h2>

            {lineage.description ? (
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-shah-black-600 dark:text-zinc-400">
                {lineage.description}
              </p>
            ) : null}
          </div>

          {/* right badge */}
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-shah-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.6)]" />

            <span className="rounded-full border border-shah-gold-500/30 bg-shah-gold-500/10 px-4 py-2 text-xs font-black text-shah-gold-800 backdrop-blur transition-all dark:text-shah-gold-200">
              {lineage.characters.length} شخصیت
            </span>
          </div>
        </div>

        {/* decorative line */}
        <div className="mt-6 flex h-1 w-20 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-full w-1/3 bg-shah-lapis-500" />
          <div className="h-full w-2/3 bg-shah-gold-500" />
        </div>
      </header>
      <LineageExplorer
        lineage={lineage}
        currentCharacterId={currentCharacterId}
      />
    </section>
  );
}

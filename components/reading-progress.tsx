"use client";

import { useEffect, useState } from "react";

export function ReadingProgress({
  scrollContainerId,
  targetId,
}: {
  scrollContainerId?: string;
  targetId: string;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const scrollContainer = scrollContainerId
      ? document.getElementById(scrollContainerId)
      : null;

    function updateProgress() {
      if (scrollContainer) {
        const readableHeight = Math.max(
          1,
          scrollContainer.scrollHeight - scrollContainer.clientHeight,
        );
        const nextProgress = Math.min(
          100,
          Math.max(0, (scrollContainer.scrollTop / readableHeight) * 100),
        );

        setProgress(Math.round(nextProgress));
        return;
      }

      const target = document.getElementById(targetId);
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const readableHeight = Math.max(1, rect.height - viewportHeight);
      const nextProgress = Math.min(
        100,
        Math.max(0, ((viewportHeight - rect.top) / readableHeight) * 100),
      );

      setProgress(Math.round(nextProgress));
    }

    updateProgress();
    const scrollTarget = scrollContainer ?? window;
    scrollTarget.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      scrollTarget.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [scrollContainerId, targetId]);

  return (
    <div className="fixed inset-x-0 top-0 z-90 h-1 bg-transparent">
      <div
        className="h-full bg-linear-to-l from-shah-lapis-500 via-shah-gold-500 to-shah-gold-300 shadow-[0_0_16px_rgba(184,134,11,0.38)] transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
      <span className="sr-only">{progress}% read</span>
    </div>
  );
}

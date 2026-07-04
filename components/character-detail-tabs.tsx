"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { DetailTabsSlider } from "@/components/detail-tabs-slider";

export type CharacterDetailTab = {
  id: string;
  label: string;
  children: ReactNode;
};

type CharacterDetailTabsProps = {
  tabs: CharacterDetailTab[];
};

export function CharacterDetailTabs({ tabs }: CharacterDetailTabsProps) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "");
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTabId)) {
      setActiveTabId(tabs[0]?.id ?? "");
    }
  }, [activeTabId, tabs]);

  if (!activeTab) return null;

  return (
    <section className="relative grid min-w-0 gap-4 md:gap-5">
      <DetailTabsSlider
        tabs={tabs.map((tab) => ({ id: tab.id, label: tab.label }))}
        activeTab={activeTab.id}
        onTabChange={setActiveTabId}
      />

      <div
        key={activeTab.id}
        id={`character-tab-panel-${activeTab.id}`}
        role="tabpanel"
        aria-labelledby={`character-tab-${activeTab.id}`}
        className="animate-[character-tab-in_260ms_ease-out]"
      >
        {activeTab.children}
      </div>
    </section>
  );
}

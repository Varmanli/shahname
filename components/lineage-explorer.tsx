"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties, PointerEvent, WheelEvent } from "react";

import type { CharacterSummary } from "@/types/character";
import type { CharacterVisualRole } from "@/types/character";
import type { ApprovedLineageTree, LineageTreeNode } from "@/types/lineage";
import type { Relationship, RelationshipType } from "@/types/relationship";

type LineageExplorerProps = {
  lineage: ApprovedLineageTree;
  currentCharacterId?: string;
};

type PanState = {
  x: number;
  y: number;
};

type CharacterVariant = CharacterVisualRole;

type LayoutNode = CharacterSummary & {
  children: LineageTreeNode[];
  depth: number;
  hasChildren: boolean;
  x: number;
  y: number;
};

type GraphEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  label: string;
  description?: string;
};

type ExportFormat = "pdf" | "png";

const nodeWidth = 320;
const nodeHeight = 112;
const levelGap = 250;
const siblingGap = 160;
const margin = 120;
const exportPadding = 100;

const relationshipLabels: Record<RelationshipType, string> = {
  parent_child: "فرزند",
  spouse: "همسر",
  indirect_lineage: "وابستگی با میانجی",
  ally: "همراه",
  other: "رابطه",
};

const variantMeta: Record<
  CharacterVariant,
  {
    badge: string;
    card: string;
    icon: string;
    label: string;
  }
> = {
  king: {
    badge: "bg-shah-gold-500/15 text-shah-gold-800 dark:text-shah-gold-200",
    card: "border-shah-gold-400/80 bg-linear-to-br from-shah-gold-50 via-white to-white shadow-[0_16px_46px_rgba(212,175,55,0.18)] dark:from-shah-gold-500/12 dark:via-[#15110a] dark:to-[#090909]",
    icon: "♛",
    label: "پادشاه",
  },
  queen: {
    badge: "bg-rose-500/12 text-rose-700 dark:text-rose-200",
    card: "border-rose-300/70 bg-linear-to-br from-rose-50 via-white to-shah-gold-50/50 shadow-[0_16px_42px_rgba(244,114,182,0.12)] dark:border-rose-300/35 dark:from-rose-500/10 dark:via-[#151010] dark:to-[#090909]",
    icon: "◎",
    label: "همسر / بانو",
  },
  hero: {
    badge: "bg-stone-500/12 text-stone-800 dark:text-zinc-200",
    card: "border-stone-400/70 bg-linear-to-br from-stone-100 via-white to-amber-50 shadow-[0_16px_42px_rgba(120,113,108,0.14)] dark:border-zinc-400/35 dark:from-zinc-700/25 dark:via-[#111] dark:to-[#090909]",
    icon: "⚔",
    label: "پهلوان",
  },
  sage: {
    badge: "bg-cyan-500/12 text-cyan-800 dark:text-cyan-200",
    card: "border-cyan-400/60 bg-linear-to-br from-cyan-50 via-white to-teal-50 shadow-[0_16px_42px_rgba(34,211,238,0.12)] dark:border-cyan-300/35 dark:from-cyan-500/10 dark:via-[#0d1414] dark:to-[#090909]",
    icon: "☷",
    label: "خردمند",
  },
  "royal-family": {
    badge: "bg-shah-cream-300/35 text-shah-black-700 dark:text-shah-cream-100",
    card: "border-shah-cream-300/80 bg-linear-to-br from-shah-cream-100 via-white to-white shadow-[0_14px_34px_rgba(250,240,210,0.22)] dark:border-shah-cream-200/25 dark:from-shah-cream-100/8 dark:via-[#12100b] dark:to-[#090909]",
    icon: "◇",
    label: "خاندان شاهی",
  },
  notable: {
    badge: "bg-shah-gold-500/10 text-shah-gold-800 dark:text-shah-gold-200",
    card: "border-white/14 bg-white/95 shadow-[0_14px_38px_rgba(26,26,26,0.09)] dark:bg-[#111]/96",
    icon: "•",
    label: "نام‌دار",
  },
};

export function getCharacterVariant(
  character: CharacterSummary,
): CharacterVariant {
  if (character.visualRole) {
    return character.visualRole;
  }

  const haystack = [
    character.role,
    character.shortTitle,
    character.dynasty,
    ...character.tags,
  ]
    .join(" ")
    .toLowerCase();
  const hasAny = (values: string[]) =>
    values.some((value) => haystack.includes(value.toLowerCase()));

  if (hasAny(["king", "پادشاه", "فرمانروا", "شهریار", "شاه ", "شاهِ"])) {
    return "king";
  }
  if (hasAny(["queen", "spouse", "wife", "همسر", "بانو", "ملکه", "زن شاه"])) {
    return "queen";
  }
  if (
    hasAny([
      "hero",
      "warrior",
      "champion",
      "پهلوان",
      "قهرمان",
      "جنگجو",
      "دلیر",
      "آهنگر",
    ])
  ) {
    return "hero";
  }
  if (
    hasAny([
      "sage",
      "wise",
      "priest",
      "mobed",
      "موبد",
      "خردمند",
      "دانا",
      "فرزانه",
    ])
  ) {
    return "sage";
  }
  if (
    hasAny([
      "princess",
      "prince",
      "royal",
      "daughter",
      "sister",
      "شاهزاده",
      "دختر",
      "خواهر",
      "خاندان",
    ])
  ) {
    return "royal-family";
  }

  return "notable";
}

export function LineageExplorer({
  currentCharacterId,
  lineage,
}: LineageExplorerProps) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState<PanState>({ x: 0, y: 0 });
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(currentCharacterId ?? "");
  const [showSpouse, setShowSpouse] = useState(true);
  const [showIndirect, setShowIndirect] = useState(true);
  const [showAlly, setShowAlly] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [viewportSize, setViewportSize] = useState({ height: 0, width: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const graphContentRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{
    pan: PanState;
    pointerId: number;
    startX: number;
    startY: number;
  } | null>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const effectiveCollapsedIds = useMemo(
    () => (normalizedQuery ? new Set<string>() : collapsedIds),
    [collapsedIds, normalizedQuery],
  );
  const characterById = useMemo(
    () =>
      new Map(lineage.characters.map((character) => [character.id, character])),
    [lineage.characters],
  );
  const matchingIds = useMemo(() => {
    if (!normalizedQuery) return new Set<string>();

    return new Set(
      lineage.characters
        .filter((character) =>
          `${character.name} ${character.shortTitle} ${character.role} ${character.tags.join(" ")}`
            .toLowerCase()
            .includes(normalizedQuery),
        )
        .map((character) => character.id),
    );
  }, [lineage.characters, normalizedQuery]);
  const layout = useMemo(
    () =>
      buildLayout(lineage.roots, effectiveCollapsedIds, lineage.relationships),
    [lineage.relationships, lineage.roots, effectiveCollapsedIds],
  );
  const graphEdges = useMemo(
    () =>
      buildGraphEdges(layout.nodes, lineage.relationships, {
        showAlly,
        showIndirect,
        showSpouse,
      }),
    [layout.nodes, lineage.relationships, showAlly, showIndirect, showSpouse],
  );
  const selectedCharacter = selectedId
    ? characterById.get(selectedId)
    : undefined;

  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const mapElement = map;

    function updateViewportSize() {
      setViewportSize({
        height: mapElement.clientHeight,
        width: mapElement.clientWidth,
      });
    }

    updateViewportSize();

    const observer = new ResizeObserver(updateViewportSize);
    observer.observe(mapElement);

    return () => observer.disconnect();
  }, [isFullscreen]);

  function toggleNode(id: string) {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function expandAll() {
    setCollapsedIds(new Set());
  }

  function collapseAll() {
    const ids = new Set<string>();
    walkNodes(lineage.roots, (node) => {
      if (node.children.length) ids.add(node.id);
    });
    setCollapsedIds(ids);
  }

  function resetView() {
    setScale(1);
    setPan(
      constrainGraphPan(
        { x: 0, y: 0 },
        1,
        layout.width,
        layout.height,
        mapRef.current?.clientWidth ?? viewportSize.width,
        mapRef.current?.clientHeight ?? viewportSize.height,
      ),
    );
  }

  function fitToScreen() {
    const viewportWidth = mapRef.current?.clientWidth ?? viewportSize.width;
    const viewportHeight = mapRef.current?.clientHeight ?? viewportSize.height;

    if (!viewportWidth || !viewportHeight) {
      resetView();
      return;
    }

    const padding = 80;
    const nextScale = clamp(
      Math.min(
        (viewportWidth - padding * 2) / layout.width,
        (viewportHeight - padding * 2) / layout.height,
      ),
      0.25,
      1.2,
    );
    setScale(Number(nextScale.toFixed(2)));
    setPan({
      x: Math.round((viewportWidth - layout.width * nextScale) / 2),
      y: Math.round((viewportHeight - layout.height * nextScale) / 2),
    });
  }

  async function exportFullGraph(format: ExportFormat) {
    if (isExporting) return;

    setIsExporting(true);
    setExportMenuOpen(false);

    try {
      const dataUrl = await renderFullGraphPng(format === "png" ? 3 : 2);
      const filename = `lineage-${lineage.title.replace(/\s+/g, "-")}`;

      if (format === "png") {
        downloadDataUrl(dataUrl, `${filename}.png`);
        return;
      }

      const pdfImageUrl = await flattenPngForPdf(
        dataUrl,
        getExportBackgroundColor(),
      );
      const { jsPDF } = await import("jspdf");
      const bounds = getExportBounds(layout.nodes, svgRef.current);
      const exportWidth = bounds.width + exportPadding * 2;
      const exportHeight = bounds.height + exportPadding * 2;
      const orientation =
        exportWidth >= exportHeight ? "landscape" : "portrait";
      const pdf = new jsPDF({ format: "a4", orientation, unit: "pt" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageScale = Math.min(
        pageWidth / exportWidth,
        pageHeight / exportHeight,
      );
      const imageWidth = exportWidth * imageScale;
      const imageHeight = exportHeight * imageScale;

      pdf.addImage(
        pdfImageUrl,
        "JPEG",
        (pageWidth - imageWidth) / 2,
        (pageHeight - imageHeight) / 2,
        imageWidth,
        imageHeight,
      );
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error("Lineage export failed", error);
      window.alert("خروجی گرفتن از تبارنامه انجام نشد. لطفا دوباره تلاش کنید.");
    } finally {
      setIsExporting(false);
    }
  }

  async function renderFullGraphPng(requestedPixelRatio: number) {
    const graph = graphRef.current;

    if (!graph) {
      throw new Error("Lineage graph is not mounted.");
    }

    const { toPng } = await import("html-to-image");
    const bounds = getExportBounds(layout.nodes, svgRef.current);
    const exportWidth = Math.ceil(bounds.width + exportPadding * 2);
    const exportHeight = Math.ceil(bounds.height + exportPadding * 2);
    const maxPixels = 18000000;
    const pixelRatio = Math.max(
      1,
      Math.min(
        requestedPixelRatio,
        Math.sqrt(maxPixels / (exportWidth * exportHeight)),
      ),
    );
    const backgroundColor = getExportBackgroundColor();
    const exportRoot = document.createElement("div");
    const graphClone = graph.cloneNode(true) as HTMLDivElement;

    exportRoot.setAttribute("dir", "rtl");
    exportRoot.style.position = "fixed";
    exportRoot.style.left = "0";
    exportRoot.style.top = "0";
    exportRoot.style.zIndex = "-1";
    exportRoot.style.pointerEvents = "none";
    exportRoot.style.width = `${exportWidth}px`;
    exportRoot.style.height = `${exportHeight}px`;
    exportRoot.style.overflow = "hidden";
    exportRoot.style.background = backgroundColor;
    exportRoot.style.fontFamily = "inherit";

    graphClone.id = "lineage-map-export";
    graphClone.style.position = "absolute";
    graphClone.style.left = `${Math.round(exportPadding - bounds.x)}px`;
    graphClone.style.top = `${Math.round(exportPadding - bounds.y)}px`;
    graphClone.style.width = `${layout.width}px`;
    graphClone.style.height = `${layout.height}px`;
    graphClone.style.zoom = "1";
    graphClone.style.transform = "none";
    graphClone.style.transformOrigin = "top left";
    graphClone.style.opacity = "1";
    graphClone.style.visibility = "visible";

    const clonedSvg = graphClone.querySelector("svg");
    if (!clonedSvg) {
      throw new Error("Export clone has no SVG.");
    }

    clonedSvg.setAttribute("viewBox", `0 0 ${layout.width} ${layout.height}`);
    clonedSvg.setAttribute("width", String(layout.width));
    clonedSvg.setAttribute("height", String(layout.height));
    clonedSvg.style.overflow = "visible";
    clonedSvg.style.opacity = "1";
    clonedSvg.style.visibility = "visible";

    graphClone.querySelectorAll<HTMLElement>("*").forEach((element) => {
      element.style.transition = "none";
      element.style.animation = "none";
      element.style.opacity = "1";
      element.style.visibility = "visible";
    });
    graphClone.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
      image.loading = "eager";
      image.decoding = "sync";
    });

    exportRoot.appendChild(graphClone);
    document.body.appendChild(exportRoot);

    try {
      const svgCount = exportRoot.querySelectorAll("svg").length;
      const nodeCount = exportRoot.querySelectorAll("[data-lineage-node]").length;

      console.log("exportRoot size", exportWidth, exportHeight);
      console.log("svg count", svgCount);
      console.log("node count", nodeCount);
      console.log("export html length", exportRoot.innerHTML.length);

      if (!svgCount || !nodeCount) {
        throw new Error("Export graph clone is missing nodes or svg.");
      }

      await document.fonts?.ready;
      await Promise.all(
        [...exportRoot.querySelectorAll("img")].map((image) =>
          image.decode?.().catch(() => undefined),
        ),
      );
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      return await toPng(exportRoot, {
        backgroundColor,
        cacheBust: true,
        height: exportHeight,
        pixelRatio,
        skipAutoScale: true,
        width: exportWidth,
      });
    } finally {
      exportRoot.remove();
    }
  }

  function moveViewportToGraphPoint(graphX: number, graphY: number) {
    const viewportWidth = mapRef.current?.clientWidth ?? viewportSize.width;
    const viewportHeight = mapRef.current?.clientHeight ?? viewportSize.height;

    if (!viewportWidth || !viewportHeight) return;

    setPan(
      constrainGraphPan(
        {
          x: Math.round(viewportWidth / 2 - graphX * scale),
          y: Math.round(viewportHeight / 2 - graphY * scale),
        },
        scale,
        layout.width,
        layout.height,
        viewportWidth,
        viewportHeight,
      ),
    );
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;

    const delta = event.deltaY > 0 ? -0.08 : 0.08;
    const nextScale = clamp(Number((scale + delta).toFixed(2)), 0.25, 2);
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const graphX = (mouseX - pan.x) / scale;
    const graphY = (mouseY - pan.y) / scale;

    setScale(nextScale);
    setPan(
      constrainGraphPan(
        {
          x: Math.round(mouseX - graphX * nextScale),
          y: Math.round(mouseY - graphY * nextScale),
        },
        nextScale,
        layout.width,
        layout.height,
        rect.width,
        rect.height,
      ),
    );
  }

  function zoomFromCenter(delta: number) {
    const viewportWidth = mapRef.current?.clientWidth ?? viewportSize.width;
    const viewportHeight = mapRef.current?.clientHeight ?? viewportSize.height;
    if (!viewportWidth || !viewportHeight) {
      setScale((value) => clamp(value + delta, 0.25, 2));
      return;
    }

    const nextScale = clamp(Number((scale + delta).toFixed(2)), 0.25, 2);
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    const graphX = (centerX - pan.x) / scale;
    const graphY = (centerY - pan.y) / scale;

    setScale(nextScale);
    setPan(
      constrainGraphPan(
        {
          x: Math.round(centerX - graphX * nextScale),
          y: Math.round(centerY - graphY * nextScale),
        },
        nextScale,
        layout.width,
        layout.height,
        viewportWidth,
        viewportHeight,
      ),
    );
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pan,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    setPan(
      constrainGraphPan(
        {
          x: drag.pan.x + event.clientX - drag.startX,
          y: drag.pan.y + event.clientY - drag.startY,
        },
        scale,
        layout.width,
        layout.height,
        mapRef.current?.clientWidth ?? viewportSize.width,
        mapRef.current?.clientHeight ?? viewportSize.height,
      ),
    );
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }

  const graphStyle = {
    height: layout.height,
    transform: `translate(${Math.round(pan.x)}px, ${Math.round(pan.y)}px) scale(${scale})`,
    transformOrigin: "top left",
    width: layout.width,
  } satisfies CSSProperties;
  const graphContentStyle = {
    height: layout.height,
    width: layout.width,
  } satisfies CSSProperties;

  const explorerContent = (
    <div
      className={`transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-120 flex h-screen flex-col gap-4 overflow-hidden bg-shah-cream-50/98 p-4 text-shah-black-900 shadow-2xl backdrop-blur-xl dark:bg-[#050505]/96 dark:text-shah-cream-100 md:p-6"
          : "grid gap-5"
      }`}
    >
      <div className="mb-6 rounded-3xl border border-shah-gold-500/15 bg-white/80 p-3 shadow-[0_14px_40px_rgba(26,26,26,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-shah-gold-600/70 dark:text-shah-gold-300/70">
              🔎
            </span>

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onPointerDown={stopMapInteraction}
              placeholder="جستجو در این تبارنامه..."
              className="
          h-12 w-full rounded-2xl border border-shah-gold-500/20
          bg-white/90 pr-11 pl-4 text-sm font-bold text-zinc-900 outline-none
          shadow-inner transition-all duration-300
          placeholder:text-zinc-400
          focus:border-shah-gold-500/70 focus:bg-white
          focus:ring-4 focus:ring-shah-gold-400/15
          dark:border-white/10 dark:bg-white/6 dark:text-white
          dark:placeholder:text-zinc-500 dark:focus:bg-white/8
        "
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200/70 bg-zinc-50/80 p-1.5 dark:border-white/10 dark:bg-black/20">
            <ToggleButton
              active={showGrid}
              onClick={() => setShowGrid((value) => !value)}
            >
              نمایش گرید
            </ToggleButton>

            <ToggleButton
              active={showSpouse}
              onClick={() => setShowSpouse((value) => !value)}
            >
              پیوند همسری
            </ToggleButton>

            <ToggleButton
              active={showIndirect}
              onClick={() => setShowIndirect((value) => !value)}
            >
              وابستگی با میانجی
            </ToggleButton>

            <ToggleButton
              active={showAlly}
              onClick={() => setShowAlly((value) => !value)}
            >
              همراهی
            </ToggleButton>
          </div>
        </div>
      </div>

      <div
        ref={mapRef}
        className={`relative cursor-grab overflow-hidden rounded-[1.6rem] border border-shah-gold-500/22 bg-white/72 shadow-inner shadow-shah-gold-900/5 touch-none transition-all duration-300 active:cursor-grabbing dark:border-white/8 dark:bg-black/24 ${
          isFullscreen ? "min-h-0 flex-1" : "h-168 md:h-192"
        }`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {showGrid ? (
          <div className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(to_left,rgba(212,175,55,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(212,175,55,0.04)_1px,transparent_1px)] bg-size-[72px_72px]" />
        ) : null}

        <div
          className="absolute left-4 top-4 z-70 flex overflow-visible rounded-2xl border border-shah-gold-500/14 bg-white/86 p-1 shadow-xl shadow-black/10 backdrop-blur-xl dark:border-white/10 dark:bg-black/55"
          onClick={stopMapInteraction}
          onPointerDown={stopMapInteraction}
        >
          <IconButton
            label={isFullscreen ? "خروج از تمام‌صفحه" : "نمایش تمام‌صفحه"}
            onClick={() => setIsFullscreen((value) => !value)}
          >
            {isFullscreen ? "×" : "⛶"}
          </IconButton>
          <div
            className="relative"
            onClick={stopMapInteraction}
            onPointerDown={stopMapInteraction}
          >
            <button
              type="button"
              title="دانلود خروجی کامل تبارنامه"
              onClick={(event) => {
                event.stopPropagation();
                setExportMenuOpen((value) => !value);
              }}
              disabled={isExporting}
              className="relative z-10 h-11 rounded-2xl border border-shah-gold-500/30 bg-white px-4 text-sm font-black text-shah-gold-800 shadow-lg backdrop-blur transition hover:border-shah-gold-500/60 hover:bg-shah-gold-500 hover:text-black disabled:cursor-wait disabled:opacity-75 dark:border-white/10 dark:bg-[#141414] dark:text-shah-gold-200 dark:hover:border-shah-gold-400/45"
            >
              {isExporting ? "در حال خروجی..." : "دانلود"}
            </button>
            {exportMenuOpen ? (
              <div
                className="absolute left-0 top-13 z-80 w-48 overflow-hidden rounded-2xl border border-shah-gold-500/25 bg-white/98 p-1 text-right shadow-2xl shadow-black/20 backdrop-blur-xl dark:border-white/10 dark:bg-[#101010]/98"
                onClick={stopMapInteraction}
                onPointerDown={stopMapInteraction}
              >
                <ExportMenuItem
                  disabled={isExporting}
                  onClick={() => exportFullGraph("png")}
                >
                  دانلود عکس (PNG)
                </ExportMenuItem>
                <ExportMenuItem
                  disabled={isExporting}
                  onClick={() => exportFullGraph("pdf")}
                >
                  دانلود PDF
                </ExportMenuItem>
              </div>
            ) : null}
          </div>
        </div>

        <div
          className="absolute right-4 top-4 z-40 flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-shah-gold-500/14 bg-white/72 p-1 shadow-lg shadow-black/8 backdrop-blur-xl dark:border-white/10 dark:bg-black/35"
          onPointerDown={stopMapInteraction}
        >
          <span className="h-9 rounded-xl border border-shah-gold-500/16 bg-shah-gold-500/8 px-3 pt-2 text-xs font-black text-shah-gold-800 dark:text-shah-gold-100">
            {Math.round(scale * 100)}٪
          </span>
          <IconButton
            label="بزرگ‌نمایی"
            onClick={() => zoomFromCenter(0.1)}
          >
            +
          </IconButton>
          <IconButton
            label="کوچک‌نمایی"
            onClick={() => zoomFromCenter(-0.1)}
          >
            −
          </IconButton>
          <IconButton label="جای دادن در صفحه" onClick={fitToScreen}>
            ⌖
          </IconButton>
          <IconButton label="بازنشانی نما" onClick={resetView}>
            ↺
          </IconButton>
          <IconButton label="باز کردن همه" onClick={expandAll}>
            ⇣
          </IconButton>
          <IconButton label="بستن همه" onClick={collapseAll}>
            ⇡
          </IconButton>
        </div>

        <div
          id="lineage-map"
          ref={graphRef}
          className="absolute left-0 top-0 origin-top-left"
          style={graphStyle}
        >
          <div
            ref={graphContentRef}
            data-lineage-graph-content="true"
            className="relative"
            style={graphContentStyle}
          >
            <svg
              ref={svgRef}
              className="absolute inset-0 overflow-visible"
              height={layout.height}
              width={layout.width}
              aria-hidden
            >
              {graphEdges.map((edge) => (
                <GraphEdgePath
                  key={edge.id}
                  edge={edge}
                  highlighted
                  source={layout.nodeById.get(edge.sourceId)}
                  target={layout.nodeById.get(edge.targetId)}
                />
              ))}
            </svg>

            {layout.nodes.map((node) => (
              <div
                key={node.id}
                data-lineage-node="true"
                className="absolute"
                style={{ left: node.x, top: node.y }}
              >
                <CharacterNode
                  collapsed={effectiveCollapsedIds.has(node.id)}
                  connected
                  current={node.id === currentCharacterId}
                  highlighted={matchingIds.has(node.id)}
                  node={node}
                  onSelect={() => setSelectedId(node.id)}
                  onToggle={
                    node.hasChildren ? () => toggleNode(node.id) : undefined
                  }
                  selected={selectedId === node.id}
                />
              </div>
            ))}
          </div>
        </div>

        <MiniMap
          height={layout.height}
          nodes={layout.nodes}
          onNavigate={moveViewportToGraphPoint}
          pan={pan}
          scale={scale}
          viewportHeight={viewportSize.height}
          viewportWidth={viewportSize.width}
          width={layout.width}
        />
        <SelectedCharacterPanel
          character={selectedCharacter}
          characterById={characterById}
          onClose={() => setSelectedId("")}
          relationships={graphEdges}
        />
        <LineageLegend
          open={legendOpen}
          onToggle={() => setLegendOpen((value) => !value)}
        />
        {isExporting ? (
          <div
            className="absolute inset-0 z-90 grid place-items-center bg-shah-black-950/45 text-center backdrop-blur-sm dark:bg-black/55"
            onPointerDown={stopMapInteraction}
          >
            <div className="rounded-2xl border border-shah-gold-400/30 bg-white/92 px-6 py-5 text-sm font-black text-shah-black-900 shadow-2xl shadow-black/20 dark:bg-[#101010]/92 dark:text-shah-cream-100">
              <span className="mx-auto mb-3 block size-8 animate-spin rounded-full border-2 border-shah-gold-500/25 border-t-shah-gold-500" />
              در حال آماده‌سازی خروجی کامل تبارنامه...
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      {!isFullscreen ? explorerContent : null}
      {isFullscreen && typeof document !== "undefined"
        ? createPortal(explorerContent, document.body)
        : null}
    </>
  );
}

function CharacterNode({
  collapsed,
  connected,
  current,
  highlighted,
  node,
  onSelect,
  onToggle,
  selected,
}: {
  collapsed: boolean;
  connected: boolean;
  current: boolean;
  highlighted: boolean;
  node: LayoutNode;
  onSelect: () => void;
  onToggle?: () => void;
  selected: boolean;
}) {
  const variant = getCharacterVariant(node);
  const meta = variantMeta[variant];

  return (
    <div
      className={`group relative flex h-28 w-80 items-center gap-3 rounded-[1.35rem] border-2 p-4 text-right outline -outline-offset-2 outline-white/20 transition-[border-color,box-shadow,opacity] duration-200 hover:shadow-[0_18px_48px_rgba(212,175,55,0.18)] dark:outline-white/10 ${meta.card} ${
        connected ? "opacity-100" : "opacity-80"
      } ${
        current || selected
          ? "ring-2 ring-shah-gold-400/70 shadow-[0_0_42px_rgba(212,175,55,0.22)]"
          : highlighted
            ? "ring-2 ring-cyan-300/55"
            : ""
      }`}
      onClick={stopMapInteraction}
      onPointerDown={stopMapInteraction}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        onPointerDown={stopMapInteraction}
        className="absolute inset-0 rounded-[1.35rem]"
        aria-label={`نمایش جزئیات ${node.name}`}
      />
      {onToggle ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          onPointerDown={stopMapInteraction}
          className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full border border-shah-gold-500/25 bg-shah-gold-500/10 text-base font-black text-shah-gold-800 transition hover:bg-shah-gold-500 hover:text-black dark:text-shah-gold-200"
          aria-label={collapsed ? "باز کردن شاخه" : "بستن شاخه"}
        >
          {collapsed ? "+" : "−"}
        </button>
      ) : (
        <span className="size-10 shrink-0" />
      )}
      <div
        className="pointer-events-none relative z-10 flex min-w-0 flex-1 items-center gap-3"
      >
        <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-white/40 bg-shah-cream-100 dark:bg-zinc-900">
          {node.avatar ? (
            <Image
              src={node.avatar}
              alt={node.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <span className="grid h-full place-items-center text-2xl font-black">
              {node.name.slice(0, 1)}
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="line-clamp-1 text-[1.35rem] font-black leading-8 text-shah-black-950 dark:text-white">
              {node.name}
            </span>
            <span className="shrink-0 text-lg text-shah-gold-600 dark:text-shah-gold-300">
              {meta.icon}
            </span>
          </span>
          {node.shortTitle ? (
            <span className="mt-1 line-clamp-2 text-sm font-black leading-5 text-shah-black-700 dark:text-zinc-200">
              {node.shortTitle}
            </span>
          ) : null}
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-black ${meta.badge}`}
          >
            {meta.label}
          </span>
        </span>
      </div>
    </div>
  );
}

function GraphEdgePath({
  edge,
  highlighted,
  source,
  target,
}: {
  edge: GraphEdge;
  highlighted: boolean;
  source?: LayoutNode;
  target?: LayoutNode;
}) {
  if (!source || !target) return null;

  const edgeStyle = getEdgeStyle(edge.type);
  const isParentChild = edge.type === "parent_child";
  const sourceCenterX = source.x + nodeWidth / 2;
  const targetCenterX = target.x + nodeWidth / 2;
  const sourceIsRight = sourceCenterX <= targetCenterX;
  const sourceX = isParentChild
    ? sourceCenterX
    : sourceIsRight
      ? source.x + nodeWidth
      : source.x;
  const sourceY = isParentChild
    ? source.y + nodeHeight
    : source.y + nodeHeight / 2;
  const targetX = isParentChild
    ? targetCenterX
    : sourceIsRight
      ? target.x
      : target.x + nodeWidth;
  const targetY = isParentChild ? target.y : target.y + nodeHeight / 2;
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  const labelX = midX;
  const labelY = midY - 15;
  const horizontalControl = Math.max(72, Math.abs(targetX - sourceX) / 2);
  const path = isParentChild
    ? `M ${sourceX} ${sourceY} C ${sourceX} ${midY}, ${targetX} ${midY}, ${targetX} ${targetY}`
    : `M ${sourceX} ${sourceY} C ${
        sourceX + (sourceIsRight ? horizontalControl : -horizontalControl)
      } ${sourceY}, ${
        targetX + (sourceIsRight ? -horizontalControl : horizontalControl)
      } ${targetY}, ${targetX} ${targetY}`;

  return (
    <g className={highlighted ? "opacity-100" : "opacity-20"}>
      <path
        d={path}
        fill="none"
        stroke={edgeStyle.stroke}
        strokeDasharray={edgeStyle.dash}
        strokeLinecap="round"
        strokeWidth={edgeStyle.width}
      />
      <foreignObject x={labelX - 56} y={labelY} width="112" height="30">
        <div
          className={`rounded-full border px-2 py-1 text-center text-[10px] font-black backdrop-blur ${edgeStyle.label}`}
        >
          {edge.label}
        </div>
      </foreignObject>
    </g>
  );
}

function SelectedCharacterPanel({
  character,
  characterById,
  onClose,
  relationships,
}: {
  character?: CharacterSummary;
  characterById: Map<string, CharacterSummary>;
  onClose: () => void;
  relationships: GraphEdge[];
}) {
  if (!character) return null;

  const related = relationships.filter(
    (relationship) =>
      relationship.sourceId === character.id ||
      relationship.targetId === character.id,
  );
  const parents = related
    .filter(
      (relationship) =>
        relationship.type === "parent_child" &&
        relationship.targetId === character.id,
    )
    .map((relationship) => characterById.get(relationship.sourceId))
    .filter((item): item is CharacterSummary => Boolean(item));
  const children = related
    .filter(
      (relationship) =>
        relationship.type === "parent_child" &&
        relationship.sourceId === character.id,
    )
    .map((relationship) => characterById.get(relationship.targetId))
    .filter((item): item is CharacterSummary => Boolean(item));
  const spouses = related
    .filter((relationship) => relationship.type === "spouse")
    .map((relationship) =>
      characterById.get(
        relationship.sourceId === character.id
          ? relationship.targetId
          : relationship.sourceId,
      ),
    )
    .filter((item): item is CharacterSummary => Boolean(item));
  const indirect = related.filter(
    (relationship) => relationship.type === "indirect_lineage",
  );

  return (
    <aside
      className="absolute left-4 top-20 z-50 max-h-[calc(100%-6rem)] w-[min(22rem,calc(100%-2rem))] overflow-y-auto rounded-3xl border border-shah-gold-500/20 bg-white/92 p-5 text-right shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-[#101010]/92"
      onPointerDown={stopMapInteraction}
    >
      <button
        type="button"
        onClick={onClose}
        onPointerDown={stopMapInteraction}
        className="absolute left-3 top-3 grid size-9 place-items-center rounded-full border border-border bg-muted/50 text-lg font-black transition hover:border-shah-gold-500 hover:text-shah-gold-700"
        aria-label="بستن جزئیات"
      >
        ×
      </button>
      <div className="flex items-center gap-3 pl-8">
        <span className="relative size-16 overflow-hidden rounded-2xl border border-shah-gold-500/30 bg-shah-cream-100">
          {character.avatar ? (
            <Image
              src={character.avatar}
              alt={character.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <span className="grid h-full place-items-center text-2xl font-black">
              {character.name.slice(0, 1)}
            </span>
          )}
        </span>
        <span>
          <h3 className="text-xl font-black text-shah-black-900 dark:text-white">
            {character.name}
          </h3>
          <p className="mt-1 text-xs font-black text-shah-gold-700 dark:text-shah-gold-300">
            {character.shortTitle || character.role}
          </p>
        </span>
      </div>
      {character.shortDescription ? (
        <p className="mt-4 line-clamp-5 text-xs font-semibold leading-7 text-shah-black-600 dark:text-zinc-300">
          {stripHtml(character.shortDescription)}
        </p>
      ) : null}
      <PanelGroup title="والدین" characters={parents} />
      <PanelGroup title="همسران" characters={spouses} />
      <PanelGroup title="فرزندان" characters={children} />
      {indirect.length ? (
        <div className="mt-5">
          <h4 className="text-xs font-black text-shah-gold-700 dark:text-shah-gold-300">
            پیوندهای دودمانی
          </h4>
          <div className="mt-2 grid gap-2">
            {indirect.map((relationship) => (
              <p
                key={relationship.id}
                className="rounded-xl bg-shah-gold-500/8 p-3 text-xs font-bold leading-6 text-muted-foreground"
              >
                {relationship.description || relationship.label}
              </p>
            ))}
          </div>
        </div>
      ) : null}
      <Link
        href={`/characters/${encodeURIComponent(character.slug)}`}
        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-shah-lapis-800 text-sm font-black text-shah-gold-100 transition hover:bg-shah-lapis-700 dark:bg-shah-gold-500 dark:text-shah-black-950"
      >
        صفحه شخصیت
      </Link>
    </aside>
  );
}

function PanelGroup({
  characters,
  title,
}: {
  characters: CharacterSummary[];
  title: string;
}) {
  if (!characters.length) return null;

  return (
    <div className="mt-5">
      <h4 className="text-xs font-black text-shah-gold-700 dark:text-shah-gold-300">
        {title}
      </h4>
      <div className="mt-2 flex flex-wrap gap-2">
        {characters.map((character) => (
          <Link
            key={character.id}
            href={`/characters/${encodeURIComponent(character.slug)}`}
            className="rounded-full border border-shah-gold-500/20 px-3 py-1 text-xs font-black transition hover:border-shah-gold-500 hover:text-shah-gold-700"
          >
            {character.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

function MiniMap({
  height,
  nodes,
  onNavigate,
  pan,
  scale,
  viewportHeight,
  viewportWidth,
  width,
}: {
  height: number;
  nodes: LayoutNode[];
  onNavigate: (x: number, y: number) => void;
  pan: PanState;
  scale: number;
  viewportHeight: number;
  viewportWidth: number;
  width: number;
}) {
  const miniWidth = 168;
  const miniHeight = 118;
  const ratio = Math.min(miniWidth / width, miniHeight / height);
  const mapRef = useRef<HTMLDivElement>(null);
  const viewportX = clamp((-pan.x / scale) * ratio, 0, miniWidth);
  const viewportY = clamp((-pan.y / scale) * ratio, 0, miniHeight);
  const viewportMiniWidth = clamp(
    (viewportWidth / scale) * ratio,
    18,
    miniWidth,
  );
  const viewportMiniHeight = clamp(
    (viewportHeight / scale) * ratio,
    14,
    miniHeight,
  );

  function navigateFromPointer(event: PointerEvent<HTMLDivElement>) {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = clamp(event.clientX - rect.left, 0, miniWidth);
    const y = clamp(event.clientY - rect.top, 0, miniHeight);
    onNavigate(x / ratio, y / ratio);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    navigateFromPointer(event);
  }

  return (
    <div
      ref={mapRef}
      role="button"
      tabIndex={0}
      aria-label="نمای کلی نقشه تبارنامه"
      className="
    absolute bottom-4 right-4 z-40 hidden cursor-crosshair select-none
    rounded-[1.25rem] border border-shah-gold-500/20
    bg-white/80 p-2.5 shadow-[0_18px_45px_rgba(0,0,0,0.18)]
    backdrop-blur-xl transition-all duration-300
    hover:border-shah-gold-500/35 hover:bg-white/90
    md:block
    dark:border-white/10 dark:bg-black/55 dark:shadow-black/40 dark:hover:border-shah-gold-400/30 dark:hover:bg-black/70
  "
      onPointerDown={handlePointerDown}
      onPointerMove={(event) => {
        if (event.buttons === 1) {
          navigateFromPointer(event);
        }
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <span className="text-[10px] font-black text-shah-gold-700 dark:text-shah-gold-200">
          نمای کلی
        </span>

        <span className="rounded-full bg-shah-gold-500/10 px-2 py-0.5 text-[9px] font-black text-shah-gold-700 dark:text-shah-gold-200">
          {Math.round(scale * 100)}٪
        </span>
      </div>

      <svg
        width={miniWidth}
        height={miniHeight}
        viewBox={`0 0 ${miniWidth} ${miniHeight}`}
        aria-hidden
        className="block overflow-hidden rounded-2xl"
      >
        <defs>
          <linearGradient id="miniMapBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(212,175,55,0.10)" />
            <stop offset="100%" stopColor="rgba(15,23,42,0.08)" />
          </linearGradient>

          <filter id="miniMapGlow">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect
          width={miniWidth}
          height={miniHeight}
          rx="14"
          fill="url(#miniMapBg)"
        />

        {nodes.map((node) => (
          <rect
            key={node.id}
            x={node.x * ratio}
            y={node.y * ratio}
            width={Math.max(5, nodeWidth * ratio)}
            height={Math.max(4, nodeHeight * ratio)}
            rx="3"
            fill="rgba(212,175,55,0.58)"
          />
        ))}

        <rect
          x={viewportX}
          y={viewportY}
          width={viewportMiniWidth}
          height={viewportMiniHeight}
          rx="7"
          fill="rgba(255,255,255,0.10)"
          stroke="rgba(212,175,55,0.95)"
          strokeWidth="1.8"
          filter="url(#miniMapGlow)"
        />
      </svg>

      <div className="mt-2 px-1 text-[9px] font-bold text-zinc-400 dark:text-zinc-500">
        برای جابه‌جایی، روی نقشه بکشید
      </div>
    </div>
  );
}

function LineageLegend({
  onToggle,
  open,
}: {
  onToggle: () => void;
  open: boolean;
}) {
  return (
    <section
      className="absolute bottom-4 left-4 z-40 w-[min(20rem,calc(100%-2rem))] rounded-2xl border border-shah-gold-500/20 bg-white/88 text-sm font-bold leading-7 shadow-xl shadow-black/10 backdrop-blur-md dark:border-white/10 dark:bg-black/55 dark:shadow-black/35"
      onPointerDown={stopMapInteraction}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-right text-sm font-black text-shah-black-900 dark:text-white"
      >
        <span>راهنما</span>
        <span>{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="grid gap-3 border-t border-shah-gold-500/12 p-4">
          <div className="grid gap-2">
            <LegendItem swatch="bg-shah-gold-500" text="پادشاهان" />
            <LegendItem swatch="bg-rose-300" text="همسران و بانوان دربار" />
            <LegendItem swatch="bg-stone-500" text="پهلوانان" />
            <LegendItem swatch="bg-cyan-400" text="خردمندان و موبدان" />
            <LegendItem swatch="bg-zinc-500" text="دیگر نام‌داران" />
          </div>
          <div>
            <div className="grid gap-2">
              <LineLegend dash="" text="پدر/مادر و فرزند" />
              <LineLegend dash="border-rose-300" text="پیوند همسری" />
              <LineLegend
                dash="border-dotted"
                text="وابستگی دودمانی با میانجی"
              />
              <LineLegend
                dash="border-dashed border-zinc-400"
                text="همراهی یا اتحاد"
              />
            </div>
            <p className="mt-3 rounded-xl bg-shah-gold-500/8 p-3 text-[11px] font-semibold leading-6 text-muted-foreground">
              در برخی بخش‌های شاهنامه، همه نسل‌های میانی با نام مشخص نیامده‌اند؛
              پیوندهای نقطه‌چین وابستگی دودمانی یا روایی‌اند، نه رابطه مستقیم
              پدر و فرزند.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function LegendItem({ swatch, text }: { swatch: string; text: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`size-3 rounded-full ${swatch}`} />
      {text}
    </span>
  );
}

function LineLegend({ dash, text }: { dash: string; text: string }) {
  return (
    <span className="flex items-center gap-3">
      <span className={`w-12 border-t-2 border-shah-gold-500 ${dash}`} />
      {text}
    </span>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      onPointerDown={stopMapInteraction}
      className="grid size-11 place-items-center rounded-2xl border border-shah-gold-500/25 bg-white/88 text-base font-black text-shah-gold-800 shadow-lg backdrop-blur transition hover:border-shah-gold-500/55 hover:bg-shah-gold-500 hover:text-black dark:border-white/10 dark:bg-black/45 dark:text-shah-gold-200 dark:hover:border-shah-gold-400/45"
    >
      {children}
    </button>
  );
}

function ExportMenuItem({
  children,
  disabled,
  onClick,
}: {
  children: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="block h-11 w-full rounded-xl px-3 text-right text-xs font-black text-shah-black-800 transition hover:bg-shah-gold-500/12 hover:text-shah-gold-800 disabled:cursor-wait disabled:opacity-60 dark:text-shah-cream-100 dark:hover:bg-shah-gold-500/14 dark:hover:text-shah-gold-100"
    >
      {children}
    </button>
  );
}

function ToggleButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-xl border px-3 text-xs font-black transition ${
        active
          ? "border-shah-gold-500/45 bg-shah-gold-500/12 text-shah-gold-800 dark:text-shah-gold-200"
          : "border-border bg-muted/40 text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function buildLayout(
  roots: LineageTreeNode[],
  collapsedIds: Set<string>,
  relationships: Relationship[],
) {
  let leafIndex = 0;
  let maxDepth = 0;
  const stagedNodes: Array<Omit<LayoutNode, "x" | "y"> & { slot: number }> = [];

  function visit(node: LineageTreeNode, depth: number): number {
    maxDepth = Math.max(maxDepth, depth);
    const hasChildren = node.children.length > 0;
    const visibleChildren = collapsedIds.has(node.id) ? [] : node.children;

    if (!visibleChildren.length) {
      const slot = leafIndex;
      leafIndex += 1;
      stagedNodes.push({ ...node, children: visibleChildren, depth, hasChildren, slot });
      return slot;
    }

    const childSlots = visibleChildren.map((child) => visit(child, depth + 1));
    const slot =
      childSlots.reduce((total, value) => total + value, 0) / childSlots.length;
    stagedNodes.push({ ...node, children: visibleChildren, depth, hasChildren, slot });
    return slot;
  }

  roots.forEach((root) => visit(root, 0));

  const width = Math.max(
    margin * 2 + nodeWidth,
    margin * 2 + leafIndex * (nodeWidth + siblingGap) - siblingGap,
  );
  const height = margin * 2 + nodeHeight + maxDepth * levelGap;
  let nodes: LayoutNode[] = stagedNodes.map(({ slot, ...node }) => ({
    ...node,
    x: margin + slot * (nodeWidth + siblingGap),
    y: margin + node.depth * levelGap,
  }));
  nodes = alignSpousesAndTwoParentChildren(nodes, relationships);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  return { height, nodeById, nodes, width };
}

function alignSpousesAndTwoParentChildren(
  nodes: LayoutNode[],
  relationships: Relationship[],
) {
  const nodeById = new Map(nodes.map((node) => [node.id, { ...node }]));
  const spousePairs = relationships.filter(
    (relationship) => relationship.type === "spouse",
  );

  for (const relationship of spousePairs) {
    const source = nodeById.get(relationship.sourceCharacterId);
    const target = nodeById.get(relationship.targetCharacterId);
    if (!source || !target) continue;

    const sameDepthY = Math.min(source.y, target.y);
    const center = (source.x + target.x) / 2;
    source.y = sameDepthY;
    target.y = sameDepthY;
    source.x = center - nodeWidth / 2 - siblingGap / 2;
    target.x = center + nodeWidth / 2 + siblingGap / 2;
  }

  for (const node of nodeById.values()) {
    if (!node.fatherId || !node.motherId) continue;

    const father = nodeById.get(node.fatherId);
    const mother = nodeById.get(node.motherId);
    if (!father || !mother) continue;

    const fatherCenter = father.x + nodeWidth / 2;
    const motherCenter = mother.x + nodeWidth / 2;
    node.x = (fatherCenter + motherCenter) / 2 - nodeWidth / 2;
  }

  return [...nodeById.values()];
}

function buildGraphEdges(
  nodes: LayoutNode[],
  relationships: Relationship[],
  filters: {
    showAlly: boolean;
    showIndirect: boolean;
    showSpouse: boolean;
  },
): GraphEdge[] {
  const visibleIds = new Set(nodes.map((node) => node.id));
  const edges: GraphEdge[] = [];
  const edgeKeys = new Set<string>();

  for (const node of nodes) {
    for (const parentId of [node.fatherId, node.motherId]) {
      if (!parentId || !visibleIds.has(parentId)) continue;
      const key = `${parentId}:${node.id}:parent_child`;
      if (edgeKeys.has(key)) continue;
      edgeKeys.add(key);
      edges.push({
        id: key,
        label: "فرزند",
        sourceId: parentId,
        targetId: node.id,
        type: "parent_child",
      });
    }
  }

  for (const relationship of relationships) {
    if (
      !visibleIds.has(relationship.sourceCharacterId) ||
      !visibleIds.has(relationship.targetCharacterId)
    ) {
      continue;
    }
    if (relationship.type === "spouse" && !filters.showSpouse) continue;
    if (relationship.type === "indirect_lineage" && !filters.showIndirect)
      continue;
    if (relationship.type === "ally" && !filters.showAlly) continue;

    const key = `${relationship.sourceCharacterId}:${relationship.targetCharacterId}:${relationship.type}`;
    if (relationship.type === "parent_child" && edgeKeys.has(key)) continue;

    edges.push({
      description: relationship.description,
      id: relationship.id,
      label: relationship.label || relationshipLabels[relationship.type],
      sourceId: relationship.sourceCharacterId,
      targetId: relationship.targetCharacterId,
      type: relationship.type,
    });
  }

  return edges;
}

function getEdgeStyle(type: RelationshipType) {
  if (type === "spouse") {
    return {
      dash: "",
      label:
        "border-rose-300/35 bg-rose-50/80 text-rose-700 dark:bg-rose-500/12 dark:text-rose-200",
      stroke: "#D8A0A6",
      width: 1.8,
    };
  }
  if (type === "indirect_lineage") {
    return {
      dash: "3 7",
      label:
        "border-shah-gold-500/35 bg-shah-gold-50/90 text-shah-gold-900 dark:bg-shah-gold-500/16 dark:text-shah-gold-100",
      stroke: "rgba(212,175,55,0.72)",
      width: 2.2,
    };
  }
  if (type === "ally") {
    return {
      dash: "10 8",
      label:
        "border-zinc-400/25 bg-zinc-100/80 text-zinc-700 dark:bg-zinc-500/12 dark:text-zinc-200",
      stroke: "#8A99A8",
      width: 1.6,
    };
  }

  return {
    dash: "",
    label:
      "border-shah-gold-500/30 bg-white/90 text-shah-gold-800 dark:bg-black/50 dark:text-shah-gold-200",
    stroke: "#D4AF37",
    width: type === "parent_child" ? 2.1 : 1.6,
  };
}

function walkNodes(
  nodes: LineageTreeNode[],
  callback: (node: LineageTreeNode) => void,
) {
  for (const node of nodes) {
    callback(node);
    walkNodes(node.children, callback);
  }
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getExportBounds(nodes: LayoutNode[], svg: SVGSVGElement | null) {
  const nodeBounds = nodes.reduce(
    (bounds, node) => ({
      maxX: Math.max(bounds.maxX, node.x + nodeWidth),
      maxY: Math.max(bounds.maxY, node.y + nodeHeight),
      minX: Math.min(bounds.minX, node.x),
      minY: Math.min(bounds.minY, node.y),
    }),
    {
      maxX: 0,
      maxY: 0,
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
    },
  );
  let minX = Number.isFinite(nodeBounds.minX) ? nodeBounds.minX : 0;
  let minY = Number.isFinite(nodeBounds.minY) ? nodeBounds.minY : 0;
  let maxX = nodeBounds.maxX;
  let maxY = nodeBounds.maxY;

  try {
    const svgBounds = svg?.getBBox();

    if (svgBounds && svgBounds.width && svgBounds.height) {
      minX = Math.min(minX, svgBounds.x);
      minY = Math.min(minY, svgBounds.y);
      maxX = Math.max(maxX, svgBounds.x + svgBounds.width);
      maxY = Math.max(maxY, svgBounds.y + svgBounds.height);
    }
  } catch {
    // Some browsers throw while measuring hidden SVG content. Node bounds still cover the full graph.
  }

  return {
    height: Math.ceil(maxY - minY),
    width: Math.ceil(maxX - minX),
    x: Math.floor(minX),
    y: Math.floor(minY),
  };
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function getExportBackgroundColor() {
  return document.documentElement.classList.contains("dark")
    ? "#0b0b0f"
    : "#f8f1df";
}

async function flattenPngForPdf(dataUrl: string, backgroundColor: string) {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not create PDF export canvas.");
  }

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);

  return canvas.toDataURL("image/jpeg", 0.92);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load exported PNG for PDF."));
    image.src = src;
  });
}

function stopMapInteraction(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

function constrainGraphPan(
  pan: PanState,
  scale: number,
  graphWidth: number,
  graphHeight: number,
  viewportWidth: number,
  viewportHeight: number,
): PanState {
  if (!viewportWidth || !viewportHeight || !graphWidth || !graphHeight) {
    return {
      x: Math.round(pan.x),
      y: Math.round(pan.y),
    };
  }

  const scaledWidth = graphWidth * scale;
  const scaledHeight = graphHeight * scale;
  const minVisibleX = Math.min(220, Math.max(96, viewportWidth * 0.22));
  const minVisibleY = Math.min(180, Math.max(88, viewportHeight * 0.22));

  return {
    x: Math.round(
      constrainAxisPan(pan.x, scaledWidth, viewportWidth, minVisibleX),
    ),
    y: Math.round(
      constrainAxisPan(pan.y, scaledHeight, viewportHeight, minVisibleY),
    ),
  };
}

function constrainAxisPan(
  value: number,
  scaledSize: number,
  viewportSize: number,
  minVisible: number,
) {
  if (scaledSize <= viewportSize - minVisible * 2) {
    return (viewportSize - scaledSize) / 2;
  }

  const min = minVisible - scaledSize;
  const max = viewportSize - minVisible;
  return clamp(value, min, max);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

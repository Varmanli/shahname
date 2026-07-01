import "server-only";

import { createHash, randomUUID } from "crypto";

import { and, count, desc, eq, gte, sql } from "drizzle-orm";

import { db } from "@/lib/server/db";
import { pageViews } from "@/lib/server/db/schema";

export type AnalyticsTargetType = "character" | "story";

/** نوع رکورد عمومی بازدید صفحه برای آمار سراسری سایت. */
const SITE_PAGE_TYPE = "page" as const;

export type TopViewedTarget = {
  targetId: string;
  targetType: AnalyticsTargetType;
  views: number;
};

export type DailyViewStat = {
  date: string;
  views: number;
};

export type AnalyticsSummary = {
  characterViews: number;
  dailyViews: DailyViewStat[];
  storyViews: number;
  todayUniqueVisitors: number;
  todayViews: number;
  topCharacters: TopViewedTarget[];
  topStories: TopViewedTarget[];
  totalViews: number;
  uniqueVisitors: number;
};

const ANALYTICS_DAYS = 14;

export async function recordPageView({
  headersList,
  targetId,
  targetType,
}: {
  headersList: Pick<Headers, "get">;
  targetId: string;
  targetType: AnalyticsTargetType;
}) {
  const ipAddress = getClientIp(headersList);
  if (!ipAddress) return;

  await db
    .insert(pageViews)
    .values({
      id: randomUUID(),
      ipHash: hashIp(ipAddress),
      targetId,
      targetType,
      userAgent: headersList.get("user-agent")?.slice(0, 500) ?? "",
    })
    .onConflictDoNothing({
      target: [
        pageViews.targetType,
        pageViews.targetId,
        pageViews.ipHash,
        pageViews.viewDate,
      ],
    });
}

/**
 * ثبت بازدید عمومی یک صفحه برای آمار سراسری سایت.
 * fire-and-forget است؛ خطاها بی‌صدا نادیده گرفته می‌شوند تا صفحه عمومی هرگز نشکند.
 */
export async function recordSiteView({
  headersList,
  path,
}: {
  headersList: Pick<Headers, "get">;
  path: string;
}) {
  const normalizedPath = normalizeTrackedPath(path);
  if (!normalizedPath) return;

  const ipAddress = getClientIp(headersList);
  if (!ipAddress) return;

  try {
    await db
      .insert(pageViews)
      .values({
        id: randomUUID(),
        ipHash: hashIp(ipAddress),
        targetId: normalizedPath,
        targetType: SITE_PAGE_TYPE,
        path: normalizedPath,
        userAgent: headersList.get("user-agent")?.slice(0, 500) ?? "",
      })
      .onConflictDoNothing({
        target: [
          pageViews.targetType,
          pageViews.targetId,
          pageViews.ipHash,
          pageViews.viewDate,
        ],
      });
  } catch (error) {
    // آمار نباید هرگز باعث خطای صفحه شود.
    console.error("recordSiteView failed", error);
  }
}

/**
 * نرمال‌سازی مسیر برای ثبت: حذف کوئری/هش، حذف اسلش انتهایی و رد مسیرهای غیرعمومی.
 * مسیرهای ادمین، API، داخلی Next و فایل‌های استاتیک ثبت نمی‌شوند.
 */
function normalizeTrackedPath(rawPath: unknown): string | null {
  if (typeof rawPath !== "string") return null;

  // فقط بخش مسیر را نگه می‌داریم (بدون دامنه، کوئری یا هش).
  let path = rawPath.split("#")[0]?.split("?")[0]?.trim() ?? "";
  if (!path.startsWith("/")) return null;

  // حذف اسلش انتهایی به‌جز ریشه برای جلوگیری از مسیرهای تکراری.
  if (path.length > 1) path = path.replace(/\/+$/, "") || "/";

  if (path.length > 512) return null;

  const excludedPrefixes = ["/admin", "/api", "/_next"];
  if (excludedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return null;
  }

  // مسیرهای دارای پسوند فایل (دارایی‌های استاتیک) ثبت نمی‌شوند.
  const lastSegment = path.split("/").pop() ?? "";
  if (/\.[a-z0-9]+$/i.test(lastSegment)) return null;

  return path;
}

export async function readAnalyticsSummary(): Promise<AnalyticsSummary> {
  const since = new Date();
  since.setDate(since.getDate() - (ANALYTICS_DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const distinctIp = sql<number>`count(distinct ${pageViews.ipHash})`;
  // آمار سراسری سایت فقط بر پایه رکوردهای عمومی صفحه (نوع page) محاسبه می‌شود؛
  // رکوردهای character/story صرفاً برای فهرست «پربازدیدترین‌ها» نگه داشته می‌شوند.
  const sitePage = eq(pageViews.targetType, SITE_PAGE_TYPE);
  const sinceToday = gte(pageViews.viewedAt, today.toISOString());

  const [
    totalRows,
    characterRows,
    storyRows,
    todayRows,
    uniqueVisitorRows,
    todayUniqueVisitorRows,
    topCharacters,
    topStories,
    dailyRows,
  ] = await Promise.all([
    // کل بازدید صفحه‌ها در سراسر سایت.
    db.select({ value: count() }).from(pageViews).where(sitePage),
    db
      .select({ value: count() })
      .from(pageViews)
      .where(eq(pageViews.targetType, "character")),
    db
      .select({ value: count() })
      .from(pageViews)
      .where(eq(pageViews.targetType, "story")),
    // بازدید امروز در سراسر سایت.
    db
      .select({ value: count() })
      .from(pageViews)
      .where(and(sitePage, sinceToday)),
    // بازدیدکنندگان یکتا: تعداد IPهای متمایز در کل بازدیدهای سایت.
    db.select({ value: distinctIp }).from(pageViews).where(sitePage),
    // بازدیدکنندگان یکتای امروز در سراسر سایت.
    db
      .select({ value: distinctIp })
      .from(pageViews)
      .where(and(sitePage, sinceToday)),
    readTopTargets("character"),
    readTopTargets("story"),
    db
      .select({
        date: sql<string>`to_char(date_trunc('day', ${pageViews.viewedAt}), 'YYYY-MM-DD')`,
        views: count(),
      })
      .from(pageViews)
      .where(and(sitePage, gte(pageViews.viewedAt, since.toISOString())))
      .groupBy(sql`date_trunc('day', ${pageViews.viewedAt})`)
      .orderBy(sql`date_trunc('day', ${pageViews.viewedAt})`),
  ]);

  return {
    characterViews: Number(characterRows[0]?.value ?? 0),
    dailyViews: fillDailyViews(dailyRows, since),
    storyViews: Number(storyRows[0]?.value ?? 0),
    todayUniqueVisitors: Number(todayUniqueVisitorRows[0]?.value ?? 0),
    todayViews: Number(todayRows[0]?.value ?? 0),
    topCharacters,
    topStories,
    totalViews: Number(totalRows[0]?.value ?? 0),
    uniqueVisitors: Number(uniqueVisitorRows[0]?.value ?? 0),
  };
}

function readTopTargets(targetType: AnalyticsTargetType) {
  return db
    .select({
      targetId: pageViews.targetId,
      // این تابع فقط با نوع character/story صدا زده می‌شود.
      targetType: sql<AnalyticsTargetType>`${pageViews.targetType}`,
      views: count(),
    })
    .from(pageViews)
    .where(eq(pageViews.targetType, targetType))
    .groupBy(pageViews.targetType, pageViews.targetId)
    .orderBy(desc(count()))
    .limit(5);
}

function fillDailyViews(
  rows: Array<{ date: string; views: number }>,
  since: Date,
): DailyViewStat[] {
  const viewsByDate = new Map(rows.map((row) => [row.date, Number(row.views)]));

  return Array.from({ length: ANALYTICS_DAYS }, (_, index) => {
    const date = new Date(since);
    date.setDate(since.getDate() + index);
    const key = date.toISOString().slice(0, 10);

    return {
      date: key,
      views: viewsByDate.get(key) ?? 0,
    };
  });
}

function getClientIp(headersList: Pick<Headers, "get">) {
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim();

  const forwarded = headersList.get("forwarded");
  const forwardedIp = forwarded?.match(/for="?([^";,]+)"?/i)?.[1];
  if (forwardedIp) return forwardedIp.trim();

  return (
    headersList.get("x-real-ip")?.trim() ||
    headersList.get("cf-connecting-ip")?.trim() ||
    headersList.get("true-client-ip")?.trim() ||
    null
  );
}

function hashIp(value: string) {
  return createHash("sha256")
    .update(`${process.env.ANALYTICS_IP_SALT ?? "shahname"}:${value}`)
    .digest("hex");
}

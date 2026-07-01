/**
 * رندر داده‌های ساخت‌یافته (JSON-LD) برای موتورهای جستجو.
 * با استفاده در کامپوننت‌های سرور، اسکریپت در همان صفحه تزریق می‌شود.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // داده‌ها از منابع داخلی سایت ساخته می‌شوند، نه ورودی کاربر.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

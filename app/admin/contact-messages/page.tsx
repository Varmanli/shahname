import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ContactMessagesList } from "@/components/admin/contact-messages-list";
import { readContactMessages } from "@/lib/contact-message-store";

export const metadata: Metadata = {
  title: "پیام‌های تماس",
};

export const dynamic = "force-dynamic";

export default async function AdminContactMessagesPage() {
  const messages = await readContactMessages();

  return (
    <>
      <AdminPageHeader
        title="پیام‌های تماس"
        description="مشاهده، جستجو، خوانده‌شده کردن، آرشیو و حذف پیام‌های ارسال‌شده از صفحه تماس."
      />
      <ContactMessagesList messages={messages} />
    </>
  );
}

import { requireAdminRequest } from "@/lib/admin-auth";
import {
  deleteContactMessage,
  updateContactMessage,
} from "@/lib/contact-message-store";
import type { ContactMessageStatus } from "@/types/contact-message";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const validStatuses = new Set<ContactMessageStatus>(["new", "read", "archived"]);

export async function PUT(request: Request, context: RouteContext) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const { id } = await context.params;
    const payload = (await request.json()) as { status?: unknown };
    const status = payload.status;

    if (typeof status !== "string" || !validStatuses.has(status as ContactMessageStatus)) {
      return Response.json({ message: "وضعیت پیام معتبر نیست." }, { status: 400 });
    }

    const message = await updateContactMessage(id, {
      status: status as ContactMessageStatus,
    });

    if (!message) {
      return Response.json({ message: "پیام پیدا نشد." }, { status: 404 });
    }

    return Response.json({ message });
  } catch {
    return Response.json(
      { message: "به‌روزرسانی پیام با خطا روبه‌رو شد." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const { id } = await context.params;
    const deleted = await deleteContactMessage(id);

    if (!deleted) {
      return Response.json({ message: "پیام پیدا نشد." }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { message: "حذف پیام با خطا روبه‌رو شد." },
      { status: 500 },
    );
  }
}

import { requireAdminRequest } from "@/lib/admin-auth";
import {
  createContactMessage,
  readContactMessages,
} from "@/lib/contact-message-store";
import type { ContactMessageInput } from "@/types/contact-message";

export const dynamic = "force-dynamic";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validateContactPayload(payload: Record<string, unknown>) {
  const honeypot = toString(payload.website);

  if (honeypot) {
    return { input: null, isHoneypot: true, message: "" };
  }

  const input: ContactMessageInput = {
    name: toString(payload.name),
    email: toString(payload.email).toLowerCase(),
    subject: toString(payload.subject),
    message: toString(payload.message),
  };

  if (input.name.length < 2) {
    return { input: null, isHoneypot: false, message: "نام باید حداقل ۲ نویسه باشد." };
  }

  if (input.name.length > 80) {
    return { input: null, isHoneypot: false, message: "نام بیش از اندازه طولانی است." };
  }

  if (!emailPattern.test(input.email)) {
    return { input: null, isHoneypot: false, message: "ایمیل معتبر نیست." };
  }

  if (input.email.length > 160) {
    return { input: null, isHoneypot: false, message: "ایمیل بیش از اندازه طولانی است." };
  }

  if (input.subject.length < 3) {
    return { input: null, isHoneypot: false, message: "موضوع باید حداقل ۳ نویسه باشد." };
  }

  if (input.subject.length > 120) {
    return { input: null, isHoneypot: false, message: "موضوع بیش از اندازه طولانی است." };
  }

  if (input.message.length < 10) {
    return { input: null, isHoneypot: false, message: "متن پیام باید حداقل ۱۰ نویسه باشد." };
  }

  if (input.message.length > 3000) {
    return { input: null, isHoneypot: false, message: "متن پیام بیش از اندازه طولانی است." };
  }

  return { input, isHoneypot: false, message: "" };
}

export async function GET(request: Request) {
  const authError = await requireAdminRequest(request);
  if (authError) return authError;

  const messages = await readContactMessages();
  return Response.json({ messages });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const result = validateContactPayload(payload);

    if (result.isHoneypot) {
      return Response.json({ ok: true });
    }

    if (!result.input) {
      return Response.json(
        { message: result.message || "اطلاعات پیام معتبر نیست." },
        { status: 400 },
      );
    }

    await createContactMessage(result.input);
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json(
      { message: "ارسال پیام با خطا روبه‌رو شد." },
      { status: 500 },
    );
  }
}

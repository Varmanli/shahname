"use client";

import { FormEvent, useMemo, useState } from "react";

type ContactFormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

type ContactFormErrors = Partial<Record<keyof ContactFormState, string>>;

const initialState: ContactFormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(initialState);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    kind: "error" | "success";
    message: string;
  } | null>(null);

  const messageLength = useMemo(
    () => form.message.trim().length,
    [form.message],
  );

  function updateField(field: keyof ContactFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setStatus(null);
  }

  function validate() {
    const nextErrors: ContactFormErrors = {};
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const subject = form.subject.trim();
    const message = form.message.trim();

    if (name.length < 2) nextErrors.name = "نام باید حداقل ۲ نویسه باشد.";
    if (name.length > 80) nextErrors.name = "نام بیش از اندازه طولانی است.";

    if (!emailPattern.test(email)) nextErrors.email = "ایمیل معتبر وارد کنید.";
    if (email.length > 160)
      nextErrors.email = "ایمیل بیش از اندازه طولانی است.";

    if (subject.length < 3)
      nextErrors.subject = "موضوع باید حداقل ۳ نویسه باشد.";
    if (subject.length > 120)
      nextErrors.subject = "موضوع بیش از اندازه طولانی است.";

    if (message.length < 10)
      nextErrors.message = "متن پیام باید حداقل ۱۰ نویسه باشد.";
    if (message.length > 3000)
      nextErrors.message = "متن پیام نباید بیش از ۳۰۰۰ نویسه باشد.";

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/contact-messages", {
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          subject: form.subject.trim(),
          message: form.message.trim(),
          website: form.website.trim(),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message || "ارسال پیام با خطا روبه‌رو شد.");
      }

      setForm(initialState);
      setErrors({});
      setStatus({
        kind: "success",
        message: "پیام شما با موفقیت ارسال شد. سپاس از همراهی شما.",
      });
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "ارسال پیام با خطا روبه‌رو شد.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="text-right" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          label="نام و نام خانوادگی"
          placeholder="مثلاً: امیرحسین احمدی"
          value={form.name}
          error={errors.name}
          onChange={(value) => updateField("name", value)}
          maxLength={80}
        />

        <TextField
          label="ایمیل"
          placeholder="example@email.com"
          value={form.email}
          error={errors.email}
          onChange={(value) => updateField("email", value)}
          type="email"
          maxLength={160}
          dir="ltr"
        />
      </div>

      <div className="mt-5">
        <TextField
          label="موضوع پیام"
          placeholder="مثلاً: پیشنهاد برای بخش تبارنامه"
          value={form.subject}
          error={errors.subject}
          onChange={(value) => updateField("subject", value)}
          maxLength={120}
        />
      </div>

      <div className="mt-5">
        <label className="block">
          <span className="text-sm font-black text-shah-black-800 dark:text-shah-cream-100">
            متن پیام
          </span>

          <textarea
            value={form.message}
            onChange={(event) => updateField("message", event.target.value)}
            placeholder="پیام خود را با جزئیات بنویسید؛ مثلاً نام شخصیت، روایت یا بخشی که درباره‌اش صحبت می‌کنید."
            maxLength={3000}
            rows={8}
            className={`mt-2 w-full resize-none rounded-[1.4rem] border bg-white/90 px-4 py-3 text-sm font-semibold leading-8 text-shah-black-900 outline-none transition-all duration-300 placeholder:text-zinc-400 focus:bg-white focus:ring-4 dark:bg-black/25 dark:text-white dark:placeholder:text-zinc-500 dark:focus:bg-black/35 ${
              errors.message
                ? "border-red-300 focus:ring-red-400/15"
                : "border-shah-gold-500/20 focus:border-shah-gold-500/65 focus:ring-shah-gold-400/15 dark:border-white/10"
            }`}
          />

          <div className="mt-2 flex items-center justify-between gap-3 text-xs font-bold">
            <span
              className={
                errors.message
                  ? "text-red-600 dark:text-red-300"
                  : "text-zinc-500 dark:text-zinc-400"
              }
            >
              {errors.message || "حداکثر ۳۰۰۰ نویسه"}
            </span>

            <span className="text-zinc-500 dark:text-zinc-400">
              {messageLength.toLocaleString("fa-IR")} / ۳۰۰۰
            </span>
          </div>
        </label>
      </div>

      <input
        type="text"
        value={form.website}
        onChange={(event) => updateField("website", event.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {status ? (
        <div
          className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-black leading-7 ${
            status.kind === "success"
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
              : "border-red-300/40 bg-red-500/10 text-red-700 dark:text-red-200"
          }`}
        >
          {status.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex h-13 w-full items-center justify-center rounded-2xl bg-shah-lapis-800 px-7 text-sm font-black text-shah-gold-100 shadow-lg shadow-shah-lapis-900/18 transition-all duration-300 hover:-translate-y-0.5 hover:bg-shah-lapis-700 hover:text-white disabled:cursor-wait disabled:translate-y-0 disabled:opacity-65 dark:bg-shah-gold-500 dark:text-shah-black-950 dark:hover:bg-shah-gold-400"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="size-4 animate-spin rounded-full border-2 border-current/25 border-t-current" />
            در حال ارسال...
          </span>
        ) : (
          "ارسال پیام"
        )}
      </button>

      <p className="mt-4 text-center text-xs font-bold leading-6 text-zinc-500 dark:text-zinc-400">
        اطلاعات تماس شما فقط برای پیگیری همین پیام استفاده می‌شود.
      </p>
    </form>
  );
}

function TextField({
  dir,
  error,
  label,
  maxLength,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  dir?: "ltr" | "rtl";
  error?: string;
  label: string;
  maxLength: number;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-shah-black-800 dark:text-shah-cream-100">
        {label}
      </span>

      <input
        dir={dir}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`mt-2 h-12 w-full rounded-[1.25rem] border bg-white/90 px-4 text-sm font-semibold text-shah-black-900 outline-none transition-all duration-300 placeholder:text-zinc-400 focus:bg-white focus:ring-4 dark:bg-black/25 dark:text-white dark:placeholder:text-zinc-500 dark:focus:bg-black/35 ${
          error
            ? "border-red-300 focus:ring-red-400/15"
            : "border-shah-gold-500/20 focus:border-shah-gold-500/65 focus:ring-shah-gold-400/15 dark:border-white/10"
        }`}
      />

      {error ? (
        <span className="mt-2 block text-xs font-bold leading-6 text-red-600 dark:text-red-300">
          {error}
        </span>
      ) : null}
    </label>
  );
}

"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  FiArchive,
  FiClock,
  FiEye,
  FiInbox,
  FiMail,
  FiSearch,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";

import { AdminPagination } from "@/components/admin/admin-pagination";
import type {
  ContactMessage,
  ContactMessageStatus,
} from "@/types/contact-message";

type FilterStatus = ContactMessageStatus | "all";

const PAGE_SIZE = 8;

const statusLabels: Record<ContactMessageStatus, string> = {
  archived: "آرشیوشده",
  new: "جدید",
  read: "خوانده‌شده",
};

const toFaNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

export function ContactMessagesList({
  messages: initialMessages,
}: {
  messages: ContactMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [page, setPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [pendingId, setPendingId] = useState("");

  const counts = useMemo(
    () => ({
      all: messages.length,
      archived: messages.filter((message) => message.status === "archived")
        .length,
      new: messages.filter((message) => message.status === "new").length,
      read: messages.filter((message) => message.status === "read").length,
    }),
    [messages],
  );

  const filteredMessages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesStatus = filter === "all" || message.status === filter;
      const matchesQuery =
        !normalizedQuery ||
        `${message.name} ${message.email} ${message.subject} ${message.message}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [filter, messages, query]);

  const paginatedMessages = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredMessages.slice(start, start + PAGE_SIZE);
  }, [filteredMessages, page]);

  const hasActiveFilters = query.trim() || filter !== "all";

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateFilter(value: FilterStatus) {
    setFilter(value);
    setPage(1);
  }

  function resetFilters() {
    setQuery("");
    setFilter("all");
    setPage(1);
  }

  async function updateStatus(
    message: ContactMessage,
    status: ContactMessageStatus,
  ) {
    setPendingId(message.id);
    setStatusMessage("");

    try {
      const response = await fetch(`/api/contact-messages/${message.id}`, {
        body: JSON.stringify({ status }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });

      const payload = (await response.json()) as {
        message?: ContactMessage | string;
      };

      if (
        !response.ok ||
        typeof payload.message === "string" ||
        !payload.message
      ) {
        throw new Error(
          typeof payload.message === "string"
            ? payload.message
            : "به‌روزرسانی پیام با خطا روبه‌رو شد.",
        );
      }

      const updatedMessage = payload.message as ContactMessage;

      setMessages((current) =>
        current.map((item) => (item.id === message.id ? updatedMessage : item)),
      );

      setSelectedMessage((current) =>
        current?.id === message.id ? updatedMessage : current,
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "به‌روزرسانی پیام با خطا روبه‌رو شد.",
      );
    } finally {
      setPendingId("");
    }
  }

  async function deleteMessage(message: ContactMessage) {
    const confirmed = window.confirm(`پیام «${message.subject}» حذف شود؟`);
    if (!confirmed) return;

    setPendingId(message.id);
    setStatusMessage("");

    try {
      const response = await fetch(`/api/contact-messages/${message.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message || "حذف پیام با خطا روبه‌رو شد.");
      }

      setMessages((current) =>
        current.filter((item) => item.id !== message.id),
      );
      setSelectedMessage((current) =>
        current?.id === message.id ? null : current,
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "حذف پیام با خطا روبه‌رو شد.",
      );
    } finally {
      setPendingId("");
    }
  }

  return (
    <section className="grid gap-5">
      <MessagesToolbar
        counts={counts}
        filter={filter}
        hasActiveFilters={Boolean(hasActiveFilters)}
        query={query}
        resultCount={filteredMessages.length}
        onFilterChange={updateFilter}
        onQueryChange={updateQuery}
        onReset={resetFilters}
      />

      {statusMessage ? <StatusMessage message={statusMessage} /> : null}

      {messages.length === 0 ? (
        <EmptyState text="هنوز پیامی ثبت نشده است." />
      ) : filteredMessages.length === 0 ? (
        <EmptyState
          text="پیامی با این جستجو پیدا نشد."
          hasActiveFilters
          onReset={resetFilters}
        />
      ) : (
        <>
          <div className="grid gap-3">
            {paginatedMessages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                pending={pendingId === message.id}
                onArchive={() => updateStatus(message, "archived")}
                onDelete={() => deleteMessage(message)}
                onRead={() => updateStatus(message, "read")}
                onView={() => setSelectedMessage(message)}
              />
            ))}
          </div>

          <AdminPagination
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={filteredMessages.length}
            onPageChange={setPage}
          />
        </>
      )}

      {selectedMessage ? (
        <MessageModal
          message={selectedMessage}
          pending={pendingId === selectedMessage.id}
          onArchive={() => updateStatus(selectedMessage, "archived")}
          onClose={() => setSelectedMessage(null)}
          onDelete={() => deleteMessage(selectedMessage)}
          onRead={() => updateStatus(selectedMessage, "read")}
        />
      ) : null}
    </section>
  );
}

function MessagesToolbar({
  counts,
  filter,
  hasActiveFilters,
  onFilterChange,
  onQueryChange,
  onReset,
  query,
  resultCount,
}: {
  counts: Record<FilterStatus, number>;
  filter: FilterStatus;
  hasActiveFilters: boolean;
  query: string;
  resultCount: number;
  onFilterChange: (value: FilterStatus) => void;
  onQueryChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="relative overflow-visible rounded-[1.7rem] border border-shah-gold-500/12 bg-white/72 p-4 shadow-xl shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5 md:p-5">
      <div className="pointer-events-none absolute -left-20 -top-24 size-56 rounded-full bg-shah-gold-500/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-12 size-64 rounded-full bg-shah-lapis-500/8 blur-3xl" />

      <div className="relative grid gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-shah-gold-500/14 bg-shah-gold-500/8 px-3 py-1.5 text-[11px] font-black text-shah-gold-800 dark:border-shah-gold-300/12 dark:text-shah-gold-100">
              <FiMail aria-hidden className="size-3.5" />
              پیام‌های تماس
            </div>

            <p className="mt-2 text-xs font-bold leading-6 text-muted-foreground">
              {toFaNumber(resultCount)} نتیجه از {toFaNumber(counts.all)} پیام
            </p>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-xl border border-shah-gold-500/14 bg-white/60 px-3 text-xs font-black text-foreground transition hover:bg-shah-gold-500 hover:text-shah-black-950 dark:border-white/10 dark:bg-white/5.5"
            >
              <FiX aria-hidden className="size-3.5" />
              پاک کردن فیلترها
            </button>
          ) : null}
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <label className="relative">
            <FiSearch
              aria-hidden
              className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/70"
            />

            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="جستجو در نام، ایمیل، موضوع یا متن پیام..."
              className="h-12 w-full rounded-2xl border border-shah-gold-500/12 bg-white/70 pr-12 pl-4 text-sm font-bold text-foreground outline-none backdrop-blur-xl transition placeholder:text-muted-foreground/60 focus:border-shah-gold-500/35 focus:bg-white focus:ring-4 focus:ring-shah-gold-500/8 dark:border-white/10 dark:bg-white/4.5 dark:focus:bg-white/7.5"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={filter === "all"}
              count={counts.all}
              onClick={() => onFilterChange("all")}
            >
              همه
            </FilterButton>

            <FilterButton
              active={filter === "new"}
              count={counts.new}
              onClick={() => onFilterChange("new")}
            >
              جدید
            </FilterButton>

            <FilterButton
              active={filter === "read"}
              count={counts.read}
              onClick={() => onFilterChange("read")}
            >
              خوانده‌شده
            </FilterButton>

            <FilterButton
              active={filter === "archived"}
              count={counts.archived}
              onClick={() => onFilterChange("archived")}
            >
              آرشیوشده
            </FilterButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageCard({
  message,
  onArchive,
  onDelete,
  onRead,
  onView,
  pending,
}: {
  message: ContactMessage;
  pending: boolean;
  onArchive: () => void;
  onDelete: () => void;
  onRead: () => void;
  onView: () => void;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[1.55rem] border border-shah-gold-500/12 bg-white/72 p-4 text-card-foreground shadow-xl shadow-shah-black-900/5 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-shah-gold-500/28 hover:bg-white/88 dark:border-white/10 dark:bg-white/4.5 dark:hover:bg-white/[0.07] md:p-5">
      <div className="pointer-events-none absolute -left-20 -top-20 size-52 rounded-full bg-shah-gold-500/7 blur-3xl" />

      <div className="relative flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={message.status} />

            <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-shah-gold-500/12 bg-shah-gold-500/8 px-2.5 text-[10px] font-black text-shah-gold-800 dark:border-shah-gold-300/12 dark:text-shah-gold-100">
              <FiClock aria-hidden className="size-3.5" />
              {formatDate(message.createdAt)}
            </span>
          </div>

          <h2 className="mt-3 line-clamp-1 text-lg font-black text-foreground md:text-xl">
            {message.subject}
          </h2>

          <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <FiUser aria-hidden className="size-3.5" />
              {message.name}
            </span>

            <span className="inline-flex items-center gap-1.5" dir="ltr">
              <FiMail aria-hidden className="size-3.5" />
              {message.email}
            </span>
          </div>

          <p className="mt-3 line-clamp-2 text-sm font-semibold leading-7 text-muted-foreground">
            {message.message}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 xl:max-w-88 xl:justify-end">
          <ActionButton onClick={onView}>
            <FiEye className="size-4" />
            مشاهده
          </ActionButton>

          {message.status !== "read" ? (
            <ActionButton disabled={pending} onClick={onRead}>
              <FiInbox className="size-4" />
              خوانده‌شده
            </ActionButton>
          ) : null}

          {message.status !== "archived" ? (
            <ActionButton disabled={pending} onClick={onArchive}>
              <FiArchive className="size-4" />
              آرشیو
            </ActionButton>
          ) : null}

          <ActionButton danger disabled={pending} onClick={onDelete}>
            <FiTrash2 className="size-4" />
            حذف
          </ActionButton>
        </div>
      </div>
    </article>
  );
}

function FilterButton({
  active,
  children,
  count,
  onClick,
}: {
  active: boolean;
  children: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-black transition ${
        active
          ? "border-shah-gold-500/35 bg-shah-gold-500/12 text-shah-gold-800 shadow-lg shadow-shah-gold-500/8 dark:text-shah-gold-100"
          : "border-shah-gold-500/10 bg-white/58 text-muted-foreground hover:border-shah-gold-500/30 hover:bg-shah-gold-500/8 hover:text-foreground dark:border-white/10 dark:bg-white/4.5"
      }`}
    >
      {children}

      <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] dark:bg-black/20">
        {toFaNumber(count)}
      </span>
    </button>
  );
}

function StatusBadge({ status }: { status: ContactMessageStatus }) {
  const className =
    status === "new"
      ? "border-shah-gold-500/24 bg-shah-gold-500/10 text-shah-gold-800 dark:border-shah-gold-300/16 dark:text-shah-gold-100"
      : status === "read"
        ? "border-shah-lapis-500/24 bg-shah-lapis-500/10 text-shah-lapis-800 dark:border-blue-300/16 dark:text-blue-200"
        : "border-zinc-400/18 bg-muted/70 text-muted-foreground dark:border-white/10 dark:bg-white/[0.045]";

  return (
    <span
      className={`inline-flex h-7 items-center rounded-full border px-3 text-[10px] font-black ${className}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function ActionButton({
  children,
  danger = false,
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-black transition disabled:cursor-wait disabled:opacity-60 ${
        danger
          ? "border-red-500/16 bg-red-500/8 text-red-700 hover:bg-red-500 hover:text-white dark:border-red-400/16 dark:text-red-200"
          : "border-shah-gold-500/12 bg-white/58 text-foreground hover:border-shah-gold-500/35 hover:bg-shah-gold-500 hover:text-shah-black-950 dark:border-white/10 dark:bg-white/4.5"
      }`}
    >
      {children}
    </button>
  );
}

function MessageModal({
  message,
  onArchive,
  onClose,
  onDelete,
  onRead,
  pending,
}: {
  message: ContactMessage;
  onArchive: () => void;
  onClose: () => void;
  onDelete: () => void;
  onRead: () => void;
  pending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-100 grid place-items-center bg-black/60 p-4 backdrop-blur-md">
      <article className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[1.8rem] border border-shah-gold-500/18 bg-white/94 text-right text-card-foreground shadow-2xl shadow-black/25 backdrop-blur-2xl dark:border-white/10 dark:bg-shah-black-950/94">
        <div className="flex items-start justify-between gap-4 border-b border-shah-gold-500/10 px-5 py-5 dark:border-white/8">
          <div className="min-w-0">
            <StatusBadge status={message.status} />

            <h2 className="mt-4 line-clamp-2 text-2xl font-black text-foreground md:text-3xl">
              {message.subject}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-shah-gold-500/12 bg-white/58 text-foreground transition hover:bg-red-500/10 hover:text-red-700 dark:border-white/10 dark:bg-white/4.5 dark:hover:text-red-200"
            aria-label="بستن"
          >
            <FiX aria-hidden className="size-5" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-5 custom-scrollbar">
          <div className="grid gap-3 rounded-2xl border border-shah-gold-500/12 bg-shah-gold-500/6 p-4 text-xs font-black text-muted-foreground dark:border-white/8 dark:bg-white/[0.035] md:grid-cols-2">
            <InfoItem label="فرستنده" value={message.name} />
            <InfoItem label="ایمیل" value={message.email} dir="ltr" />
            <InfoItem label="تاریخ ثبت" value={formatDate(message.createdAt)} />
            <InfoItem
              label="آخرین تغییر"
              value={formatDate(message.updatedAt)}
            />
          </div>

          <div className="mt-5 rounded-[1.35rem] border border-shah-gold-500/14 bg-white/72 p-5 shadow-inner shadow-white/20 dark:border-white/8 dark:bg-white/4 dark:shadow-none">
            <p className="whitespace-pre-wrap text-sm font-semibold leading-8 text-foreground">
              {message.message}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <ActionButton disabled={pending} onClick={onRead}>
              <FiInbox className="size-4" />
              علامت‌گذاری به عنوان خوانده‌شده
            </ActionButton>

            <ActionButton disabled={pending} onClick={onArchive}>
              <FiArchive className="size-4" />
              آرشیو
            </ActionButton>

            <ActionButton danger disabled={pending} onClick={onDelete}>
              <FiTrash2 className="size-4" />
              حذف
            </ActionButton>
          </div>
        </div>
      </article>
    </div>
  );
}

function InfoItem({
  dir,
  label,
  value,
}: {
  dir?: "ltr" | "rtl";
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <span className="block text-[10px] font-bold text-muted-foreground/70">
        {label}
      </span>
      <span
        className="mt-1 block truncate text-xs font-black text-foreground"
        dir={dir}
      >
        {value}
      </span>
    </div>
  );
}

function StatusMessage({ message }: { message: string }) {
  return (
    <div className="rounded-[1.35rem] border border-red-500/18 bg-red-50/90 px-4 py-3 text-sm font-black leading-7 text-red-700 shadow-lg shadow-red-950/5 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-200">
      {message}
    </div>
  );
}

function EmptyState({
  hasActiveFilters,
  onReset,
  text,
}: {
  hasActiveFilters?: boolean;
  onReset?: () => void;
  text: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-dashed border-shah-gold-500/22 bg-white/70 px-6 py-16 text-center shadow-xl shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5">
      <div className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-shah-gold-500/10 blur-3xl" />

      <div className="relative mx-auto grid size-16 place-items-center rounded-3xl border border-shah-gold-500/14 bg-shah-gold-500/10 text-shah-gold-800 dark:border-shah-gold-300/15 dark:text-shah-gold-200">
        <FiMail aria-hidden className="size-7" />
      </div>

      <h2 className="relative mt-5 text-xl font-black text-foreground">
        {text}
      </h2>

      {hasActiveFilters && onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="relative mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-shah-gold-500/14 bg-white/60 px-5 text-xs font-black text-foreground transition hover:bg-shah-gold-500 hover:text-shah-black-950 dark:border-white/10 dark:bg-white/4.5"
        >
          <FiX aria-hidden className="size-4" />
          پاک کردن فیلترها
        </button>
      ) : null}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

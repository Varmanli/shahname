"use client";

import { useMemo, useState } from "react";
import {
  FiArchive,
  FiEye,
  FiInbox,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";

import type {
  ContactMessage,
  ContactMessageStatus,
} from "@/types/contact-message";

type FilterStatus = ContactMessageStatus | "all";

const statusLabels: Record<ContactMessageStatus, string> = {
  archived: "آرشیوشده",
  new: "جدید",
  read: "خوانده‌شده",
};

export function ContactMessagesList({
  messages: initialMessages,
}: {
  messages: ContactMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [pendingId, setPendingId] = useState("");

  const counts = useMemo(
    () => ({
      all: messages.length,
      archived: messages.filter((message) => message.status === "archived").length,
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

  async function updateStatus(message: ContactMessage, status: ContactMessageStatus) {
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

      if (!response.ok || typeof payload.message === "string" || !payload.message) {
        throw new Error(
          typeof payload.message === "string"
            ? payload.message
            : "به‌روزرسانی پیام با خطا روبه‌رو شد.",
        );
      }

      setMessages((current) =>
        current.map((item) => (item.id === message.id ? payload.message as ContactMessage : item)),
      );
      setSelectedMessage((current) =>
        current?.id === message.id ? (payload.message as ContactMessage) : current,
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

      setMessages((current) => current.filter((item) => item.id !== message.id));
      setSelectedMessage((current) => (current?.id === message.id ? null : current));
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "حذف پیام با خطا روبه‌رو شد.",
      );
    } finally {
      setPendingId("");
    }
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 rounded-[1.6rem] border border-shah-gold-500/16 bg-white/76 p-4 shadow-xl shadow-shah-black-900/6 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055] md:grid-cols-[1fr_auto]">
        <label className="relative">
          <FiSearch className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-shah-gold-700 dark:text-shah-gold-200" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجو در نام، ایمیل، موضوع یا متن پیام..."
            className="h-12 w-full rounded-2xl border border-shah-gold-500/18 bg-white/82 pr-12 pl-4 text-sm font-bold outline-none transition focus:border-shah-gold-500 focus:ring-4 focus:ring-shah-gold-400/15 dark:border-white/10 dark:bg-black/20"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <FilterButton active={filter === "all"} count={counts.all} onClick={() => setFilter("all")}>
            همه
          </FilterButton>
          <FilterButton active={filter === "new"} count={counts.new} onClick={() => setFilter("new")}>
            جدید
          </FilterButton>
          <FilterButton active={filter === "read"} count={counts.read} onClick={() => setFilter("read")}>
            خوانده‌شده
          </FilterButton>
          <FilterButton active={filter === "archived"} count={counts.archived} onClick={() => setFilter("archived")}>
            آرشیوشده
          </FilterButton>
        </div>
      </div>

      {statusMessage ? (
        <div className="rounded-2xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm font-black text-red-700 dark:text-red-200">
          {statusMessage}
        </div>
      ) : null}

      {messages.length === 0 ? (
        <EmptyState text="هنوز پیامی ثبت نشده است." />
      ) : filteredMessages.length === 0 ? (
        <EmptyState text="پیامی با این جستجو پیدا نشد." />
      ) : (
        <div className="grid gap-4">
          {filteredMessages.map((message) => (
            <article
              key={message.id}
              className="rounded-[1.5rem] border border-border bg-card p-5 text-card-foreground shadow-sm"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black">{message.subject}</h2>
                    <StatusBadge status={message.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold text-muted-foreground">
                    <span>{message.name}</span>
                    <span dir="ltr">{message.email}</span>
                    <span>{formatDate(message.createdAt)}</span>
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm font-semibold leading-7 text-muted-foreground">
                    {message.message}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <ActionButton onClick={() => setSelectedMessage(message)}>
                    <FiEye className="size-4" />
                    مشاهده
                  </ActionButton>
                  {message.status !== "read" ? (
                    <ActionButton
                      disabled={pendingId === message.id}
                      onClick={() => updateStatus(message, "read")}
                    >
                      <FiInbox className="size-4" />
                      خوانده‌شده
                    </ActionButton>
                  ) : null}
                  {message.status !== "archived" ? (
                    <ActionButton
                      disabled={pendingId === message.id}
                      onClick={() => updateStatus(message, "archived")}
                    >
                      <FiArchive className="size-4" />
                      آرشیو
                    </ActionButton>
                  ) : null}
                  <ActionButton
                    danger
                    disabled={pendingId === message.id}
                    onClick={() => deleteMessage(message)}
                  >
                    <FiTrash2 className="size-4" />
                    حذف
                  </ActionButton>
                </div>
              </div>
            </article>
          ))}
        </div>
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
      className={`h-12 rounded-2xl border px-4 text-sm font-black transition ${
        active
          ? "border-shah-gold-500/45 bg-shah-gold-500/12 text-shah-gold-800 dark:text-shah-gold-100"
          : "border-border bg-muted/35 text-muted-foreground hover:border-shah-gold-500/35"
      }`}
    >
      {children}
      <span className="mr-2 rounded-full bg-white/60 px-2 py-0.5 text-xs dark:bg-black/20">
        {count.toLocaleString("fa-IR")}
      </span>
    </button>
  );
}

function StatusBadge({ status }: { status: ContactMessageStatus }) {
  const className =
    status === "new"
      ? "border-shah-gold-500/30 bg-shah-gold-500/12 text-shah-gold-800 dark:text-shah-gold-100"
      : status === "read"
        ? "border-shah-lapis-500/30 bg-shah-lapis-500/10 text-shah-lapis-800 dark:text-blue-200"
        : "border-zinc-400/25 bg-muted text-muted-foreground";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-black ${className}`}>
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
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-xs font-black transition disabled:cursor-wait disabled:opacity-60 ${
        danger
          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
          : "border-border bg-card/60 hover:border-shah-gold-500 hover:text-shah-gold-700 dark:hover:text-shah-gold-200"
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
    <div className="fixed inset-0 z-100 grid place-items-center bg-black/55 p-4 backdrop-blur-sm">
      <article className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[1.8rem] border border-shah-gold-500/20 bg-white p-6 text-right shadow-2xl dark:border-white/10 dark:bg-[#111] md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <StatusBadge status={message.status} />
            <h2 className="mt-4 text-3xl font-black text-foreground">
              {message.subject}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-muted/35 text-xl font-black"
            aria-label="بستن"
          >
            ×
          </button>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-muted/20 p-4 text-sm font-bold text-muted-foreground md:grid-cols-2">
          <span>فرستنده: {message.name}</span>
          <span dir="ltr">ایمیل: {message.email}</span>
          <span>تاریخ ثبت: {formatDate(message.createdAt)}</span>
          <span>آخرین تغییر: {formatDate(message.updatedAt)}</span>
        </div>

        <p className="mt-6 whitespace-pre-wrap rounded-2xl border border-shah-gold-500/14 bg-shah-gold-500/7 p-5 text-base font-semibold leading-9 text-foreground">
          {message.message}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
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
      </article>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-border bg-card px-6 py-16 text-center">
      <h2 className="text-xl font-black">{text}</h2>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

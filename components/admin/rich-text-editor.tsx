"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import {
  FiAlignCenter,
  FiAlignRight,
  FiBold,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiEdit3,
  FiImage,
  FiItalic,
  FiLink,
  FiList,
  FiType,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import {
  MdFormatListNumbered,
  MdFormatQuote,
  MdFormatStrikethrough,
  MdFormatUnderlined,
} from "react-icons/md";

type RichTextEditorProps = {
  allowImages?: boolean;
  minHeightClass?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

const editorContentClasses = [
  "rich-text-preview",
  "character-story",
  "max-w-none",
  "px-4",
  "py-4",
  "text-right",
  "text-sm",
  "font-medium",
  "leading-8",
  "text-foreground",
  "outline-none",
  "prose-p:my-2",
  "prose-headings:font-black",
  "prose-headings:text-foreground",
  "prose-blockquote:border-r-4",
  "prose-blockquote:border-shah-gold-500/40",
  "prose-blockquote:bg-shah-gold-500/6",
  "prose-blockquote:rounded-2xl",
  "prose-blockquote:px-4",
  "prose-blockquote:py-2",
].join(" ");

export function RichTextEditor({
  allowImages = false,
  minHeightClass = "min-h-32",
  onChange,
  placeholder = "متن را وارد کنید...",
  value,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      Highlight,
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
      ...(allowImages
        ? [
            Image.configure({
              allowBase64: true,
              HTMLAttributes: {
                class:
                  "my-5 max-h-[28rem] w-full rounded-2xl object-cover shadow-xl shadow-shah-black-900/8",
              },
            }),
          ]
        : []),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: `${minHeightClass} ${editorContentClasses}`,
        dir: "rtl",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-shah-gold-500/12 bg-white/64 text-card-foreground shadow-inner shadow-white/25 backdrop-blur-xl transition-all duration-200 focus-within:border-shah-gold-500/35 focus-within:bg-white/80 focus-within:ring-4 focus-within:ring-shah-gold-500/8 dark:border-white/10 dark:bg-white/[0.035] dark:shadow-none dark:focus-within:bg-white/5.5">
      <EditorToolbar editor={editor} allowImages={allowImages} />

      <div className="relative">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function EditorToolbar({
  allowImages,
  editor,
}: {
  allowImages: boolean;
  editor: Editor | null;
}) {
  const [imageModalOpen, setImageModalOpen] = useState(false);

  if (!editor) {
    return null;
  }

  function setLink() {
    const previousUrl = editor?.getAttributes("link").href as
      | string
      | undefined;

    const url = window.prompt("آدرس لینک را وارد کنید", previousUrl ?? "");

    if (url === null) return;

    if (!url.trim()) {
      editor?.chain().focus().unsetLink().run();
      return;
    }

    editor?.chain().focus().setLink({ href: url.trim() }).run();
  }

  return (
    <>
      <div className="border-b border-shah-gold-500/10 bg-white/52 px-2 py-2 dark:border-white/8 dark:bg-black/12">
        <div className="flex flex-wrap items-center gap-1.5">
          <ToolbarGroup>
            <ToolbarButton
              label="ضخیم"
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <FiBold aria-hidden className="size-3.5" />
            </ToolbarButton>

            <ToolbarButton
              label="ایتالیک"
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <FiItalic aria-hidden className="size-3.5" />
            </ToolbarButton>

            <ToolbarButton
              label="زیرخط"
              active={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <MdFormatUnderlined aria-hidden className="size-4" />
            </ToolbarButton>

            <ToolbarButton
              label="خط خورده"
              active={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <MdFormatStrikethrough aria-hidden className="size-4" />
            </ToolbarButton>

            <ToolbarButton
              label="هایلایت"
              active={editor.isActive("highlight")}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
            >
              <FiEdit3 aria-hidden className="size-3.5" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolbarButton
              label="پاراگراف"
              active={editor.isActive("paragraph")}
              onClick={() => editor.chain().focus().setParagraph().run()}
            >
              <FiType aria-hidden className="size-3.5" />
            </ToolbarButton>

            {[1, 2, 3, 4].map((level) => (
              <ToolbarButton
                key={level}
                label={`تیتر ${level}`}
                active={editor.isActive("heading", { level })}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .setHeading({ level: level as 1 | 2 | 3 | 4 })
                    .run()
                }
              >
                <span className="text-[10px] font-black leading-none" dir="ltr">
                  H{level}
                </span>
              </ToolbarButton>
            ))}
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolbarButton
              label="لیست"
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <FiList aria-hidden className="size-3.5" />
            </ToolbarButton>

            <ToolbarButton
              label="لیست شماره‌دار"
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <MdFormatListNumbered aria-hidden className="size-4" />
            </ToolbarButton>

            <ToolbarButton
              label="نقل قول"
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <MdFormatQuote aria-hidden className="size-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolbarButton
              label="چینش راست"
              active={editor.isActive({ textAlign: "right" })}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
              <FiAlignRight aria-hidden className="size-3.5" />
            </ToolbarButton>

            <ToolbarButton
              label="چینش وسط"
              active={editor.isActive({ textAlign: "center" })}
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
            >
              <FiAlignCenter aria-hidden className="size-3.5" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolbarButton
              label="لینک"
              onClick={setLink}
              active={editor.isActive("link")}
            >
              <FiLink aria-hidden className="size-3.5" />
            </ToolbarButton>

            {allowImages ? (
              <ToolbarButton
                label="آپلود تصویر"
                onClick={() => setImageModalOpen(true)}
              >
                <FiImage aria-hidden className="size-3.5" />
              </ToolbarButton>
            ) : null}
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolbarButton
              label="واگرد"
              onClick={() => editor.chain().focus().undo().run()}
            >
              <FiCornerUpRight aria-hidden className="size-3.5" />
            </ToolbarButton>

            <ToolbarButton
              label="بازانجام"
              onClick={() => editor.chain().focus().redo().run()}
            >
              <FiCornerUpLeft aria-hidden className="size-3.5" />
            </ToolbarButton>
          </ToolbarGroup>
        </div>
      </div>

      {allowImages && imageModalOpen ? (
        <ImageUploadModal
          editor={editor}
          onClose={() => setImageModalOpen(false)}
        />
      ) : null}
    </>
  );
}

function ToolbarGroup({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-shah-gold-500/10 bg-white/58 p-1 shadow-sm shadow-shah-black-900/3 dark:border-white/8 dark:bg-white/[0.035]">
      {children}
    </div>
  );
}

function ImageUploadModal({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [alt, setAlt] = useState("");
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;

    if (preview) URL.revokeObjectURL(preview);

    setFile(selectedFile);
    setStatus("");
    setPreview(selectedFile ? URL.createObjectURL(selectedFile) : "");
  }

  function closeModal() {
    if (preview) URL.revokeObjectURL(preview);
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setStatus("ابتدا یک تصویر انتخاب کنید.");
      return;
    }

    setIsUploading(true);
    setStatus("");

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();

    setIsUploading(false);

    if (!response.ok || typeof payload.url !== "string") {
      setStatus(payload.message ?? "آپلود تصویر با خطا روبه‌رو شد.");
      return;
    }

    editor
      .chain()
      .focus()
      .setImage({ src: payload.url, alt: alt.trim() || file.name })
      .run();

    closeModal();
  }

  const portalTarget = typeof document === "undefined" ? null : document.body;

  if (!portalTarget) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-9999 grid place-items-center bg-black/60 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="آپلود تصویر"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl overflow-hidden rounded-[1.7rem] border border-shah-gold-500/14 bg-white/94 text-card-foreground shadow-2xl shadow-black/25 backdrop-blur-2xl dark:border-white/10 dark:bg-shah-black-950/94"
      >
        <div className="flex items-center justify-between gap-4 border-b border-shah-gold-500/10 px-4 py-3 dark:border-white/8">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-shah-gold-800 dark:text-shah-gold-200">
              Image
            </p>
            <h2 className="mt-1 text-base font-black text-foreground">
              آپلود تصویر
            </h2>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="grid size-9 place-items-center rounded-xl border border-shah-gold-500/12 bg-white/58 text-foreground transition hover:bg-red-500/10 hover:text-red-700 dark:border-white/10 dark:bg-white/4.5 dark:hover:text-red-200"
            aria-label="بستن"
          >
            <FiX aria-hidden className="size-4" />
          </button>
        </div>

        <div className="grid gap-4 p-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="group relative grid min-h-52 place-items-center overflow-hidden rounded-[1.35rem] border border-dashed border-shah-gold-500/24 bg-shah-gold-500/6 text-center transition hover:border-shah-gold-500/50 hover:bg-shah-gold-500/10 dark:border-white/12 dark:bg-white/[0.035]"
          >
            {preview ? (
              <>
                <span
                  className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${preview})` }}
                />
                <span className="absolute inset-0 bg-linear-to-t from-black/55 via-black/5 to-transparent opacity-0 transition group-hover:opacity-100" />
                <span className="relative z-10 inline-flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs font-black text-shah-black-950 opacity-0 shadow-lg backdrop-blur-xl transition group-hover:opacity-100">
                  <FiUploadCloud aria-hidden className="size-4" />
                  تعویض تصویر
                </span>
              </>
            ) : (
              <span className="grid gap-2.5 px-5 text-xs font-bold text-muted-foreground">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-shah-gold-500/10 text-shah-gold-700 dark:text-shah-gold-200">
                  <FiImage aria-hidden className="size-6" />
                </span>
                <span className="text-sm font-black text-foreground">
                  انتخاب تصویر
                </span>
                <span className="text-[11px] font-bold">
                  JPG · PNG · WebP · GIF
                </span>
              </span>
            )}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />

          <label className="grid gap-1.5 text-xs font-black text-foreground">
            متن جایگزین
            <input
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              placeholder="توضیح کوتاه تصویر"
              className="h-10 w-full rounded-xl border border-shah-gold-500/12 bg-white/64 px-3 text-xs font-bold text-foreground outline-none transition placeholder:text-muted-foreground/55 focus:border-shah-gold-500/35 focus:bg-white focus:ring-4 focus:ring-shah-gold-500/8 dark:border-white/10 dark:bg-white/4.5 dark:focus:bg-white/6.5"
            />
          </label>

          {status ? (
            <p className="rounded-xl border border-red-500/18 bg-red-50/90 px-3 py-2 text-xs font-black leading-6 text-red-700 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-200">
              {status}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2.5 border-t border-shah-gold-500/10 bg-shah-gold-500/5 px-4 py-3 dark:border-white/8 dark:bg-white/2.5">
          <button
            type="button"
            onClick={closeModal}
            className="h-10 rounded-xl border border-shah-gold-500/12 bg-white/62 px-4 text-xs font-black text-foreground transition hover:bg-muted/70 dark:border-white/10 dark:bg-white/4.5"
          >
            انصراف
          </button>

          <button
            type="submit"
            disabled={isUploading}
            className={`h-10 rounded-xl px-5 text-xs font-black shadow-lg transition ${
              isUploading
                ? "cursor-not-allowed bg-shah-lapis-900/55 text-white/65"
                : "bg-shah-lapis-900 text-shah-gold-100 shadow-shah-lapis-900/15 hover:-translate-y-0.5 hover:bg-shah-lapis-800 hover:text-white dark:bg-shah-gold-500 dark:text-shah-black-950 dark:hover:bg-shah-gold-400"
            }`}
          >
            {isUploading ? "در حال آپلود..." : "درج تصویر"}
          </button>
        </div>
      </form>
    </div>,
    portalTarget,
  );
}

function ToolbarButton({
  active,
  children,
  label,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`grid size-7 place-items-center rounded-lg border text-xs font-black transition ${
        active
          ? "border-shah-gold-500 bg-shah-gold-500 text-shah-black-950 shadow-sm shadow-shah-gold-500/15"
          : "border-transparent text-foreground/76 hover:border-shah-gold-500/30 hover:bg-shah-gold-500/10 hover:text-shah-gold-800 dark:hover:text-shah-gold-100"
      }`}
    >
      {children}
    </button>
  );
}

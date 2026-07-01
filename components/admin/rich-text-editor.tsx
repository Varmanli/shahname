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
  "px-5",
  "py-5",
  "text-right",
  "text-xl",
  "leading-[2]",
  "text-foreground",
  "outline-none",
  "max-w-none",
].join(" ");

export function RichTextEditor({
  allowImages = false,
  minHeightClass = "min-h-64",
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
                  "my-6 max-h-[32rem] w-full rounded-2xl object-cover shadow-lg",
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
    <div className="overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 focus-within:border-shah-gold-500 focus-within:ring-2 focus-within:ring-shah-gold-400">
      <EditorToolbar editor={editor} allowImages={allowImages} />
      <EditorContent editor={editor} />
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
    const previousUrl = editor?.getAttributes("link").href as string | undefined;
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
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-muted/50 p-2">
        <ToolbarButton
          label="ضخیم"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FiBold aria-hidden className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="ایتالیک"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FiItalic aria-hidden className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="زیرخط"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <MdFormatUnderlined aria-hidden className="size-5" />
        </ToolbarButton>
        <ToolbarButton
          label="خط خورده"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <MdFormatStrikethrough aria-hidden className="size-5" />
        </ToolbarButton>
        <ToolbarButton
          label="هایلایت"
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <FiEdit3 aria-hidden className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="پاراگراف"
          active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <FiType aria-hidden className="size-4" />
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
            <span className="text-xs font-black leading-none" dir="ltr">
              H{level}
            </span>
          </ToolbarButton>
        ))}
        <ToolbarButton
          label="لیست"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FiList aria-hidden className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="لیست شماره‌دار"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <MdFormatListNumbered aria-hidden className="size-5" />
        </ToolbarButton>
        <ToolbarButton
          label="نقل قول"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <MdFormatQuote aria-hidden className="size-5" />
        </ToolbarButton>
        <ToolbarButton
          label="چینش راست"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <FiAlignRight aria-hidden className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="چینش وسط"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <FiAlignCenter aria-hidden className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="لینک" onClick={setLink} active={editor.isActive("link")}>
          <FiLink aria-hidden className="size-4" />
        </ToolbarButton>
        {allowImages ? (
          <ToolbarButton label="آپلود تصویر" onClick={() => setImageModalOpen(true)}>
            <FiImage aria-hidden className="size-4" />
          </ToolbarButton>
        ) : null}
        <ToolbarButton label="واگرد" onClick={() => editor.chain().focus().undo().run()}>
          <FiCornerUpRight aria-hidden className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="بازانجام"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <FiCornerUpLeft aria-hidden className="size-4" />
        </ToolbarButton>
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

    if (preview) URL.revokeObjectURL(preview);
    onClose();
  }

  const portalTarget = typeof document === "undefined" ? null : document.body;

  if (!portalTarget) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-black/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="آپلود تصویر"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-black">آپلود تصویر</h2>
          <button
            type="button"
            onClick={() => {
              if (preview) URL.revokeObjectURL(preview);
              onClose();
            }}
            className="rounded-lg border border-border px-3 py-2 text-sm font-bold transition hover:bg-muted"
          >
            بستن
          </button>
        </div>

        <div className="grid gap-5 p-5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="relative grid min-h-64 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted text-center transition hover:border-shah-gold-500"
          >
            {preview ? (
              <span
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${preview})` }}
              />
            ) : (
              <span className="grid gap-2 px-5 text-sm font-bold text-muted-foreground">
                <FiImage aria-hidden className="mx-auto size-10 text-shah-gold-600" />
                تصویر را انتخاب کنید
                <span className="text-xs font-medium">JPG, PNG, WebP, GIF</span>
              </span>
            )}
            {preview ? (
              <span className="absolute inset-0 grid place-items-center bg-black/0 text-sm font-black text-white opacity-0 transition hover:bg-black/35 hover:opacity-100">
                تعویض تصویر
              </span>
            ) : null}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />

          <label className="grid gap-2 text-base font-semibold text-foreground">
            متن جایگزین
            <input
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              placeholder="توضیح کوتاه تصویر"
              className="admin-input h-12 text-base"
            />
          </label>

          {status ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {status}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-border bg-muted/35 px-5 py-4">
          <button
            type="button"
            onClick={() => {
              if (preview) URL.revokeObjectURL(preview);
              onClose();
            }}
            className="h-11 rounded-xl border border-border px-5 text-sm font-bold transition hover:bg-muted"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="h-11 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-md transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
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
      className={`grid size-10 place-items-center rounded-xl border text-sm font-bold transition ${
        active
          ? "border-shah-gold-500 bg-shah-gold-500 text-white shadow-sm"
          : "border-border bg-card text-foreground hover:border-shah-gold-500 hover:bg-shah-gold-50 hover:text-shah-gold-700 dark:hover:bg-shah-gold-500/10 dark:hover:text-shah-gold-200"
      }`}
    >
      {children}
    </button>
  );
}

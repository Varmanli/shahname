import Image from "next/image";
import { DragEvent, useRef, useState } from "react";
import { FiImage, FiRefreshCw, FiTrash2, FiUploadCloud } from "react-icons/fi";

import { shouldUseUnoptimizedImage } from "@/lib/images";

type AdminImageUploadProps = {
  label: string;
  onChange: (file: File | null) => void;
  onRemove?: () => void;
  preview: string;
  ratioClass: string;
  required?: boolean;
};

export function AdminImageUpload({
  label,
  onChange,
  onRemove,
  preview,
  ratioClass,
  required,
}: AdminImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function resetInput() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFile(file?: File) {
    if (!file) return;
    onChange(file);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  return (
    <div className="grid gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex min-w-0 items-center gap-2 text-xs font-black text-foreground">
          <span className="truncate">{label}</span>

          {required ? (
            <span className="rounded-full border border-red-500/16 bg-red-500/8 px-2 py-0.5 text-[10px] font-black text-red-600 dark:text-red-300">
              الزامی
            </span>
          ) : null}
        </span>

        {preview && onRemove ? (
          <button
            type="button"
            onClick={() => {
              resetInput();
              onRemove();
            }}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl border border-red-500/16 bg-red-500/8 px-2.5 text-[11px] font-black text-red-600 transition hover:bg-red-500 hover:text-white dark:border-red-400/16 dark:text-red-200"
            title="حذف تصویر"
            aria-label="حذف تصویر"
          >
            <FiTrash2 aria-hidden className="size-3.5" />
            حذف
          </button>
        ) : null}
      </div>

      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          ${preview ? ratioClass : "min-h-36"}
          group relative grid cursor-pointer place-items-center overflow-hidden rounded-[1.35rem] border bg-white/52 shadow-inner shadow-white/25 backdrop-blur-xl transition-all duration-200 dark:bg-white/[0.035] dark:shadow-none
          ${
            preview
              ? "border-shah-gold-500/12 hover:border-shah-gold-500/30 dark:border-white/10"
              : isDragging
                ? "border-shah-gold-500 bg-shah-gold-500/10 ring-4 ring-shah-gold-500/10"
                : "border-dashed border-shah-gold-500/24 hover:border-shah-gold-500/42 hover:bg-shah-gold-500/6 dark:border-white/12 dark:hover:border-white/24"
          }
        `}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt={label}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-105"
                unoptimized={shouldUseUnoptimizedImage(preview)}
            />

            <span className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent opacity-0 transition duration-200 group-hover:opacity-100" />

            <span className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 opacity-0 transition duration-200 group-hover:opacity-100">
              <span className="inline-flex h-9 items-center gap-2 rounded-xl bg-white/94 px-3 text-[11px] font-black text-shah-black-950 shadow-lg backdrop-blur-xl">
                <FiRefreshCw aria-hidden className="size-3.5" />
                تعویض تصویر
              </span>

              <span className="hidden rounded-xl border border-white/18 bg-black/35 px-3 py-2 text-[10px] font-bold text-white/85 backdrop-blur-xl sm:inline-flex">
                کلیک یا Drag & Drop
              </span>
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-2.5 px-4 py-7 text-center">
            <span
              className={`grid size-11 place-items-center rounded-2xl transition duration-200 ${
                isDragging
                  ? "bg-shah-gold-500 text-shah-black-950"
                  : "bg-shah-gold-500/10 text-shah-gold-700 group-hover:scale-105 dark:text-shah-gold-200"
              }`}
            >
              <FiUploadCloud aria-hidden className="size-5" />
            </span>

            <span className="text-xs font-black text-foreground">
              {isDragging ? "رها کنید تا آپلود شود" : "آپلود تصویر"}
            </span>

            <span className="max-w-xs text-[11px] font-bold leading-5 text-muted-foreground">
              کلیک کنید یا فایل را اینجا بکشید و رها کنید.
            </span>

            <span className="inline-flex items-center gap-1 rounded-full border border-shah-gold-500/12 bg-shah-gold-500/8 px-2.5 py-1 text-[10px] font-black text-shah-gold-800 dark:border-shah-gold-300/12 dark:text-shah-gold-100">
              <FiImage aria-hidden className="size-3" />
              JPG · PNG · WebP
            </span>
          </span>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(event) => handleFile(event.target.files?.[0])}
          className="sr-only"
        />
      </label>
    </div>
  );
}

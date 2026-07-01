import Image from "next/image";
import { DragEvent, useRef, useState } from "react";
import { FiImage, FiRefreshCw, FiTrash2, FiUploadCloud } from "react-icons/fi";

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

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      onChange(file);
    }
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
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-foreground">
          {label}
          {required && <span className="text-red-600"> *</span>}
        </span>
        {preview && onRemove ? (
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.value = "";
              }
              onRemove();
            }}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:border-red-300 hover:bg-red-100 hover:text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
            title="حذف تصویر"
            aria-label="حذف تصویر"
          >
            <FiTrash2 aria-hidden className="size-5" />
          </button>
        ) : null}
      </div>

      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
      ${preview ? ratioClass : "min-h-72"} 
      group relative grid place-items-center cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed bg-muted transition-all duration-300
      ${
        isDragging
          ? "border-shah-gold-500 ring-4 ring-shah-gold-300/30"
          : "border-border hover:border-shah-gold-500 hover:ring-0"
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
              className="object-cover"
              unoptimized={preview.startsWith("blob:")}
            />
            <span className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2 text-sm font-black text-shah-black-900 shadow-lg">
                <FiRefreshCw aria-hidden className="size-4" />
                تعویض
              </span>
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-2 px-4 text-center text-sm font-medium text-muted-foreground">
            <span className="grid size-14 place-items-center rounded-2xl bg-shah-gold-100 text-shah-gold-700 dark:bg-shah-gold-500/15 dark:text-shah-gold-200">
              <FiUploadCloud aria-hidden className="size-7" />
            </span>
            <span className="text-base">
              تصویر را انتخاب کنید یا اینجا رها کنید
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <FiImage aria-hidden className="size-4" />
              JPG, PNG, WebP
            </span>
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onChange(file);
            }
          }}
          className="sr-only"
        />
      </label>
    </div>
  );
}

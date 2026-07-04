export function shouldUseUnoptimizedImage(src?: string | null) {
  if (!src) return false;

  return (
    src.startsWith("blob:") ||
    src.startsWith("data:") ||
    src.includes("arvanstorage.ir")
  );
}

"use client";

import { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      setIsVisible(window.scrollY > 520);
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="بازگشت به بالا"
      className={`
        fixed z-50 flex h-14 w-14 items-center justify-center rounded-2xl
        backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        
        /* موقعیت جدید (بالاتر) */
        bottom-20 right-6 md:right-10
        
        /* استایل ظاهری: ترکیب مشکی مات و طلایی */
        bg-black/60 text-shah-gold-400
        border border-white/10
        shadow-[0_20px_50px_rgba(0,0,0,0.5)]
        
        /* حالت هوور حرفه‌ای */
        hover:bg-shah-gold-500 hover:text-black hover:-translate-y-2
        hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]
        hover:border-shah-gold-300/50
        
        /* وضعیت نمایش */
        ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-12 opacity-0 scale-50 pointer-events-none"
        }
      `}
    >
      {/* افکت درخشش داخلی ظریف */}
      <div className="absolute inset-0 rounded-2xl bg-linear-to-tr from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <FiArrowUp
        className={`h-6 w-6 transition-transform duration-300 ${isVisible ? "translate-y-0" : "translate-y-4"}`}
        aria-hidden="true"
      />

      {/* یک نقطه نوری کوچک زیر دکمه برای حس لوکس بودن */}
      <div className="absolute -bottom-2 h-1 w-8 bg-shah-gold-500/20 blur-md" />
    </button>
  );
}

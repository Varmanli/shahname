import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "blue" | "cream" | "red";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  blue: `
    relative overflow-hidden
    bg-shah-lapis-800 text-shah-gold-300 font-semibold
    border-2 border-shah-gold-400
    rounded-[1rem_0.5rem_1rem_0.25rem]
    shadow-lg shadow-shah-gold-900/25
    transition-all duration-300
    hover:scale-105 hover:shadow-xl hover:text-white
    before:absolute before:inset-0 before:border before:border-shah-gold-500 before:rounded-[1rem_0.5rem_1rem_0.25rem] before:opacity-30 before:content-['']
  `,
  cream: `
    relative overflow-hidden
    bg-shah-cream-100 text-shah-lapis-900 font-semibold
    border-2 border-shah-lapis-700
    rounded-[1rem_0.5rem_1rem_0.25rem]
    shadow-md
    transition-all duration-300
    hover:bg-shah-cream-200 hover:shadow-lg hover:scale-105
  `,
  red: `
    relative overflow-hidden
    bg-red-700 text-shah-gold-300 font-semibold
    border-2 border-shah-gold-400
    rounded-[1rem_0.5rem_1rem_0.25rem]
    shadow-md shadow-shah-gold-900/20
    transition-all duration-300
    hover:bg-red-600 hover:shadow-lg hover:scale-105
  `,
};

export function buttonClasses(variant: ButtonVariant = "blue", className = "") {
  return `btn ${variantClasses[variant]} ${className}`.trim();
}

export function Button({
  children,
  className = "",
  type = "button",
  variant = "blue",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, className)}
      {...props}
    >
      {children}
    </button>
  );
}

// ======= استفاده =======
/*
<Button variant="blue">درباره شاهنامه</Button>
<Button variant="cream">شخصیت‌ها</Button>
<Button variant="red">داستان‌ها</Button>
*/

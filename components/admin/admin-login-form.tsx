import { FiKey, FiLogIn, FiZap } from "react-icons/fi";

export function AdminLoginForm({
  error,
  quickAccess,
  returnTo,
}: {
  error?: string;
  quickAccess: boolean;
  returnTo: string;
}) {
  return (
    <div
      dir="rtl"
      className="grid min-h-screen w-full place-items-center bg-shah-cream-50 px-4 py-10 text-foreground dark:bg-[#070707]"
    >
      <section className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-shah-gold-500/18 bg-white/86 shadow-2xl shadow-shah-black-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/30">
        <div className="border-b border-shah-gold-500/14 bg-shah-lapis-900 px-6 py-7 text-white dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-shah-gold-400/16 text-shah-gold-200">
              <FiKey className="size-6" aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-black">ورود به پنل مدیریت</h1>
              <p className="mt-1 text-sm font-bold text-white/62">
                فقط با رمز عبور مدیر
              </p>
            </div>
          </div>
        </div>

        <form action="/api/admin/login" className="grid gap-5 p-6" method="post">
          <input name="next" type="hidden" value={returnTo} />
          <label className="grid gap-2 text-sm font-black text-foreground">
            رمز عبور
            <input
              autoComplete="current-password"
              autoFocus
              className="h-12 rounded-2xl border border-shah-gold-500/20 bg-white px-4 text-left font-bold text-foreground outline-none transition focus:border-shah-gold-500 focus:ring-4 focus:ring-shah-gold-500/12 dark:border-white/10 dark:bg-shah-black-950 dark:text-white"
              dir="ltr"
              name="password"
              type="password"
            />
          </label>

          {error ? (
            <p className="rounded-2xl border border-red-500/18 bg-red-500/8 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-200">
              {error}
            </p>
          ) : null}

          <button
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-shah-lapis-800 px-5 text-sm font-black text-white shadow-lg shadow-shah-lapis-900/18 transition hover:bg-shah-lapis-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-shah-gold-500 dark:text-shah-black-950"
            type="submit"
          >
            <FiLogIn className="size-5" aria-hidden />
            ورود
          </button>
        </form>

        {quickAccess ? (
          <form
            action="/api/admin/login"
            className="border-t border-shah-gold-500/14 p-6 pt-5 dark:border-white/10"
            method="post"
          >
            <input name="next" type="hidden" value={returnTo} />
            <input name="quick" type="hidden" value="true" />
            <button
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-shah-gold-500/24 bg-shah-gold-500/10 px-5 text-sm font-black text-shah-gold-800 transition hover:bg-shah-gold-500/16 disabled:cursor-not-allowed disabled:opacity-60 dark:text-shah-gold-100"
              type="submit"
            >
              <FiZap className="size-5" aria-hidden />
              ورود سریع
            </button>
          </form>
        ) : null}
      </section>
    </div>
  );
}

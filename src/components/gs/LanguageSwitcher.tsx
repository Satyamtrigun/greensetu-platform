import { LANGS, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Languages } from "lucide-react";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border bg-background p-0.5 shadow-sm",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      <Languages className="ml-1.5 size-3.5 text-muted-foreground" />
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
            lang === l.code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

export function GsLogo({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-label="GreenSetu"
    >
      <circle cx="24" cy="24" r="23" className="fill-primary/10" />
      <path
        d="M35.5 15.5A14 14 0 1 0 38 24"
        stroke="var(--primary)"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M38 8v9h-9"
        stroke="var(--primary)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M30 24c0-4.4 3.6-6.5 8-6.5-.2 4.6-3.4 8.1-8 8.1v-1.6Z"
        fill="var(--color-eco, #22A447)"
      />
      <path
        d="M24.5 31c0-3.4 2.8-5 6.2-5-.2 3.5-2.7 6.2-6.2 6.2V31Z"
        fill="var(--accent)"
      />
      <path d="M30 24 21 34" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function GsWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <GsLogo size={compact ? 30 : 34} />
      <span className="text-xl font-extrabold tracking-tight">
        Green<span className="text-primary">Setu</span>
      </span>
    </span>
  );
}

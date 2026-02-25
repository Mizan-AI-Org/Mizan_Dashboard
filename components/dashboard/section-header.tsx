interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, children }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between border-b border-[var(--divider)] pb-3">
      <div className="flex items-center gap-3">
        <div className="h-4 w-[3px] rounded-full bg-emerald-500" />
        <div>
          <h3 className="text-[13px] font-semibold tracking-tight text-[var(--text-secondary)]">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-[var(--text-quaternary)]">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

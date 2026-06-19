import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
};

export function BrandMark({ className, compact = false }: BrandMarkProps) {
  return (
    <div className={cn("text-center", className)}>
      <p
        className={cn(
          "font-semibold tracking-[-0.01em] text-white",
          compact ? "text-3xl" : "text-5xl sm:text-6xl",
        )}
      >
        Pulso<span className="text-[#22d6c8]">Viva</span>
      </p>
      {!compact ? (
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.34em] text-slate-400">
          Inteligência de acesso em
          <br />
          saúde
        </p>
      ) : null}
    </div>
  );
}

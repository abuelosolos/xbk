import { cn } from "@/lib/utils";

/** Green only for paid/shipped, red only for failed; everything else is neutral, outlined or black. */
const TONES = {
  success: "bg-success/10 text-success",
  danger: "bg-sale/10 text-sale",
  neutral: "bg-cloud text-mute",
  outline: "border border-ink bg-white text-ink",
  dark: "bg-ink text-white",
} as const;

export type PillTone = keyof typeof TONES;

export function Pill({ tone = "neutral", children, className }: { tone?: PillTone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-pill px-3 py-1 text-fs-12 font-medium", TONES[tone], className)}>
      {children}
    </span>
  );
}

const STATUS_TONE = {
  paid: "success",
  shipped: "success",
  delivered: "dark",
  failed: "danger",
  pending: "neutral",
  cancelled: "outline",
} as const satisfies Record<string, PillTone>;

export function StatusPill({ status, className }: { status: keyof typeof STATUS_TONE; className?: string }) {
  return (
    <Pill tone={STATUS_TONE[status]} className={cn("capitalize", className)}>
      {status}
    </Pill>
  );
}

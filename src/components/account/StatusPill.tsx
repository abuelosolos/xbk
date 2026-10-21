import { cn } from "@/lib/utils";

const tone = {
  paid: "bg-success/10 text-success",
  shipped: "bg-success/10 text-success",
  delivered: "bg-success/10 text-success",
  failed: "bg-sale/10 text-sale",
  pending: "bg-cloud text-mute",
} as const;

export function StatusPill({ status, className }: { status: keyof typeof tone; className?: string }) {
  return (
    <span className={cn("inline-block rounded-pill px-3 py-0.5 text-fs-12 font-medium capitalize", tone[status], className)}>
      {status}
    </span>
  );
}

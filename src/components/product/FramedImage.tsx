import Image from "next/image";
import { LogoMark } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

/**
 * Product image: photo fills the soft-cloud "studio" gray (multiply
 * blending melts white studio backdrops into it).
 * With no photo yet it renders the XBK mark as a placeholder.
 */
export function FramedImage({
  src,
  label,
  className,
  priority,
  sizes = "(min-width:1024px) 33vw, 50vw",
}: {
  src?: string | null;
  label: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-cloud", className)}>
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
        {src ? (
          <Image
            src={src}
            alt={label}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover mix-blend-multiply"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center" role="img" aria-label={label}>
            <LogoMark className="w-1/3 text-ink/15" />
          </div>
        )}
      </div>
    </div>
  );
}

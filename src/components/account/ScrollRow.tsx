"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { useRef } from "react";

const arrow =
  "grid size-10 place-items-center rounded-full bg-cloud transition hover:bg-hairline-soft active:scale-[0.97] disabled:opacity-40";

/** Snap-scrolling row: swipe on touch, circular arrows from md up. */
export function ScrollRow({ title, children }: { title: string; children: React.ReactNode }) {
  const track = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) =>
    track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section aria-label={title}>
      <div className="mb-4 flex items-center justify-between gap-4 md:mb-6">
        <h2 className="text-fs-24 font-medium">{title}</h2>
        <div className="hidden gap-2 md:flex">
          <button type="button" aria-label="Previous" onClick={() => scroll(-1)} className={arrow}>
            <CaretLeft size={20} />
          </button>
          <button type="button" aria-label="Next" onClick={() => scroll(1)} className={arrow}>
            <CaretRight size={20} />
          </button>
        </div>
      </div>
      <ul
        ref={track}
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 md:-mx-8 md:px-8 lg:mx-0 lg:px-0"
      >
        {children}
      </ul>
    </section>
  );
}

import type { ReactNode } from "react";

/** Standalone auth layout: the form on a plain white page, with the secondary links beneath it. */
export function AuthShell({ children, below }: { children: ReactNode; below: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[400px] flex-col justify-center px-4 py-10">
      <div>{children}</div>
      <div className="mt-6 text-center">{below}</div>
    </div>
  );
}

"use client";

/** Header checkbox that ticks every product checkbox (name="ids") on the page. */
export function SelectAll() {
  return (
    <input
      type="checkbox"
      aria-label="Select all products"
      className="size-5 accent-ink"
      onChange={(e) => {
        for (const box of document.querySelectorAll<HTMLInputElement>('input[name="ids"]')) {
          box.checked = e.target.checked;
        }
        document.dispatchEvent(new Event("bulk-select"));
      }}
    />
  );
}

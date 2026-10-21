/** Nigerian flag: green, white, green vertical bands. */
export function NigeriaFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 20" role="img" aria-label="Nigeria" className={className} width="24" height="16">
      <rect width="30" height="20" rx="2" fill="#fff" />
      <path fill="#008751" d="M2 0h8v20H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zM20 0h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-8z" />
      <rect x=".5" y=".5" width="29" height="19" rx="1.5" fill="none" stroke="#000" strokeOpacity=".12" />
    </svg>
  );
}

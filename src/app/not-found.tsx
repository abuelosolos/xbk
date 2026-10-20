import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-6 px-4 py-32 lg:px-12">
      <h1 className="display-campaign">Off course.</h1>
      <p className="text-fs-16 text-mute">We couldn&apos;t find that page.</p>
      <ButtonLink href="/shop">Shop All</ButtonLink>
    </div>
  );
}

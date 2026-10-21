import { ButtonLink } from "@/components/ui/Button";

export default function OrderNotFound() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-24 md:px-8 lg:px-12">
      <h1 className="mb-2 text-fs-32 font-medium leading-tight">Order not found</h1>
      <p className="mb-8 text-fs-16 text-mute">We couldn&apos;t find that order on your account.</p>
      <ButtonLink href="/account">Back to Account</ButtonLink>
    </div>
  );
}

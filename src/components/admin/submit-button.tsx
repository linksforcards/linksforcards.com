"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, quiet = false }: { children: string; quiet?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className={quiet ? "quiet" : undefined} type="submit" disabled={pending}>
      {pending ? "Working…" : children}
    </button>
  );
}

"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/server/actions";
import { SubmitButton } from "./submit-button";

export function LoginForm({ notice }: { notice: string | null }) {
  const [state, action] = useActionState(login, null as FormState);
  const message = state?.error ?? notice;
  return (
    <form className="grid-form" action={action}>
      {message ? <p className="banner warn">{message}</p> : null}
      <label>
        Email
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <SubmitButton>Sign in</SubmitButton>
    </form>
  );
}

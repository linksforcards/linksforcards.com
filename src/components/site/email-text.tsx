import { site } from "@/lib/site";

export function EmailText({ text }: { text: string }) {
  const email = site.email;
  const index = text.indexOf(email);
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <a href={`mailto:${email}`}>{email}</a>
      {text.slice(index + email.length)}
    </>
  );
}

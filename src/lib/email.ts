import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

interface ResendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: ResendEmailOptions) {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject,
    html,
  });
}

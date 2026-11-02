import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY ?? "";
const resendFromEmail = process.env.RESEND_FROM_EMAIL ?? "";

if (!resendApiKey) {
  throw new Error("Missing required environment variable: RESEND_API_KEY");
}

if (!resendFromEmail) {
  throw new Error("Missing required environment variable: RESEND_FROM_EMAIL");
}

const resend = new Resend(resendApiKey);

interface ResendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: ResendEmailOptions) {
  const { error } = await resend.emails.send({
    from: resendFromEmail,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend failed to send email: ${error.message}`);
  }
}

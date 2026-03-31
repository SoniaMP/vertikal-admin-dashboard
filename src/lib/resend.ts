export async function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing RESEND_API_KEY");
  const { Resend } = await import("resend");
  return new Resend(apiKey);
}

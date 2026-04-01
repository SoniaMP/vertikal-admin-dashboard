import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getResend } from "@/lib/resend";
import { renderBrandedEmail } from "@/lib/email-renderer";
import { createElement } from "react";
import { TEMPLATES } from "../templates";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { template, email } = await request.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "Email destinatario requerido" },
      { status: 400 },
    );
  }

  const entry = TEMPLATES[template];
  if (!entry) {
    return NextResponse.json(
      { error: "Template not found" },
      { status: 404 },
    );
  }

  const element = createElement(entry.component, entry.props);
  const html = await renderBrandedEmail(element);

  const from = process.env.EMAIL_FROM;
  if (!from) {
    return NextResponse.json(
      { error: "EMAIL_FROM no configurado" },
      { status: 500 },
    );
  }

  const resend = await getResend();
  await resend.emails.send({
    from,
    to: email,
    subject: `[TEST] ${entry.label}`,
    html,
  });

  return NextResponse.json({ ok: true });
}

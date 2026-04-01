import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { renderBrandedEmail } from "@/lib/email-renderer";
import { createElement } from "react";
import { TEMPLATES } from "../templates";

function buildSendToolbar(template: string): string {
  return `
<div id="send-toolbar" style="position:fixed;top:0;left:0;right:0;z-index:9999;background:#1e293b;padding:12px 16px;display:flex;align-items:center;gap:8px;font-family:system-ui,sans-serif;">
  <label style="color:#e2e8f0;font-size:14px;font-weight:500;">Enviar test a:</label>
  <input id="send-email" type="email" placeholder="email@ejemplo.com"
    style="padding:6px 10px;border-radius:6px;border:1px solid #475569;background:#0f172a;color:#f8fafc;font-size:14px;width:260px;" />
  <button onclick="sendTest()" id="send-btn"
    style="padding:6px 16px;border-radius:6px;border:none;background:#2563eb;color:#fff;font-size:14px;font-weight:500;cursor:pointer;">
    Enviar
  </button>
  <span id="send-status" style="color:#94a3b8;font-size:13px;"></span>
</div>
<div style="height:52px;"></div>
<script>
async function sendTest() {
  const email = document.getElementById('send-email').value.trim();
  const status = document.getElementById('send-status');
  const btn = document.getElementById('send-btn');
  if (!email) { status.textContent = 'Introduce un email'; return; }
  btn.disabled = true;
  btn.style.opacity = '0.5';
  status.textContent = 'Enviando...';
  try {
    const res = await fetch('/api/email-preview/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template: '${template}', email }),
    });
    const data = await res.json();
    status.textContent = res.ok ? 'Enviado ✓' : data.error || 'Error';
    status.style.color = res.ok ? '#4ade80' : '#f87171';
  } catch { status.textContent = 'Error de red'; status.style.color = '#f87171'; }
  finally { btn.disabled = false; btn.style.opacity = '1'; }
}
</script>`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ template: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { template } = await params;
  const entry = TEMPLATES[template];

  if (!entry) {
    const available = Object.keys(TEMPLATES);
    return NextResponse.json({ error: "Template not found", available }, { status: 404 });
  }

  const element = createElement(entry.component, entry.props);
  const emailHtml = await renderBrandedEmail(element);

  const toolbar = buildSendToolbar(template);
  const html = emailHtml.replace(
    "<body",
    `${toolbar}<body`,
  );

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

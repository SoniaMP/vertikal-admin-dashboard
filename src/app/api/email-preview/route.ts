import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { TEMPLATES } from "./templates";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const links = Object.entries(TEMPLATES).map(([slug, { label }]) => ({
    label,
    url: `/api/email-preview/${slug}`,
  }));

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Email Preview</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 480px; margin: 60px auto; color: #1a1a1a; }
    h1 { font-size: 1.25rem; margin-bottom: 1.5rem; }
    ul { list-style: none; padding: 0; }
    li { margin-bottom: 0.75rem; }
    a { color: #004522; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Email templates</h1>
  <ul>
    ${links.map((l) => `<li><a href="${l.url}">${l.label}</a></li>`).join("\n    ")}
  </ul>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

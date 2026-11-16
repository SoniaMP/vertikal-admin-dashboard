import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import { uploadsPath } from "@/lib/uploads-dir";
import { auth } from "@/lib/auth";

const MAX_SIZE = 1 * 1024 * 1024; // 1 MB

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/svg+xml": ".svg",
};

/**
 * The email logo is an administration setting, configured in /admin/ajustes.
 * The middleware only guards pages, so without this check the endpoint was a
 * public write to the club's disk, and an instructor could reach a setting
 * their role is kept out of everywhere else.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Se requiere rol de administrador" },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No se ha proporcionado un archivo" },
      { status: 400 },
    );
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Solo se permiten imágenes PNG, JPG o SVG" },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "La imagen no puede superar 1 MB" },
      { status: 400 },
    );
  }

  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadsPath("branding"), { recursive: true });
  await writeFile(uploadsPath("branding", filename), buffer);

  return NextResponse.json({
    url: `/api/uploads/branding/${filename}`,
  });
}

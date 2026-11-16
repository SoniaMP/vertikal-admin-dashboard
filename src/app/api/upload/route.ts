import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import { uploadsPath } from "@/lib/uploads-dir";
import { hitRateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/helpers/client-ip";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

/** Every PDF starts with these bytes, whatever the client claims to be sending. */
const PDF_MAGIC = "%PDF-";

function reject(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error: message }, { status, headers });
}

function isPdf(bytes: Buffer): boolean {
  return bytes.subarray(0, PDF_MAGIC.length).toString("latin1") === PDF_MAGIC;
}

/**
 * Public on purpose: a visitor attaches their federation license while
 * registering, before any account exists. That makes it the one endpoint a
 * stranger can write to, so it is capped, rate limited, and checked by the
 * file's own first bytes rather than by the content type the client declares.
 */
export async function POST(request: NextRequest) {
  // Before reading the body: the point is not to accept five megabytes from
  // someone already over their limit.
  const limit = hitRateLimit({
    key: clientIp(request.headers),
    ...RATE_LIMIT,
  });
  if (!limit.isAllowed) {
    return reject(
      "Has subido demasiados archivos seguidos. Espera unos minutos y vuelve a intentarlo.",
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return reject("No se ha proporcionado un archivo", 400);
  }

  if (file.size > MAX_SIZE) {
    return reject("El archivo no puede superar los 5 MB", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (!isPdf(buffer)) {
    return reject("El archivo no es un PDF. Sube la licencia en PDF.", 400);
  }

  const filename = `${randomUUID()}.pdf`;
  const directory = uploadsPath("licenses");

  await mkdir(directory, { recursive: true });
  await writeFile(uploadsPath("licenses", filename), buffer);

  return NextResponse.json({ url: `/api/uploads/licenses/${filename}` });
}

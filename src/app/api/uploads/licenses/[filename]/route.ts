import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { auth } from "@/lib/auth";

const UPLOAD_DIR = join(process.cwd(), "data/uploads/licenses");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  // These PDFs carry the member's name, document number and license number.
  // The file name is the only secret protecting them, so only signed-in admins
  // may read one.
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { filename } = await params;

  if (!filename.match(/^[a-f0-9-]+\.pdf$/)) {
    return NextResponse.json({ error: "Archivo no válido" }, { status: 400 });
  }

  const filePath = join(UPLOAD_DIR, filename);

  if (!existsSync(filePath)) {
    return NextResponse.json(
      { error: "Archivo no encontrado" },
      { status: 404 },
    );
  }

  const buffer = await readFile(filePath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}

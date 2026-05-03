import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchAllCourseParticipants } from "@/lib/course-participant-queries";
import { buildCsv } from "@/lib/csv-utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const [{ id }, session] = await Promise.all([context.params, auth()]);

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (session.user.role === "INSTRUCTOR") {
    const course = await prisma.courseCatalog.findUnique({
      where: { id },
      select: { instructorId: true },
    });
    if (course?.instructorId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
  }

  const participants = await fetchAllCourseParticipants(id);

  const header = [
    "Nombre",
    "Apellidos",
    "Email",
    "Teléfono",
    "DNI",
    "Fecha nacimiento",
    "Dirección",
    "Ciudad",
    "Código postal",
    "Provincia",
    "Categoría de pago",
    "Estado de pago",
    "Tipo licencia",
    "Fecha inscripción",
  ];

  const rows = participants.map((p) => [
    p.firstName,
    p.lastName,
    p.email,
    p.phone ?? "",
    p.dni ?? "",
    p.dateOfBirth ?? "",
    p.address ?? "",
    p.city ?? "",
    p.postalCode ?? "",
    p.province ?? "",
    p.coursePrice.name,
    p.paymentStatus,
    p.licenseType ?? "",
    p.createdAt.toISOString().slice(0, 10),
  ]);

  const csv = buildCsv(header, rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="participantes-curso.csv"',
    },
  });
}

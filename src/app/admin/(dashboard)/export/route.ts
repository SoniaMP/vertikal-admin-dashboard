import { NextRequest, NextResponse } from "next/server";
import { resolveSelectedSeason } from "@/lib/selected-season";
import { parseFilterParams } from "@/lib/filter-params";
import { buildMembershipWhere } from "@/lib/admin-queries";
import { prisma } from "@/lib/prisma";
import { buildCsv } from "@/lib/csv-utils";

const MAX_ROWS = 5000;

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  // Same resolution as the screen, so the file holds the year being looked at
  // rather than whichever one is in force today.
  const { seasonId } = await resolveSelectedSeason(params.year);
  const filters = parseFilterParams(params, seasonId);
  const where = buildMembershipWhere(filters);

  const memberships = await prisma.membership.findMany({
    where,
    include: {
      member: true,
      type: { select: { name: true } },
      subtype: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: MAX_ROWS,
  });

  const header = [
    "Nombre",
    "Apellidos",
    "DNI",
    "Sexo",
    "Email",
    "Teléfono",
    "Provincia",
    "Ciudad",
    "Tipo licencia",
    "Subtipo",
    "Categoría",
    "Federado",
    "Total",
    "Estado",
    "Estado pago",
    "Fecha",
  ];

  const rows = memberships.map((m) => [
    m.member.firstName,
    m.member.lastName,
    m.member.dni,
    m.member.sex === "M" ? "Hombre" : m.member.sex === "F" ? "Mujer" : "",
    m.member.email,
    m.member.phone,
    m.member.province,
    m.member.city,
    m.type?.name ?? "",
    m.subtype?.name ?? "",
    m.category?.name ?? "",
    m.isFederated ? "Sí" : "No",
    (m.totalAmount / 100).toFixed(2),
    m.status,
    m.paymentStatus,
    m.createdAt.toISOString().slice(0, 10),
  ]);

  const csv = buildCsv(header, rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="miembros.csv"',
    },
  });
}

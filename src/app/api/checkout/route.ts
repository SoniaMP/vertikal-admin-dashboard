import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { registrationSchema } from "@/validations/registration";
import { getMembershipFee, getActiveSeason } from "@/lib/settings";
import { findOrCreateMembership } from "@/lib/checkout";

export async function POST(request: NextRequest) {
  try {
    return await handleCheckout(request);
  } catch (err) {
    if (err instanceof SupplementError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const message =
      err instanceof Error ? err.message : "Error interno del servidor";
    console.error("Checkout error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleCheckout(request: NextRequest) {
  const stripe = getStripe();
  const body = await request.json();
  const parsed = registrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos de registro inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const season = await getActiveSeason();

  const offering = await prisma.licenseOffering.findFirst({
    where: {
      seasonId: season.id,
      typeId: data.typeId,
      subtypeId: data.subtypeId,
      categoryId: data.categoryId,
    },
    include: { type: true, subtype: true, category: true },
  });

  if (!offering) {
    return NextResponse.json(
      { error: "No hay oferta para esta combinación de licencia y categoría" },
      { status: 400 },
    );
  }

  const { membershipFee, supplementsTotal, supplementLineItems, supplements } =
    await resolveSupplements(data.supplementIds, season.id);

  const total = offering.price + membershipFee + supplementsTotal;
  const licenseLabel = `${offering.type.name} - ${offering.subtype.name} - ${offering.category.name}`;

  const member = await prisma.member.upsert({
    where: { dni: data.dni },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      province: data.province,
    },
    create: {
      dni: data.dni,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      province: data.province,
    },
  });

  const { membership, isAlreadyActive } = await findOrCreateMembership({
    memberId: member.id,
    seasonId: season.id,
    typeId: data.typeId,
    subtypeId: data.subtypeId,
    categoryId: data.categoryId,
    offeringId: offering.id,
    licensePriceSnapshot: offering.price,
    licenseLabelSnapshot: licenseLabel,
    totalAmount: total,
    supplements,
  });

  if (isAlreadyActive) {
    return NextResponse.json(
      { error: "Ya tienes una inscripción activa para esta temporada" },
      { status: 409 },
    );
  }

  return await createStripeSession({
    stripe,
    membership: membership!,
    licenseLabel,
    offering,
    membershipFee,
    supplementLineItems,
    email: data.email,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin,
  });
}

async function resolveSupplements(supplementIds: string[], seasonId: string) {
  const membershipFee = await getMembershipFee();

  if (supplementIds.length === 0) {
    return {
      membershipFee,
      supplementsTotal: 0,
      supplementLineItems: [] as { name: string; price: number }[],
      supplements: [] as { supplementId: string; priceAtTime: number }[],
    };
  }

  const selectedSupplements = await prisma.supplement.findMany({
    where: { id: { in: supplementIds }, active: true },
    include: { supplementGroup: true },
  });

  if (selectedSupplements.length !== supplementIds.length) {
    throw new SupplementError("Suplementos inválidos");
  }

  const supplementPrices = await prisma.supplementPrice.findMany({
    where: { seasonId, supplementId: { in: supplementIds } },
  });
  const priceBySupplementId = new Map(
    supplementPrices.map((sp) => [sp.supplementId, sp.price]),
  );

  const groupIds = [
    ...new Set(
      selectedSupplements
        .map((s) => s.supplementGroupId)
        .filter((id): id is string => id !== null),
    ),
  ];

  const groupPrices = await prisma.supplementGroupPrice.findMany({
    where: { seasonId, groupId: { in: groupIds } },
  });
  const priceByGroupId = new Map(
    groupPrices.map((gp) => [gp.groupId, gp.price]),
  );

  let supplementsTotal = 0;
  const supplementLineItems: { name: string; price: number }[] = [];
  const seenGroupIds = new Set<string>();

  for (const s of selectedSupplements) {
    if (s.supplementGroupId && priceByGroupId.has(s.supplementGroupId)) {
      if (!seenGroupIds.has(s.supplementGroupId)) {
        seenGroupIds.add(s.supplementGroupId);
        const groupPrice = priceByGroupId.get(s.supplementGroupId)!;
        const groupName = s.supplementGroup?.name ?? "Grupo";
        supplementLineItems.push({ name: groupName, price: groupPrice });
        supplementsTotal += groupPrice;
      }
    } else {
      const price = priceBySupplementId.get(s.id) ?? 0;
      supplementLineItems.push({ name: s.name, price });
      supplementsTotal += price;
    }
  }

  const supplements = selectedSupplements.map((s) => ({
    supplementId: s.id,
    priceAtTime: priceBySupplementId.get(s.id) ?? 0,
  }));

  return { membershipFee, supplementsTotal, supplementLineItems, supplements };
}

interface StripeSessionInput {
  stripe: ReturnType<typeof getStripe>;
  membership: { id: string };
  licenseLabel: string;
  offering: { price: number };
  membershipFee: number;
  supplementLineItems: { name: string; price: number }[];
  email: string;
  appUrl: string;
}

async function createStripeSession(input: StripeSessionInput) {
  const {
    stripe, membership, licenseLabel, offering,
    membershipFee, supplementLineItems, email, appUrl,
  } = input;

  const lineItems = [
    {
      price_data: {
        currency: "eur",
        product_data: { name: licenseLabel },
        unit_amount: offering.price,
      },
      quantity: 1,
    },
    {
      price_data: {
        currency: "eur",
        product_data: { name: "Cuota de socio" },
        unit_amount: membershipFee,
      },
      quantity: 1,
    },
    ...supplementLineItems.map((s) => ({
      price_data: {
        currency: "eur",
        product_data: { name: s.name },
        unit_amount: s.price,
      },
      quantity: 1,
    })),
  ];

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: email,
      metadata: { membershipId: membership.id },
      success_url: `${appUrl}/registro/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/registro/cancelado?membership_id=${membership.id}`,
    });

    await prisma.membership.update({
      where: { id: membership.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    await prisma.membership.update({
      where: { id: membership.id },
      data: { paymentStatus: "FAILED", status: "CANCELLED" },
    });

    const message =
      err instanceof Error ? err.message : "Error al crear sesión de pago";
    console.error("Stripe checkout error:", message);

    return NextResponse.json(
      { error: `Error al conectar con la pasarela de pago: ${message}` },
      { status: 502 },
    );
  }
}

class SupplementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupplementError";
  }
}

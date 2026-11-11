import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { registrationSchema } from "@/validations/registration";
import { getMembershipFee, getActiveSeason } from "@/lib/settings";
import { findOrCreateMembership } from "@/lib/checkout";
import { buildCheckoutPlan } from "@/lib/checkout-plan";
import { createCheckoutSession } from "@/lib/checkout-session";
import { CheckoutError } from "@/lib/checkout-error";
import type { RegistrationInput } from "@/validations/registration";

export async function POST(request: NextRequest) {
  try {
    return await handleCheckout(request);
  } catch (err) {
    if (err instanceof CheckoutError) {
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
  const parsed = registrationSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos de registro inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const season = await getActiveSeason();
  const membershipFee = await getMembershipFee();

  const plan = await buildCheckoutPlan({
    data,
    seasonId: season.id,
    membershipFee,
  });

  const member = await upsertMember(data);

  const { membership, isAlreadyActive } = await findOrCreateMembership({
    memberId: member.id,
    seasonId: season.id,
    totalAmount: plan.total,
    supplements: plan.supplements,
    ...plan.membershipFields,
  });

  if (isAlreadyActive) {
    return NextResponse.json(
      { error: "Ya tienes una inscripción activa para esta temporada" },
      { status: 409 },
    );
  }

  const { url, error } = await createCheckoutSession({
    stripe,
    membershipId: membership!.id,
    lineItems: plan.lineItems,
    email: data.email,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin,
  });

  if (error) return NextResponse.json({ error }, { status: 502 });
  return NextResponse.json({ url });
}

function upsertMember(data: RegistrationInput) {
  const personalData = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    dateOfBirth: data.dateOfBirth,
    sex: data.sex,
    address: data.address,
    city: data.city,
    postalCode: data.postalCode,
    province: data.province,
  };

  return prisma.member.upsert({
    where: { dni: data.dni },
    update: personalData,
    create: { dni: data.dni, ...personalData },
  });
}

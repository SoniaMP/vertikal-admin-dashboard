import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { courseRegistrationCheckoutSchema } from "@/validations/course";
import { getCourseAvailableSpots } from "@/lib/course-queries";
import { isRegistrationClosed } from "@/helpers/registration-deadline";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = courseRegistrationCheckoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos de inscripción inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const course = await prisma.courseCatalog.findUnique({
    where: { id: data.courseCatalogId, status: "ACTIVE", deletedAt: null },
    select: {
      id: true,
      title: true,
      maxCapacity: true,
      registrationDeadline: true,
    },
  });

  if (!course) {
    return NextResponse.json(
      { error: "Curso no encontrado o no disponible" },
      { status: 404 },
    );
  }

  if (isRegistrationClosed(course.registrationDeadline)) {
    return NextResponse.json(
      { error: "El plazo de inscripción ha cerrado" },
      { status: 409 },
    );
  }

  const spots = await getCourseAvailableSpots(course.id);
  if (spots <= 0) {
    return NextResponse.json(
      { error: "No quedan plazas disponibles" },
      { status: 409 },
    );
  }

  const price = await prisma.coursePrice.findFirst({
    where: { id: data.coursePriceId, courseCatalogId: course.id, isActive: true },
  });

  if (!price) {
    return NextResponse.json(
      { error: "Precio seleccionado no válido" },
      { status: 400 },
    );
  }

  let registration;
  try {
    registration = await prisma.courseRegistration.create({
      data: {
        courseCatalogId: course.id,
        coursePriceId: price.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone ?? null,
        dni: data.dni,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        province: data.province,
        licenseType: data.licenseType,
        licenseFileUrl: data.licenseFileUrl,
        paymentStatus: "PENDING",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al crear la inscripción";
    console.error("Course registration create error:", message);
    return NextResponse.json(
      { error: "Error al crear la inscripción" },
      { status: 500 },
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `${course.title} — ${price.name}` },
            unit_amount: price.amountCents,
          },
          quantity: 1,
        },
      ],
      customer_email: data.email,
      metadata: { courseRegistrationId: registration.id },
      success_url: `${appUrl}/cursos/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cursos/cancelado?registration_id=${registration.id}`,
    });

    await prisma.courseRegistration.update({
      where: { id: registration.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    await prisma.courseRegistration.update({
      where: { id: registration.id },
      data: { paymentStatus: "FAILED" },
    });

    const message =
      err instanceof Error ? err.message : "Error al crear sesión de pago";
    console.error("Stripe course checkout error:", message);

    return NextResponse.json(
      { error: `Error al conectar con la pasarela de pago: ${message}` },
      { status: 502 },
    );
  }
}

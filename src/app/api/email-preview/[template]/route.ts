import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { renderBrandedEmail } from "@/lib/email-renderer";
import Welcome from "@/emails/welcome";
import MembershipConfirmation from "@/emails/membership-confirmation";
import CourseConfirmation from "@/emails/course-confirmation";
import { createElement, type ComponentType } from "react";

type TemplateEntry = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic template registry
  component: ComponentType<any>;
  props: Record<string, unknown>;
};

const TEMPLATES: Record<string, TemplateEntry> = {
  welcome: {
    component: Welcome,
    props: Welcome.PreviewProps,
  },
  "membership-confirmation": {
    component: MembershipConfirmation,
    props: MembershipConfirmation.PreviewProps,
  },
  "course-confirmation": {
    component: CourseConfirmation,
    props: CourseConfirmation.PreviewProps,
  },
};

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
  const html = await renderBrandedEmail(element);

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

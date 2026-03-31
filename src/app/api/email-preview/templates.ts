import type { ComponentType } from "react";
import MembershipConfirmation from "@/emails/membership-confirmation";
import CourseConfirmation from "@/emails/course-confirmation";

export type TemplateEntry = {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic template registry
  component: ComponentType<any>;
  props: Record<string, unknown>;
};

export const TEMPLATES: Record<string, TemplateEntry> = {
  "membership-confirmation": {
    label: "Confirmacion de inscripcion",
    component: MembershipConfirmation,
    props: MembershipConfirmation.PreviewProps,
  },
  "course-confirmation": {
    label: "Confirmacion de curso",
    component: CourseConfirmation,
    props: CourseConfirmation.PreviewProps,
  },
};

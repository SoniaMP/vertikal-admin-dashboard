import type { ComponentType } from "react";
import MembershipConfirmation from "@/emails/membership-confirmation";
import CourseConfirmation from "@/emails/course-confirmation";
import ClubMembershipNotification from "@/emails/club-membership-notification";
import ClubCourseNotification from "@/emails/club-course-notification";

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
  "club-membership-notification": {
    label: "Notificacion de nueva inscripcion",
    component: ClubMembershipNotification,
    props: ClubMembershipNotification.PreviewProps,
  },
  "club-course-notification": {
    label: "Notificacion de nueva inscripcion en curso",
    component: ClubCourseNotification,
    props: ClubCourseNotification.PreviewProps,
  },
};

export type AttentionNotice = {
  id: string;
  message: string;
  actionLabel: string;
  actionHref: string;
};

export type AttentionInput = {
  membershipRecipients: string[];
  courseRecipients: string[];
  /** Courses not deleted. Zero means the club does not run courses. */
  courseCount: number;
};

const SETTINGS_HREF = "/admin/ajustes";

/**
 * What the club needs to fix right now, derived from the current state so each
 * notice disappears on its own once it is handled. Only states belong here,
 * never events: a notice nobody can clear becomes wallpaper, and then the one
 * that matters gets skipped along with it.
 */
export function buildAttentionNotices({
  membershipRecipients,
  courseRecipients,
  courseCount,
}: AttentionInput): AttentionNotice[] {
  const notices: AttentionNotice[] = [];

  if (membershipRecipients.length === 0) {
    notices.push({
      id: "membership-notifications",
      message:
        "No hay ninguna dirección configurada para avisar de las altas de socios. Nadie del club se está enterando de los registros nuevos.",
      actionLabel: "Configurar",
      actionHref: SETTINGS_HREF,
    });
  }

  // A club with no courses does not need reminding forever about a feature it
  // never uses, so the notice only shows up once there is a course.
  if (courseRecipients.length === 0 && courseCount > 0) {
    notices.push({
      id: "course-notifications",
      message:
        "No hay ninguna dirección configurada para avisar de las inscripciones a cursos. Solo se avisa al instructor asignado a cada curso, y un curso sin instructor no avisa a nadie.",
      actionLabel: "Configurar",
      actionHref: SETTINGS_HREF,
    });
  }

  return notices;
}

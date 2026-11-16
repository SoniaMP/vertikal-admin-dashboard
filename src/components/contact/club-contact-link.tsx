import { CLUB_CONTACT_EMAIL } from "@/helpers/club-contact";

type ClubContactLinkProps = {
  /** Prefilled so the two or three volunteers can triage their inbox. */
  subject?: string;
};

/**
 * Takes its colour from the text around it, so the same link works on the
 * white of a form and inside a muted footer line.
 */
export function ClubContactLink({ subject }: ClubContactLinkProps) {
  const href = subject
    ? `mailto:${CLUB_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`
    : `mailto:${CLUB_CONTACT_EMAIL}`;

  return (
    <a
      href={href}
      className="font-semibold text-primary underline underline-offset-4"
    >
      {CLUB_CONTACT_EMAIL}
    </a>
  );
}

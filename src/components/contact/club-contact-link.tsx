import { CLUB_CONTACT_EMAIL } from "@/helpers/club-contact";

type ClubContactLinkProps = {
  /** Prefilled so the two or three volunteers can triage their inbox. */
  subject?: string;
};

export function ClubContactLink({ subject }: ClubContactLinkProps) {
  const href = subject
    ? `mailto:${CLUB_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`
    : `mailto:${CLUB_CONTACT_EMAIL}`;

  return (
    <a
      href={href}
      className="font-medium text-primary underline underline-offset-2"
    >
      {CLUB_CONTACT_EMAIL}
    </a>
  );
}

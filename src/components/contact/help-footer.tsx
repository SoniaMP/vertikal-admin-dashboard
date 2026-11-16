import { ClubContactLink } from "./club-contact-link";

type HelpFooterProps = {
  /** What the member was doing, so the reply lands on the right volunteer. */
  subject?: string;
};

/**
 * Every public page ends here. Until now the club's address appeared only
 * inside the data-protection dialog, so a member who got stuck had nowhere to
 * write from the one screen they were stuck on.
 */
export function HelpFooter({ subject }: HelpFooterProps) {
  return (
    <footer className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
      ¿Tienes dudas o algo no te funciona? Escríbenos a{" "}
      <ClubContactLink subject={subject} /> y te ayudamos.
    </footer>
  );
}

import { ClubContactLink } from "./club-contact-link";

type HelpFooterProps = {
  /** What the member was doing, so the reply lands on the right volunteer. */
  subject?: string;
};

/**
 * Every public page closes here. Until recently the club's address lived only
 * inside the data-protection dialog, so a member who got stuck had nowhere to
 * write from the screen they were stuck on.
 *
 * The soft rule above it is the club's own preference, kept over the house
 * style that would separate with space alone.
 */
export function HelpFooter({ subject }: HelpFooterProps) {
  return (
    <footer className="mt-20 border-t border-primary/10">
      <div className="mx-auto w-full max-w-[920px] px-5 p-8 text-center">
        <p className="mx-auto text-base text-muted-foreground">
          ¿Tienes dudas o algo no te funciona? Escríbenos a{" "}
          <ClubContactLink subject={subject} /> y te ayudamos.
        </p>
      </div>
    </footer>
  );
}

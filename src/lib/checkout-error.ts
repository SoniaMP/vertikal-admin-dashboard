/**
 * A problem with the submitted registration that the member can act on, such
 * as an unavailable license combination or a supplement that no longer exists.
 * The checkout route turns it into a 400 with the message shown to the member.
 */
export class CheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutError";
  }
}

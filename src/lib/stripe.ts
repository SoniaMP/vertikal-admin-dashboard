// import Stripe from "stripe";

// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2026-01-28.clover",
//   typescript: true,
// });

import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");

  console.log("STRIPE KEY PREFIX:", key.slice(0, 8));
  console.log("WEBHOOK SECRET PREFIX:", process.env.STRIPE_WEBHOOK_SECRET?.slice(0, 8));

  return new Stripe(key, {
    apiVersion: "2026-01-28.clover",
    typescript: true,
  });
}

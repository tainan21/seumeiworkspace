import { revalidatePath } from "next/cache";
import { type NextRequest } from "next/server";
import { z } from "zod";
import { siteConfig } from "~/config/site";
import { proPlan } from "~/config/subscription";
import { getCurrentSession } from "~/lib/server/auth/session";
import { getUserSubscriptionPlan, stripe } from "~/lib/server/payment";

export async function GET(req: NextRequest) {
  const locale = req.cookies.get("Next-Locale")?.value || "en";

  const billingUrl = siteConfig(locale).url + "/dashboard/billing/";
  try {
    const { user, session } = await getCurrentSession();

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (!user.email) {
      return new Response(
        JSON.stringify({ error: "User email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const subscriptionPlan = await getUserSubscriptionPlan(user.id);

    // The user is on the pro plan.
    // Create a portal session to manage subscription.
    if (subscriptionPlan.isPro && subscriptionPlan.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: subscriptionPlan.stripeCustomerId,
        return_url: billingUrl,
      });

      return Response.json({ url: stripeSession.url });
    }

    // The user is on the free plan.
    // Create a checkout session to upgrade.
    if (!proPlan.stripePriceId) {
      console.error("[STRIPE_API_ERROR] STRIPE_PRO_PLAN_ID is not configured");
      return new Response(
        JSON.stringify({ error: "Stripe price ID is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: user.email,
      line_items: [
        {
          price: proPlan.stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
      },
    });
    revalidatePath(`/dashboard/billing`);
    return new Response(JSON.stringify({ url: stripeSession.url }));
  } catch (error) {
    console.error("[STRIPE_API_ERROR]", error);
    
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 });
    }

    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

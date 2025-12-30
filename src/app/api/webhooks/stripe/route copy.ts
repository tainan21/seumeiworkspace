import { type NextRequest } from "next/server";
import { buffer } from "node:stream/consumers";
import type Stripe from "stripe";
import { stripe } from "~/lib/server/payment";
import { prisma } from "~/lib/server/db";

/**
 * ===============================
 * Stripe Webhook Entry Point
 * ===============================
 * Fase 2:
 * - Eventos do ciclo de vida da subscription
 * - Sistema reflete estado real da Stripe
 */
export async function POST(req: NextRequest) {
  const rawBody = await readRawBody(req);
  const signature = getStripeSignature(req);
  const event = verifyStripeEvent(rawBody, signature);

  if (!event) {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    await dispatchStripeEvent(event);
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_ERROR]", error);
    // Stripe considera 2xx como sucesso
  }

  return new Response(null, { status: 200 });
}

/* --------------------------------
 * Helpers
 * -------------------------------- */
async function readRawBody(req: NextRequest): Promise<Buffer> {
  // @ts-expect-error stream mismatch
  return buffer(req.body);
}

function getStripeSignature(req: NextRequest): string {
  const signature = req.headers.get("Stripe-Signature");
  if (!signature) {
    throw new Error("Missing Stripe-Signature header");
  }
  return signature;
}

function verifyStripeEvent(
  body: Buffer,
  signature: string
): Stripe.Event | null {
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[STRIPE_SIGNATURE_ERROR]", err);
    return null;
  }
}

/* --------------------------------
 * Dispatcher
 * -------------------------------- */
async function dispatchStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session
      );
      break;

    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(
        event.data.object as Stripe.Invoice
      );
      break;

    case "customer.subscription.created":
      await handleSubscriptionCreated(
        event.data.object as Stripe.Subscription
      );
      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(
        event.data.object as Stripe.Subscription
      );
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription
      );
      break;

    default:
      // Ignorado propositalmente
      break;
  }
}

/* --------------------------------
 * Handlers (iguais ao código antigo)
 * -------------------------------- */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
) {
  if (!session.subscription || !session.metadata?.userId) return;

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  await prisma.user.update({
    where: { id: session.metadata.userId },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(
        subscription.items.data[0].current_period_end * 1000
      ),
    },
  });
}

async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice
) {
  const subscriptionId =
    invoice.parent?.subscription_details?.subscription;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(
    subscriptionId as string
  );

  await prisma.user.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(
        subscription.items.data[0].current_period_end * 1000
      ),
    },
  });
}

/* --------------------------------
 * Subscription Lifecycle Handlers (FASE 2)
 * -------------------------------- */
async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
) {
  await prisma.user.updateMany({
    where: {
      stripeCustomerId: subscription.customer as string,
    },
    data: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(
        // @ts-expect-error - current_period_end exists but TypeScript type may be outdated
        subscription.current_period_end * 1000
      ),
    },
  });
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  await prisma.user.update({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(
        // @ts-expect-error - current_period_end exists but TypeScript type may be outdated
        subscription.current_period_end * 1000
      ),
    },
  });
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  await prisma.user.update({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
    },
  });
}

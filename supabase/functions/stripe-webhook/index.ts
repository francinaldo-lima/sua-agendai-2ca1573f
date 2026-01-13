import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // For development without signature verification
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err);
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  console.log(`Processing event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id;
        const subscriptionId = session.subscription as string;

        if (userId && planId && subscriptionId) {
          // Update profile with subscription ID
          await supabaseAdmin
            .from("profiles")
            .update({ 
              stripe_subscription_id: subscriptionId,
              subscription_status: "active"
            })
            .eq("user_id", userId);

          // Get the plan details
          const { data: plan } = await supabaseAdmin
            .from("plans")
            .select("name")
            .eq("id", planId)
            .single();

          // Update existing subscription or create new
          const { data: existingSub } = await supabaseAdmin
            .from("subscriptions")
            .select("id")
            .eq("user_id", userId)
            .eq("status", "active")
            .single();

          if (existingSub) {
            await supabaseAdmin
              .from("subscriptions")
              .update({
                plan_id: planId,
                status: "active",
                appointments_used: 0,
                start_date: new Date().toISOString(),
              })
              .eq("id", existingSub.id);
          } else {
            await supabaseAdmin
              .from("subscriptions")
              .insert({
                user_id: userId,
                plan_id: planId,
                status: "active",
                appointments_used: 0,
                start_date: new Date().toISOString(),
              });
          }

          // Update profile subscription plan
          if (plan) {
            await supabaseAdmin
              .from("profiles")
              .update({ subscription_plan: plan.name.toLowerCase() })
              .eq("user_id", userId);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          const status = subscription.status === "active" ? "active" : 
                        subscription.status === "canceled" ? "canceled" : 
                        subscription.status === "past_due" ? "past_due" : "inactive";

          await supabaseAdmin
            .from("profiles")
            .update({ subscription_status: status })
            .eq("user_id", userId);

          await supabaseAdmin
            .from("subscriptions")
            .update({ status })
            .eq("user_id", userId)
            .eq("status", "active");
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          // Downgrade to free plan
          const { data: freePlan } = await supabaseAdmin
            .from("plans")
            .select("id")
            .eq("name", "Gratuito")
            .single();

          await supabaseAdmin
            .from("profiles")
            .update({ 
              subscription_status: "canceled",
              subscription_plan: "gratuito",
              stripe_subscription_id: null
            })
            .eq("user_id", userId);

          await supabaseAdmin
            .from("subscriptions")
            .update({ 
              status: "canceled",
              end_date: new Date().toISOString()
            })
            .eq("user_id", userId)
            .eq("status", "active");

          // Create new free subscription
          if (freePlan) {
            await supabaseAdmin
              .from("subscriptions")
              .insert({
                user_id: userId,
                plan_id: freePlan.id,
                status: "active",
                appointments_used: 0,
                start_date: new Date().toISOString(),
              });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Get user by stripe customer id
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await supabaseAdmin
            .from("profiles")
            .update({ subscription_status: "past_due" })
            .eq("user_id", profile.user_id);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500 }
    );
  }
});

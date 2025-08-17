// utils/payments.js
// To'lov provayderlari uchun soddalashtirilgan adapter.
// Real integratsiya uchun Stripe/YooKassa SDK larini qo'shing.

const Stripe = require("stripe");

function getStripe() {
  if (!process.env.STRIPE_SECRET) {
    throw new Error("STRIPE_SECRET is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET, { apiVersion: "2024-04-10" });
}

module.exports = {
  // provider account (connect) yaratish yoki biriktirish
  async ensureProviderAccount({ provider, userId }) {
    if (provider !== "stripe") return { provider, accountId: null };
    const stripe = getStripe();
    const account = await stripe.accounts.create({ type: "express", metadata: { userId } });
    return { provider, accountId: account.id };
  },

  // to'lovni boshlash (payment intent)
  async createPaymentIntent({ provider, amount, currency, project }) {
    if (provider === "stripe") {
      const stripe = getStripe();
      const intent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata: { projectId: String(project._id) },
        transfer_group: `project_${project._id}`,
        application_fee_amount: process.env.STRIPE_APP_FEE ? Number(process.env.STRIPE_APP_FEE) : 0,
        on_behalf_of: project.providerAccountId || undefined,
      });
      return { id: intent.id, clientSecret: intent.client_secret };
    }
    // internal/yookassa uchun shu yerda kengaytiring
    return { id: `internal_${Date.now()}`, clientSecret: null };
  },
};
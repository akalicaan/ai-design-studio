import { getDb } from "../api/queries/connection";
import { pricingPlans } from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  await db.insert(pricingPlans).values([
    {
      slug: "mini",
      name: "Mini",
      credits: 2,
      priceUsd: "1.99",
      priceTry: "65",
      description: "For a small file or a fast production check.",
      features: JSON.stringify(["2 standard traces", "1 precision trace"]),
      sortOrder: 1,
    },
    {
      slug: "basic",
      name: "Basic",
      credits: 5,
      priceUsd: "3.99",
      priceTry: "130",
      description: "A practical pack for one-off client jobs.",
      features: JSON.stringify(["Up to 5 standard traces", "Up to 2 precision traces", "Secure checkout"]),
      sortOrder: 2,
    },
    {
      slug: "starter",
      name: "Starter",
      credits: 10,
      priceUsd: "6.99",
      priceTry: "230",
      description: "Built for a steady flow of artwork each week.",
      features: JSON.stringify(["Up to 10 standard traces", "Up to 5 precision traces", "Secure checkout"]),
      sortOrder: 3,
    },
    {
      slug: "professional",
      name: "Professional",
      credits: 35,
      priceUsd: "19.99",
      priceTry: "650",
      description: "The lowest cost per credit for active production teams.",
      features: JSON.stringify(["Up to 35 standard traces", "Up to 17 precision traces", "Secure checkout", "Priority processing"]),
      isPopular: 1,
      sortOrder: 4,
    },
  ]);

  console.log("Pricing plans seeded.");
  process.exit(0); // close MySQL connection pool
}

seed();

import { sql } from "drizzle-orm";
import { getDb } from "./queries/connection";
import { pricingPlans } from "../db/schema";

/**
 * Seed default pricing plans if table is empty.
 * Called at server startup.
 */
export async function seedPricingPlans() {
  const db = getDb();

  try {
    // Check if any plans exist
    const existing = await db.select().from(pricingPlans).limit(1);
    if (existing.length > 0) {
      console.log("[seed] Pricing plans already exist, skipping.");
      return;
    }

    await db.insert(pricingPlans).values([
      {
        slug: "mini",
        name: "Mini",
        credits: 10,
        priceUsd: "4.99",
        priceTry: "149",
        description: "Tasarımlarınızı denemek için ideal başlangıç paketi.",
        features: JSON.stringify([
          "10 kredi",
          "Tüm AI araçlarına erişim",
          "Standart işlem hızı",
          "7 gün proje saklama",
        ]),
        isPopular: 0,
        sortOrder: 1,
        isActive: 1,
      },
      {
        slug: "basic",
        name: "Basic",
        credits: 30,
        priceUsd: "9.99",
        priceTry: "299",
        description: "Düzenli tasarım ihtiyacı olanlar için ekonomik paket.",
        features: JSON.stringify([
          "30 kredi",
          "Tüm AI araçlarına erişim",
          "Standart işlem hızı",
          "30 gün proje saklama",
          "E-posta desteği",
        ]),
        isPopular: 0,
        sortOrder: 2,
        isActive: 1,
      },
      {
        slug: "starter",
        name: "Starter",
        credits: 75,
        priceUsd: "19.99",
        priceTry: "599",
        description: "Profesyonel tasarımcılar için en çok tercih edilen paket.",
        features: JSON.stringify([
          "75 kredi",
          "Tüm AI araçlarına erişim",
          "Öncelikli işlem hızı",
          "90 gün proje saklama",
          "7/24 e-posta desteği",
          "Seamless desen çıktısı",
        ]),
        isPopular: 1,
        sortOrder: 3,
        isActive: 1,
      },
      {
        slug: "professional",
        name: "Professional",
        credits: 200,
        priceUsd: "49.99",
        priceTry: "1499",
        description: "Yüksek hacimli üretim ve ekipler için kapsamlı paket.",
        features: JSON.stringify([
          "200 kredi",
          "Tüm AI araçlarına erişim",
          "En yüksek işlem önceliği",
          "Sınırsız proje saklama",
          "Öncelikli destek",
          "SVG vektör çıktısı",
          "Shutterstock entegrasyonu",
        ]),
        isPopular: 0,
        sortOrder: 4,
        isActive: 1,
      },
    ]);

    console.log("[seed] Default pricing plans inserted successfully.");
  } catch (err: any) {
    console.error("[seed] Failed to seed pricing plans:", err.message);
  }
}

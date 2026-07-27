import "dotenv/config";
import { db } from "./index";
import { templates } from "./schema";

const templateData = [
  {
    name: "ModernMinimal",
    duration_seconds: 15,
    config_json: JSON.stringify({
      description: "Dark theme minimalis dengan fokus pada produk. Cocok untuk brand modern dan produk premium.",
      scenes: [
        { name: "Hook", duration_percent: 0.3 },
        { name: "Product Showcase", duration_percent: 0.4 },
        { name: "CTA", duration_percent: 0.3 },
      ],
      colors: { primary: "#1a1a2e", secondary: "#e94560" },
    }),
    preview_url: "/templates/thumb-modern.png",
  },
  {
    name: "VibrantBold",
    duration_seconds: 15,
    config_json: JSON.stringify({
      description: "Warna cerah dan energik. Cocok untuk produk fashion, F&B, dan promosi flash sale.",
      scenes: [
        { name: "Hook", duration_percent: 0.25 },
        { name: "Product Showcase", duration_percent: 0.4 },
        { name: "CTA", duration_percent: 0.35 },
      ],
      colors: { primary: "#ff6b35", secondary: "#f7c59f" },
    }),
    preview_url: "/templates/thumb-vibrant.png",
  },
  {
    name: "ElegantWhite",
    duration_seconds: 15,
    config_json: JSON.stringify({
      description: "Background putih bersih dengan aksen emas. Cocok untuk produk kecantikan, premium, dan formal.",
      scenes: [
        { name: "Hook", duration_percent: 0.3 },
        { name: "Product Details", duration_percent: 0.35 },
        { name: "CTA", duration_percent: 0.35 },
      ],
      colors: { primary: "#1a1a2e", secondary: "#c9a96e" },
    }),
    preview_url: "/templates/thumb-elegant.png",
  },
];

async function seed() {
  console.log("🌱 Seeding templates...");

  for (const tpl of templateData) {
    await db.insert(templates).values(tpl);
    console.log(`  ✓ ${tpl.name}`);
  }

  console.log("✅ Seed selesai!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed gagal:", err);
  process.exit(1);
});
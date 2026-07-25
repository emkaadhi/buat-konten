import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { generatedCopy } from "@/db/schema";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface GenerateCopyRequest {
  productId: string;
  productName: string;
  price: string;
  description: string;
  ctaText: string;
}

interface ScriptScene {
  scene: number;
  text: string;
}

interface AiCopyResponse {
  hook: string;
  caption: string;
  cta_text: string;
  script: ScriptScene[];
}

const SYSTEM_PROMPT = `Kamu adalah copywriter profesional spesialis konten video promosi untuk platform TikTok, Instagram Reels, dan YouTube Shorts (durasi 15-20 detik).

Tugasmu adalah membuat materi konten video promosi produk berdasarkan data produk yang diberikan.

Output harus berupa JSON valid dengan format:
{
  "hook": "Kalimat pembuka yang menarik perhatian dalam 2-5 detik pertama (maks 1 kalimat, langsung striking)",
  "caption": "Caption untuk posting di sosial media, panjang 100-200 karakter, include emoji dan call-to-action",
  "cta_text": "Call-to-action text, contoh: 'Order Now', 'DM to Order', 'Cek Link di Bio'",
  "script": [
    { "scene": 1, "text": "Teks overlay untuk scene 1 (durasi ~3-4 detik)" },
    { "scene": 2, "text": "Teks overlay untuk scene 2 (durasi ~3-4 detik)" },
    { "scene": 3, "text": "Teks overlay untuk scene 3 (durasi ~3-4 detik)" },
    { "scene": 4, "text": "Teks overlay untuk scene 4 (durasi ~3-4 detik)" },
    { "scene": 5, "text": "Teks overlay untuk scene 5 (durasi ~3-4 detik, akhiri dengan CTA)" }
  ]
}

Aturan:
- Hook harus langsung memicu rasa penasaran atau menyebut masalah target audiens
- Script per scene harus singkat, padat, dan enak dibaca cepat (max 7-8 kata per scene)
- Scene 1-4: menjelaskan manfaat/keunggulan produk
- Scene 5: call-to-action mengajak order
- Caption: gaya bahasa Indonesia yang santai namun meyakinkan, target audience UMKM & reseller
- Gunakan Bahasa Indonesia untuk semua teks
- Jangan gunakan markdown atau teks lain di luar JSON`;

const USER_PROMPT_TEMPLATE = `Buatkan konten video promosi untuk produk berikut:

Nama Produk: {productName}
Harga: {price}
Deskripsi: {description}
CTA: {ctaText}

Output JSON:`;

export async function POST(request: NextRequest) {
  try {
    const body: GenerateCopyRequest = await request.json();

    // Validasi input
    if (!body.productName || !body.price || !body.description || !body.ctaText || !body.productId) {
      return NextResponse.json(
        { error: "Semua field wajib diisi: productName, price, description, ctaText, productId" },
        { status: 400 }
      );
    }

    // Panggil Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const userPrompt = USER_PROMPT_TEMPLATE
      .replace("{productName}", body.productName)
      .replace("{price}", body.price)
      .replace("{description}", body.description)
      .replace("{ctaText}", body.ctaText);

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Siap. Berikan data produknya." }] },
        { role: "user", parts: [{ text: userPrompt }] },
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024,
      },
    });

    const responseText = result.response.text();

    // Parse JSON dari response
    let aiResponse: AiCopyResponse;
    try {
      // Cari JSON dalam response (mungkin ada teks di luar JSON)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      aiResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      return NextResponse.json(
        { 
          error: "Gagal memproses response AI. Silakan coba lagi.",
          rawResponse: responseText 
        },
        { status: 500 }
      );
    }

    // Validasi struktur response AI
    if (!aiResponse.hook || !aiResponse.caption || !aiResponse.script || !Array.isArray(aiResponse.script)) {
      return NextResponse.json(
        { 
          error: "Response AI tidak valid. Silakan coba lagi.",
          rawResponse: responseText 
        },
        { status: 500 }
      );
    }

    // Simpan ke database
    const [savedCopy] = await db
      .insert(generatedCopy)
      .values({
        product_id: body.productId,
        hook: aiResponse.hook,
        caption: aiResponse.caption,
        script_json: JSON.stringify(aiResponse.script),
        cta_text: aiResponse.cta_text || body.ctaText,
      })
      .returning();

    return NextResponse.json(
      {
        id: savedCopy.id,
        hook: aiResponse.hook,
        caption: aiResponse.caption,
        cta_text: aiResponse.cta_text || body.ctaText,
        script: aiResponse.script,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Generate copy error:", error);

    const message = error?.message || String(error);

    // Handle common Gemini API errors
    if (message.includes("API_KEY") || message.includes("not found")) {
      return NextResponse.json(
        { error: "Konfigurasi API AI tidak valid. Pastikan GEMINI_API_KEY sudah diset di Vercel." },
        { status: 500 }
      );
    }
    if (message.includes("SAFETY")) {
      return NextResponse.json(
        { error: "Response AI diblokir oleh filter keamanan. Coba lagi dengan input berbeda." },
        { status: 500 }
      );
    }
    if (message.includes("quota") || message.includes("rate")) {
      return NextResponse.json(
        { error: "API AI sedang kelebihan permintaan. Coba lagi beberapa saat." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `Error AI: ${message}` },
      { status: 500 }
    );
  }
}
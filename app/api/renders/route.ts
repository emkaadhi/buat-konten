import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { renders } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, templateId } = body;

    if (!productId || !templateId) {
      return NextResponse.json(
        { error: "productId dan templateId wajib diisi." },
        { status: 400 }
      );
    }

    // Insert render job with status 'queued'
    const [newRender] = await db
      .insert(renders)
      .values({
        product_id: productId,
        template_id: templateId,
        status: "queued",
      })
      .returning();

    return NextResponse.json({
      render: newRender,
      message: "Render job telah diantrikan.",
    });
  } catch (error) {
    console.error("Error creating render:", error);
    return NextResponse.json(
      { error: "Gagal membuat render job." },
      { status: 500 }
    );
  }
}
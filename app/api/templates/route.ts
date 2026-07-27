import { NextResponse } from "next/server";
import { db } from "@/db";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allTemplates = await db.select().from(templates);
    return NextResponse.json({ templates: allTemplates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data template." },
      { status: 500 }
    );
  }
}
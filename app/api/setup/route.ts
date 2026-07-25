import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Create tables if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        plan TEXT NOT NULL DEFAULT 'free',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        price NUMERIC NOT NULL,
        description TEXT NOT NULL,
        image_urls TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS generated_copy (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id),
        hook TEXT NOT NULL,
        caption TEXT NOT NULL,
        script_json TEXT NOT NULL,
        cta_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        duration_seconds INTEGER NOT NULL,
        config_json TEXT NOT NULL,
        preview_url TEXT NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS renders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id),
        template_id UUID NOT NULL REFERENCES templates(id),
        status TEXT NOT NULL DEFAULT 'queued',
        video_url TEXT,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        completed_at TIMESTAMP
      );
    `;

    // Create guest user for development (before auth is ready)
    const guestId = "00000000-0000-0000-0000-000000000000";
    await sql`
      INSERT INTO users (id, email, name, plan)
      VALUES (${guestId}, 'guest@temp.com', 'Guest User', 'free')
      ON CONFLICT (id) DO NOTHING;
    `;

    return NextResponse.json({
      success: true,
      message: "Database tables created and guest user seeded.",
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      {
        error: "Setup failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
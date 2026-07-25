import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { uploadFromFile } from "@/src/lib/storage";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 3;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi").max(200),
  price: z.coerce.number().positive("Harga harus lebih dari 0"),
  description: z.string().min(1, "Deskripsi wajib diisi").max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Parse text fields
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;

    // Validate text fields
    const parsed = productSchema.safeParse({ name, price, description });
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Validasi gagal", details: errors },
        { status: 400 }
      );
    }

    // Validate images
    const images: File[] = [];
    for (let i = 0; i < MAX_FILES; i++) {
      const file = formData.get(`image_${i}`) as File | null;
      if (file && file.size > 0) {
        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
          return NextResponse.json(
            {
              error: `File ${file.name} tidak didukung. Gunakan JPEG, PNG, WebP, atau AVIF.`,
            },
            { status: 400 }
          );
        }
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            {
              error: `File ${file.name} terlalu besar. Maksimal 5MB per file.`,
            },
            { status: 400 }
          );
        }
        images.push(file);
      }
    }

    if (images.length === 0) {
      return NextResponse.json(
        { error: "Minimal 1 gambar produk wajib diupload." },
        { status: 400 }
      );
    }

    // Upload images to storage
    const imageUrls: string[] = [];
    for (const image of images) {
      const uniqueName = `products/${crypto.randomUUID()}-${image.name}`;
      const { url } = await uploadFromFile(uniqueName, image, {
        addRandomSuffix: false,
      });
      imageUrls.push(url);
    }

    // Simpan ke database
    // TODO: ganti user_id dengan user yang sedang login setelah auth terpasang
    const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";

    const [product] = await db
      .insert(products)
      .values({
        user_id: GUEST_USER_ID,
        name: parsed.data.name,
        price: parsed.data.price.toString(),
        description: parsed.data.description,
        image_urls: JSON.stringify(imageUrls),
      })
      .returning();

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan produk. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // TODO: filter by user_id after auth is implemented
    const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";

    const allProducts = await db
      .select()
      .from(products)
      .where(eq(products.user_id, GUEST_USER_ID))
      .orderBy(desc(products.created_at));

    return NextResponse.json({ products: allProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar produk." },
      { status: 500 }
    );
  }
}
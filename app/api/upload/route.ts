import { NextRequest, NextResponse } from "next/server";
import { uploadFromFile } from "@/src/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan. Kirim file dengan field name 'file'." },
        { status: 400 }
      );
    }

    // Validasi ukuran file (max 50MB)
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 50MB." },
        { status: 400 }
      );
    }

    // Validasi tipe file (gambar & video umum)
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Tipe file '${file.type}' tidak didukung. Gunakan: ${allowedTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Optional: folder prefix dari form-data
    const folder = (formData.get("folder") as string) || "uploads";

    // Buat pathname unik: folder/timestamp-random.ext
    const ext = file.name.split(".").pop() || "bin";
    const pathname = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const result = await uploadFromFile(pathname, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json(
      {
        url: result.url,
        downloadUrl: result.downloadUrl,
        pathname: result.pathname,
        contentType: result.contentType,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Upload error:", error);

    // Handle Vercel Blob specific errors
    if (error.name?.includes("Blob") || error.code?.includes("BLOB")) {
      return NextResponse.json(
        { error: `Storage error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan saat upload. Silakan coba lagi." },
      { status: 500 }
    );
  }
}


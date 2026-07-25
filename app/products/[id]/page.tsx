"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  image_urls: string;
  created_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Produk tidak ditemukan.");
          }
          throw new Error("Gagal mengambil data produk.");
        }
        const data = await res.json();
        setProduct(data.product);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Terjadi kesalahan."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  function formatPrice(price: string) {
    const num = parseFloat(price);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  }

  function parseImageUrls(imageUrls: string): string[] {
    try {
      return JSON.parse(imageUrls);
    } catch {
      return [];
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded-xl" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error || "Produk tidak ditemukan."}
        </div>
        <Link
          href="/products"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Kembali ke daftar produk
        </Link>
      </main>
    );
  }

  const imageUrls = parseImageUrls(product.image_urls);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/products" className="hover:text-blue-600">
          Produk
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image gallery */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3">
            {imageUrls.length > 0 ? (
              <img
                src={imageUrls[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Thumbnail selector */}
          {imageUrls.length > 1 && (
            <div className="flex gap-2">
              {imageUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedImage
                      ? "border-blue-500"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={url}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>

          <p className="text-3xl font-bold text-blue-600 mb-4">
            {formatPrice(product.price)}
          </p>

          <div className="prose prose-sm max-w-none text-gray-600 mb-6">
            <p className="whitespace-pre-wrap">{product.description}</p>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2 text-sm text-gray-500">
            <p>
              <span className="font-medium text-gray-700">
                Dibuat pada:
              </span>{" "}
              {formatDate(product.created_at)}
            </p>
            <p>
              <span className="font-medium text-gray-700">
                Jumlah gambar:
              </span>{" "}
              {imageUrls.length}
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-8 space-y-3">
            <Link
              href={`/products/${product.id}/generate`}
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Buat Video Promosi
            </Link>
            <Link
              href="/products"
              className="block w-full text-gray-600 text-center py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              ← Kembali ke Daftar
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
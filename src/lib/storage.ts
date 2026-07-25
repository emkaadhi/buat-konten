import { put, del, PutBlobResult } from "@vercel/blob";

export interface UploadResult {
  url: string;
  downloadUrl: string;
  pathname: string;
  contentType: string;
}

export interface UploadOptions {
  /**
   * Access level untuk blob. Default: 'public'
   */
  access?: "public" | "private";
  /**
   * Tambahkan random suffix untuk menghindari konflik nama file. Default: true
   */
  addRandomSuffix?: boolean;
  /**
   * Allow overwrite file yang sudah ada. Default: false
   */
  allowOverwrite?: boolean;
  /**
   * Media type file (e.g. 'image/jpeg', 'video/mp4').
   * Jika tidak diisi, akan diekstrak dari ekstensi pathname.
   */
  contentType?: string;
}

/**
 * Upload file (Buffer, Blob, string, atau ReadableStream) ke Vercel Blob storage.
 * Return URL publik dari file yang sudah di-upload.
 *
 * @example
 * ```ts
 * const { url } = await uploadFile(
 *   `products/${productId}/${crypto.randomUUID()}.jpg`,
 *   buffer,
 *   { access: 'public', addRandomSuffix: false }
 * );
 * ```
 */
export async function uploadFile(
  pathname: string,
  body: string | Blob | ArrayBuffer | ReadableStream,
  options: UploadOptions = {}
): Promise<UploadResult> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not configured. Set it in .env.local"
    );
  }

  const { access = "public", addRandomSuffix = true, allowOverwrite = false, contentType } = options;

  const result: PutBlobResult = await put(pathname, body, {
    access,
    addRandomSuffix,
    allowOverwrite,
    ...(contentType ? { contentType } : {}),
  });

  return {
    url: result.url,
    downloadUrl: result.downloadUrl,
    pathname: result.pathname,
    contentType: result.contentType,
  };
}

/**
 * Upload file dari File object (biasanya dari form-data).
 *
 * @example
 * ```ts
 * const { url } = await uploadFromFile(
 *   `products/${productId}/${file.name}`,
 *   file,
 * );
 * ```
 */
export async function uploadFromFile(
  pathname: string,
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  return uploadFile(pathname, file, {
    ...options,
    contentType: options.contentType ?? file.type,
  });
}

/**
 * Hapus satu atau beberapa blob dari storage berdasarkan URL atau pathname.
 */
export async function deleteFile(urlOrPathname: string | string[]): Promise<void> {
  await del(urlOrPathname);
}

export type { PutBlobResult };

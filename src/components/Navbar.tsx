import Link from "next/link";
import { auth, signOut } from "@/src/auth";

export default async function Navbar() {
  let session: {
    user?: { id?: string; name?: string | null; email?: string | null; image?: string | null };
  } | null = null;
  try {
    session = await auth();
  } catch {
    // auth tidak tersedia
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          BuatKonten
        </Link>

        <nav className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Link
                href="/products"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <span className="hidden text-sm text-gray-400 sm:inline">
                {session.user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg border px-3 py-1 text-sm transition-colors hover:bg-gray-50"
                >
                  Keluar
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Masuk
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
import { auth, signIn } from "@/src/auth";
import { redirect } from "next/navigation";
import { GoogleLogo } from "@/src/components/Icons";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/products");
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-xl border p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-bold">Masuk</h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          Masuk untuk mulai membuat konten video produk
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/products" });
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
          >
            <GoogleLogo />
            Lanjutkan dengan Google
          </button>
        </form>
      </div>
    </div>
  );
}
import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";
import { createAdminSession, loginAdmin } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

export const metadata = {
  title: "Admin Login",
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  async function login(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const nextPath = String(formData.get("next") ?? "/admin");
    const authenticated = await loginAdmin(email, password);

    if (!authenticated) {
      redirect("/admin/login?error=invalid");
    }

    await createAdminSession();
    redirect(nextPath.startsWith("/admin") ? nextPath : "/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#06110d] p-4 text-white">
      <section className="w-full max-w-md rounded-lg border border-emerald-300/16 bg-white/[0.055] p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-400 text-[#04120c]">
          <LogIn className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-3xl font-semibold">Admin login</h1>
        <p className="mt-2 text-sm leading-6 text-emerald-50/68">
          Sign in to manage churches and embed widgets.
        </p>
        {params.error ? (
          <p className="mt-4 rounded-md border border-red-300/24 bg-red-950/24 p-3 text-sm text-red-100">
            Invalid email or password.
          </p>
        ) : null}
        <form action={login} className="mt-6 grid gap-4">
          <input type="hidden" name="next" value={params.next ?? "/admin"} />
          <label className="grid gap-2 text-sm font-semibold text-emerald-100">
            Email
            <input
              name="email"
              type="email"
              defaultValue="admin@sermonbridge.local"
              className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-emerald-100">
            Password
            <input
              name="password"
              type="password"
              className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none focus-visible:focus-ring"
              required
            />
          </label>
          <button
            type="submit"
            className="min-h-12 rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] hover:bg-emerald-300"
          >
            Sign in
          </button>
        </form>
        <p className="mt-4 text-xs leading-5 text-emerald-50/55">
          Admin credentials are created by the Prisma seed script or your production environment variables.
        </p>
      </section>
    </main>
  );
}


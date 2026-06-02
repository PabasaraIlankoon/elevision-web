import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    redirect(user ? "/dashboard" : "/login");
  } catch {
    // Supabase not configured yet
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-semibold text-foreground">Elevision</h1>
          <p className="text-sm text-muted-foreground">
            Configure Supabase to enable authentication and live data.
          </p>
          <div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-500"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }
}

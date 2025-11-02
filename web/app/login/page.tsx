import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "./login-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
        <p className="text-sm text-neutral-400">
          Sign in with your Supabase account to manage your GitHub Pages sites.
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-xs text-neutral-500">
        Need access? Ask an existing site owner to invite you via the site members panel once onboarding is complete.
      </p>
      <p className="text-center text-xs text-neutral-500">
        <Link href="/" className="text-neutral-300 hover:text-white">
          Back to marketing site
        </Link>
      </p>
    </main>
  );
}

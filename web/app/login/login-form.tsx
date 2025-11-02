"use client";

import { useSupabaseClient } from "@supabase/auth-helpers-react";
import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { Database } from "@/types/database";
import { clientEnv } from "@/lib/env-client";

type AuthMode = "sign-in" | "sign-up";

export function LoginForm() {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const modeCopy = useMemo(
    () =>
      mode === "sign-in"
        ? { title: "Sign in", toggle: "Need an account?", cta: "Create one" }
        : { title: "Create account", toggle: "Already registered?", cta: "Sign in" },
    [mode],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);
      setMessage(null);

      try {
        if (mode === "sign-in") {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInError) {
            throw signInError;
          }
          router.replace("/dashboard");
          router.refresh();
        } else {
          const { error: signUpError, data } = await supabase.auth.signUp({
            email,
            password,
          });
          if (signUpError) {
            throw signUpError;
          }
          if (data.session) {
            router.replace("/dashboard");
            router.refresh();
          } else {
            setMessage("Check your inbox to confirm your email address.");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    },
    [email, password, mode, router, supabase],
  );

  const handleOAuth = useCallback(
    async () => {
      setLoading(true);
      setError(null);
      try {
        const basePath = clientEnv.NEXT_PUBLIC_BASE_PATH ?? "";
        const redirectTo = new URL(`${basePath}/dashboard`, window.location.origin);
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: "github",
          options: { redirectTo: redirectTo.toString() },
        });
        if (oauthError) {
          throw oauthError;
        }
      } catch (err) {
        setLoading(false);
        setError(err instanceof Error ? err.message : "Unexpected error");
      }
    },
    [supabase],
  );

  return (
    <div className="space-y-7 rounded-[24px] border border-white/10 bg-white/5 p-8 shadow-[0_35px_100px_-60px_rgba(15,23,42,0.9)] backdrop-blur-xl">
      <header className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-white">{modeCopy.title}</h2>
        <p className="text-xs text-slate-300/80">Use your Supabase credentials or continue with GitHub OAuth.</p>
      </header>
      <button
        type="button"
        onClick={handleOAuth}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_20px_50px_-30px_rgba(99,102,241,0.8)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
        disabled={loading}
      >
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="h-4 w-4"
          fill="currentColor"
        >
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2 0-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8" />
        </svg>
        Continue with GitHub
      </button>
      <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-slate-400/70">
        <span aria-hidden className="h-px flex-1 bg-white/15" />
        or
        <span aria-hidden className="h-px flex-1 bg-white/15" />
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2 text-left">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400/80">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm text-white outline-none transition focus:border-white/30 focus:ring-2 focus:ring-indigo-500/40"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-2 text-left">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400/80">
            <label htmlFor="password" className="uppercase tracking-[0.2em]">
              Password
            </label>
            <button
              type="button"
              className="text-slate-200/80 underline-offset-2 hover:text-white"
              onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
            >
              {modeCopy.toggle} <span className="underline">{modeCopy.cta}</span>
            </button>
          </div>
          <input
            id="password"
            type="password"
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            required
            className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm text-white outline-none transition focus:border-white/30 focus:ring-2 focus:ring-indigo-500/40"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {error ? <p className="text-xs text-rose-300">{error}</p> : null}
        {message ? <p className="text-xs text-emerald-300">{message}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-indigo-500/90 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Processing..." : modeCopy.title}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      username: username.trim(),
      password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      toast.error("Invalid username or password.");
      return;
    }

    // check session to see if customer is approved
    const session = await getSession();
    const isCustomer = session?.user?.role === "CUSTOMER";
    const isApproved = Boolean(session?.user?.isApproved);

    if (isCustomer && !isApproved) {
      const ok = window.confirm(
        "Your account is pending approval by the distributor. You will not be able to access the catalog until approved. Go to the pending status page?",
      );
      toast.success("Signed in");
      if (ok) {
        router.push("/customer/pending");
        router.refresh();
        return;
      }
      // If they dismiss, still send them back to home (which will redirect appropriately)
    }

    toast.success("Signed in");
    if (callbackUrl && callbackUrl.startsWith("/")) {
      router.push(callbackUrl);
      router.refresh();
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="wholesale-login flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-emerald-950/15 bg-white shadow-xl md:grid-cols-2">
        <section className="bg-emerald-950 p-7 text-emerald-50 sm:p-10 md:flex md:flex-col md:justify-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Wholesale portal</h1>
          <p className="mt-4 max-w-sm leading-relaxed text-emerald-100">Browse your distributor’s catalog, place orders, and track their status in one place.</p>
        </section>
        <div className="p-7 sm:p-10">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h2>
        <p className="mt-1 text-sm text-slate-600">Sign in with the credentials provided by your distributor.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-900 px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-slate-600">Loading…</div>}>
      {children}
    </Suspense>
  );
}

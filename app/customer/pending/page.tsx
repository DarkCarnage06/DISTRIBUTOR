import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";

export default async function CustomerPendingPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CUSTOMER") {
    redirect("/login");
  }

  const row = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isApproved: true },
  });
  if (row?.isApproved) {
    redirect("/customer/catalog");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-amber-950">Account pending approval</h1>
        <p className="mt-3 text-sm text-amber-900">
          Your account is pending admin approval. You will be able to browse the catalog and place orders once your
          distributor activates your store.
        </p>
        <p className="mt-4 text-xs text-amber-800/90">
          Signed in as <span className="font-mono font-semibold">{session.user.username}</span>
        </p>
        <div className="mt-8">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

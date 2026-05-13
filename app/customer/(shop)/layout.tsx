import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CustomerSidebar } from "@/components/customer-sidebar";
import { CartProvider } from "@/components/cart-provider";
import { redirect } from "next/navigation";

export default async function CustomerShopLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CUSTOMER") {
    redirect("/login");
  }

  const row = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isApproved: true, isActive: true },
  });
  if (!row?.isActive) redirect("/login");
  if (!row.isApproved) {
    redirect("/customer/pending");
  }

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-white md:flex-row">
        <CustomerSidebar />
        <div className="flex min-h-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:hidden">
            <span className="text-sm font-semibold text-slate-900">Store</span>
          </header>
          <main className="flex-1 bg-slate-50 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </CartProvider>
  );
}

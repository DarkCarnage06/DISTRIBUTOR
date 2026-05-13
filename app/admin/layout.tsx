import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin-sidebar";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-white md:flex-row">
      <AdminSidebar />
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:hidden">
          <span className="text-sm font-semibold text-slate-900">Admin</span>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-slate-50 md:h-screen md:w-56 md:border-b-0 md:border-r">
      <div className="border-b border-slate-200 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Wholesale</p>
        <p className="text-sm font-semibold text-slate-900">Admin</p>
      </div>
      <nav className="flex flex-row gap-1 overflow-x-auto px-2 py-2 md:flex-col md:px-2 md:py-4">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
                active ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:bg-white/80"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden border-t border-slate-200 p-3 md:block">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

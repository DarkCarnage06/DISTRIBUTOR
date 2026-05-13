import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/format";
import { AddToCartButton } from "@/components/add-to-cart-button";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; category?: string }>;
}) {
  await auth();
  const sp = await searchParams;
  const brand = sp.brand?.trim();
  const category = sp.category?.trim();

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(brand ? { brand } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: [{ brand: "asc" }, { name: "asc" }],
  });

  const brands = await prisma.product.findMany({
    where: { isActive: true },
    distinct: ["brand"],
    select: { brand: true },
    orderBy: { brand: "asc" },
  });

  const categories = await prisma.product.findMany({
    where: { isActive: true },
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });

  const buildBrandHref = (nextBrand: string | null) => {
    const p = new URLSearchParams();
    if (nextBrand) p.set("brand", nextBrand);
    if (category) p.set("category", category);
    const s = p.toString();
    return s ? `/customer/catalog?${s}` : "/customer/catalog";
  };

  const buildCategoryHref = (nextCategory: string | null) => {
    const p = new URLSearchParams();
    if (brand) p.set("brand", brand);
    if (nextCategory) p.set("category", nextCategory);
    const s = p.toString();
    return s ? `/customer/catalog?${s}` : "/customer/catalog";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Catalog</h1>
        <p className="mt-1 text-sm text-slate-600">Browse FMCG lines by brand or category. Prices are per unit shown.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip href={buildBrandHref(null)} active={!brand} label="All brands" />
          {brands.map((b) => (
            <FilterChip key={b.brand} href={buildBrandHref(b.brand)} active={brand === b.brand} label={b.brand} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip href={buildCategoryHref(null)} active={!category} label="All categories" />
          {categories.map((c) => (
            <FilterChip
              key={c.category}
              href={buildCategoryHref(c.category)}
              active={category === c.category}
              label={c.category}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <article key={p.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{p.brand}</p>
                <h2 className="mt-1 text-base font-semibold text-slate-900">{p.name}</h2>
                <p className="text-xs text-slate-500">{p.category}</p>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-2">
              <p className="text-lg font-semibold text-slate-900">{formatInr(p.pricePerUnit)}</p>
              <p className="text-xs text-slate-600">per {p.unit}</p>
            </div>
            <p className="mt-2 text-xs text-slate-600">In stock: {p.stockAvailable}</p>
            <div className="mt-4">
              <AddToCartButton
                product={{
                  productId: p.id,
                  name: p.name,
                  brand: p.brand,
                  unit: p.unit,
                  pricePerUnit: Number(p.pricePerUnit),
                  stockAvailable: p.stockAvailable,
                }}
              />
            </div>
          </article>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">No products match your filters.</p>
      ) : null}
    </div>
  );
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
        active ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {label}
    </Link>
  );
}

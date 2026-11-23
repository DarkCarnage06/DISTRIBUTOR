"use client";

import { useState } from "react";
import { formatInr } from "@/lib/format";

const products = [
  { id: "rice", name: "Basmati Rice", category: "Pantry", unit: "5 kg bag", price: 540 },
  { id: "dal", name: "Toor Dal", category: "Pantry", unit: "1 kg bag", price: 135 },
  { id: "tea", name: "Assam Black Tea", category: "Beverages", unit: "500 g pack", price: 225 },
  { id: "water", name: "Mineral Water", category: "Beverages", unit: "case of 24", price: 280 },
  { id: "dish", name: "Dishwashing Liquid", category: "Household", unit: "750 ml bottle", price: 96 },
  { id: "soap", name: "Hand Wash", category: "Household", unit: "500 ml bottle", price: 82 },
];

const categories = [...new Set(products.map((product) => product.category))];
const primaryButton = "rounded-md bg-emerald-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50";

export function GuestCatalog() {
  const [category, setCategory] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [orderTotal, setOrderTotal] = useState<number | null>(null);

  const visibleProducts = products.filter((product) => !category || product.category === category);
  const cart = products.filter(({ id }) => quantities[id] > 0);
  const total = cart.reduce((sum, product) => sum + product.price * quantities[product.id], 0);

  function changeQuantity(id: string, change: number) {
    setOrderTotal(null);
    setQuantities((current) => ({
      ...current,
      [id]: Math.max(0, (current[id] ?? 0) + change),
    }));
  }

  function placeOrder() {
    setOrderTotal(total);
    setQuantities({});
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <header className="rounded-2xl bg-emerald-950 p-6 text-white sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Wholesale portal demo</h1>
        <p className="mt-2 text-sm text-emerald-100">Browse sample products and try placing a simulated wholesale order.</p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-labelledby="catalog-title" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="catalog-title" className="text-xl font-semibold">Catalog</h2>
            <label className="flex items-center gap-2 text-sm font-medium">
              Category
              <select className="rounded-md border border-slate-300 bg-white p-2" value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">All categories</option>
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleProducts.map((product) => (
              <article key={product.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-medium text-slate-600">{product.category}</p>
                <h3 className="mt-1 font-semibold">{product.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{formatInr(product.price)} per {product.unit}</p>
                <button type="button" className={primaryButton + " mt-4"} aria-label={`Add ${product.name} to cart`} onClick={() => changeQuantity(product.id, 1)}>
                  Add to cart
                </button>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="cart-title" className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 id="cart-title" className="text-xl font-semibold">Cart</h2>
          <div role="status" className="mt-3 text-sm text-emerald-900">
            {orderTotal !== null && `Demo order placed for ${formatInr(orderTotal)}.`}
          </div>
          {cart.length === 0 ? (
            orderTotal === null && <p className="mt-2 text-sm text-slate-600">Your cart is empty.</p>
          ) : (
            <>
              <ul className="divide-y divide-slate-200">
                {cart.map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span>{product.name}</span>
                    <div className="flex items-center gap-2">
                      <button type="button" className="h-9 w-9 rounded-md border border-slate-300 hover:bg-slate-100" aria-label={`Remove one ${product.name}`} onClick={() => changeQuantity(product.id, -1)}>−</button>
                      <span aria-label="Quantity">{quantities[product.id]}</span>
                      <button type="button" className="h-9 w-9 rounded-md border border-slate-300 hover:bg-slate-100" aria-label={`Add one ${product.name}`} onClick={() => changeQuantity(product.id, 1)}>+</button>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-semibold" aria-live="polite">
                <span>Total</span><span>{formatInr(total)}</span>
              </p>
              <button type="button" className={primaryButton + " mt-4 w-full"} onClick={placeOrder}>Place demo order</button>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/cart-provider";
import { formatInr } from "@/lib/format";
import { placeOrderAction } from "@/lib/actions/customer-orders";

export default function CartPage() {
  const { lines, setQty, removeLine, clear } = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");

  function placeOrder() {
    startTransition(async () => {
      const res = await placeOrderAction({
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        notes: note || null,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Order placed");
      clear();
      setNote("");
      router.push("/customer/orders");
      router.refresh();
    });
  }

  const total = lines.reduce((s, l) => s + l.pricePerUnit * l.quantity, 0);

  if (!lines.length) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Cart</h1>
        <p className="text-sm text-slate-600">Your cart is empty.</p>
        <Link href="/customer/catalog" className="inline-block text-sm font-semibold text-slate-900 underline">
          Browse catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Cart</h1>
        <p className="mt-1 text-sm text-slate-600">Review quantities and place your wholesale order.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Product</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Price</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Qty</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Line</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lines.map((l) => (
              <tr key={l.productId}>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{l.name}</div>
                  <div className="text-xs text-slate-500">
                    {l.brand} · per {l.unit}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-slate-800">{formatInr(l.pricePerUnit)}</td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    min={1}
                    max={l.stockAvailable}
                    value={l.quantity}
                    onChange={(e) => setQty(l.productId, Number(e.target.value))}
                    className="w-20 rounded-md border border-slate-300 px-2 py-1 text-right"
                  />
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">{formatInr(l.pricePerUnit * l.quantity)}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => removeLine(l.productId)} className="text-xs font-semibold text-red-700 hover:underline">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50 p-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="note">
              Order note (optional)
            </label>
            <textarea
              id="note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full max-w-lg rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Delivery instructions, preferred slot…"
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Estimated total</p>
            <p className="text-2xl font-semibold text-slate-900">{formatInr(total)}</p>
            <button
              type="button"
              disabled={pending}
              onClick={placeOrder}
              className="mt-3 w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 md:w-auto"
            >
              {pending ? "Placing order…" : "Place order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

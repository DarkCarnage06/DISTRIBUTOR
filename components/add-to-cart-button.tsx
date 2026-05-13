"use client";

import { useCart } from "@/components/cart-provider";
import { toast } from "sonner";

export function AddToCartButton({
  product,
}: {
  product: {
    productId: string;
    name: string;
    brand: string;
    unit: string;
    pricePerUnit: number;
    stockAvailable: number;
  };
}) {
  const { addLine } = useCart();

  function add() {
    if (product.stockAvailable <= 0) {
      toast.error("Out of stock");
      return;
    }
    addLine({ ...product, quantity: 1 });
    toast.success("Added to cart");
  }

  return (
    <button
      type="button"
      onClick={add}
      disabled={product.stockAvailable <= 0}
      className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Add to cart
    </button>
  );
}

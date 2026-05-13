"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type PlaceOrderInput = {
  items: { productId: string; quantity: number }[];
  notes?: string | null;
};

export async function placeOrderAction(input: PlaceOrderInput) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CUSTOMER") {
    return { ok: false as const, error: "You must be signed in as a customer." };
  }

  const row = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isApproved: true, isActive: true },
  });
  if (!row?.isActive || !row.isApproved) {
    return { ok: false as const, error: "Your account is not approved yet." };
  }

  const items = input.items.filter((i) => i.quantity > 0);
  if (!items.length) {
    return { ok: false as const, error: "Your cart is empty." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: {
          id: { in: items.map((i) => i.productId) },
          isActive: true,
        },
      });

      if (products.length !== new Set(items.map((i) => i.productId)).size) {
        throw new Error("One or more products are unavailable.");
      }

      let total = 0;
      const lineData: {
        productId: string;
        quantity: number;
        priceAtTime: (typeof products)[0]["pricePerUnit"];
      }[] = [];

      for (const line of items) {
        const p = products.find((x) => x.id === line.productId);
        if (!p) throw new Error("Product not found");
        if (line.quantity > p.stockAvailable) {
          throw new Error(`Insufficient stock for ${p.name}`);
        }
        const priceNum = Number(p.pricePerUnit);
        total += priceNum * line.quantity;
        lineData.push({
          productId: p.id,
          quantity: line.quantity,
          priceAtTime: p.pricePerUnit,
        });
      }

      await tx.order.create({
        data: {
          customerId: session.user.id,
          totalAmount: total,
          notes: input.notes?.trim() || null,
          items: {
            create: lineData,
          },
        },
      });

      for (const line of items) {
        await tx.product.update({
          where: { id: line.productId },
          data: { stockAvailable: { decrement: line.quantity } },
        });
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not place order";
    return { ok: false as const, error: msg };
  }

  revalidatePath("/customer/orders");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
  revalidatePath("/customer/catalog");
  return { ok: true as const };
}

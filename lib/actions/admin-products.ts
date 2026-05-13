"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function createProductAction(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false as const, error: "Unauthorized" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const price = Number(String(formData.get("pricePerUnit") ?? "").replace(/,/g, ""));
  const stock = Number(String(formData.get("stockAvailable") ?? "0"));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;

  if (!name || !brand || !category || !unit || !Number.isFinite(price) || price < 0) {
    return { ok: false as const, error: "Please fill all required fields with valid values." };
  }

  await prisma.product.create({
    data: {
      name,
      brand,
      category,
      unit,
      pricePerUnit: price,
      stockAvailable: Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : 0,
      imageUrl,
      isActive: true,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/customer/catalog");
  return { ok: true as const };
}

export async function updateProductAction(productId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const price = Number(String(formData.get("pricePerUnit") ?? "").replace(/,/g, ""));
  const stock = Number(String(formData.get("stockAvailable") ?? "0"));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;

  if (!name || !brand || !category || !unit || !Number.isFinite(price) || price < 0) {
    throw new Error("Invalid product data");
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      name,
      brand,
      category,
      unit,
      pricePerUnit: price,
      stockAvailable: Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : 0,
      imageUrl,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/customer/catalog");
  redirect("/admin/products");
}

export async function setProductActiveAction(productId: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.product.update({
    where: { id: productId },
    data: { isActive },
  });
  revalidatePath("/admin/products");
  revalidatePath("/customer/catalog");
}

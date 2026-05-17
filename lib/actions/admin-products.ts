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

export async function createProductsBulkAction(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false as const, error: "Unauthorized" };
  }

  const csv = String(formData.get("csv") ?? "").trim();
  if (!csv) return { ok: false as const, error: "No CSV provided" };

  function parseLine(line: string) {
    const fields: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        fields.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    fields.push(cur.trim());
    return fields;
  }

  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  // allow header row
  const hasHeader = lines.length > 0 && /name/i.test(lines[0]) && /brand/i.test(lines[0]);
  if (hasHeader) lines.shift();

  const results: { line: number; ok: boolean; error?: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const rowNum = i + 1;
    const fields = parseLine(lines[i]);
    const [name, brand, category, unit, priceStr, stockStr, imageUrl] = fields;
    if (!name || !brand || !category || !unit || !priceStr) {
      results.push({ line: rowNum, ok: false, error: "Missing required fields" });
      continue;
    }
    const price = Number(priceStr.replace(/,/g, ""));
    const stock = Number(stockStr ?? "0");
    if (!Number.isFinite(price) || price < 0) {
      results.push({ line: rowNum, ok: false, error: "Invalid price" });
      continue;
    }

    try {
      await prisma.product.create({
        data: {
          name: String(name),
          brand: String(brand),
          category: String(category),
          unit: String(unit),
          pricePerUnit: price,
          stockAvailable: Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : 0,
          imageUrl: (imageUrl && String(imageUrl)) || null,
          isActive: true,
        },
      });
      results.push({ line: rowNum, ok: true });
    } catch (e: any) {
      results.push({ line: rowNum, ok: false, error: e?.message ?? String(e) });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/customer/catalog");

  const created = results.filter((r) => r.ok).length;
  const errors = results.filter((r) => !r.ok);
  return { ok: true as const, created, errors };
}

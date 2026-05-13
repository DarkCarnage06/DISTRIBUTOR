"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function randomPassword(length = 10) {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function createCustomerAction(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false as const, error: "Unauthorized" };
  }

  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const storeName = String(formData.get("storeName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const approveNow = formData.get("approveNow") === "on";
  const plainPassword =
    String(formData.get("password") ?? "").trim() || randomPassword(10);

  if (!username || !storeName) {
    return { ok: false as const, error: "Username and store name are required." };
  }

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) {
    return { ok: false as const, error: "That username is already taken." };
  }

  const hash = await bcrypt.hash(plainPassword, 10);

  await prisma.user.create({
    data: {
      username,
      password: hash,
      role: "CUSTOMER",
      storeName,
      phone,
      address,
      isApproved: approveNow,
      isActive: true,
    },
  });

  revalidatePath("/admin/customers");
  return {
    ok: true as const,
    username,
    password: plainPassword,
    approved: approveNow,
  };
}

export async function setCustomerApprovalAction(userId: string, isApproved: boolean) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: userId, role: "CUSTOMER" },
    data: { isApproved },
  });
  revalidatePath("/admin/customers");
}

export async function setCustomerActiveAction(userId: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: userId, role: "CUSTOMER" },
    data: { isActive },
  });
  revalidatePath("/admin/customers");
}

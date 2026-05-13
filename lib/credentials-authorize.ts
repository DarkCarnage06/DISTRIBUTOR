import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function authorizeCredentials(
  credentials: Partial<Record<"username" | "password", unknown>> | undefined,
) {
  const username = credentials?.username as string | undefined;
  const password = credentials?.password as string | undefined;
  if (!username?.trim() || !password) return null;

  const user = await prisma.user.findUnique({
    where: { username: username.trim() },
  });
  if (!user || !user.isActive) return null;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  return {
    id: user.id,
    name: user.storeName ?? user.username,
    email: null,
    role: user.role,
    username: user.username,
    isApproved: user.isApproved,
  };
}

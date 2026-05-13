import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin/dashboard");

  const row = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isApproved: true, isActive: true },
  });
  if (!row?.isActive) redirect("/login");
  redirect(row.isApproved ? "/customer/catalog" : "/customer/pending");
}

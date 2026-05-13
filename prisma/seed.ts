import { PrismaClient, Role, OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("admin123", 10);
  const customerHash = await bcrypt.hash("store123", 10);

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      username: "admin",
      password: adminHash,
      role: Role.ADMIN,
      storeName: "Wholesale HQ",
      phone: "+91-9000000000",
      address: "Distribution Center",
      isApproved: true,
      isActive: true,
    },
  });

  const c1 = await prisma.user.create({
    data: {
      username: "freshmart",
      password: customerHash,
      role: Role.CUSTOMER,
      storeName: "Fresh Mart",
      phone: "+91-9123456789",
      address: "12 Market Road, Bengaluru",
      isApproved: true,
      isActive: true,
    },
  });

  const c2 = await prisma.user.create({
    data: {
      username: "cornerstore",
      password: customerHash,
      role: Role.CUSTOMER,
      storeName: "Corner Store",
      phone: "+91-9988776655",
      address: "88 High Street, Mysuru",
      isApproved: true,
      isActive: true,
    },
  });

  const products = [
    {
      name: "Dairy Milk Silk",
      brand: "Cadbury",
      category: "Chocolate",
      pricePerUnit: 480,
      unit: "box",
      stockAvailable: 120,
    },
    {
      name: "5 Star Family Pack",
      brand: "Cadbury",
      category: "Chocolate",
      pricePerUnit: 360,
      unit: "box",
      stockAvailable: 80,
    },
    {
      name: "Good Day Butter",
      brand: "Britannia",
      category: "Biscuits",
      pricePerUnit: 120,
      unit: "dozen",
      stockAvailable: 200,
    },
    {
      name: "Marie Gold",
      brand: "Britannia",
      category: "Biscuits",
      pricePerUnit: 95,
      unit: "dozen",
      stockAvailable: 150,
    },
    {
      name: "Parle-G",
      brand: "Parle",
      category: "Biscuits",
      pricePerUnit: 60,
      unit: "dozen",
      stockAvailable: 500,
    },
    {
      name: "Hide & Seek",
      brand: "Parle",
      category: "Biscuits",
      pricePerUnit: 140,
      unit: "dozen",
      stockAvailable: 90,
    },
    {
      name: "Surf Excel Matic Liquid",
      brand: "HUL",
      category: "Detergent",
      pricePerUnit: 850,
      unit: "box",
      stockAvailable: 45,
    },
    {
      name: "Dove Beauty Bar",
      brand: "HUL",
      category: "Personal Care",
      pricePerUnit: 420,
      unit: "box",
      stockAvailable: 70,
    },
    {
      name: "Knorr Soup Tomato",
      brand: "HUL",
      category: "Food",
      pricePerUnit: 180,
      unit: "box",
      stockAvailable: 110,
    },
    {
      name: "Bourbon Cream",
      brand: "Britannia",
      category: "Biscuits",
      pricePerUnit: 110,
      unit: "dozen",
      stockAvailable: 130,
    },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: {
        ...p,
        pricePerUnit: p.pricePerUnit,
        isActive: true,
      },
    });
  }

  const allProducts = await prisma.product.findMany({ take: 3 });
  let total = 0;
  const items = allProducts.map((prod, i) => {
    const qty = (i + 1) * 2;
    const price = Number(prod.pricePerUnit);
    total += price * qty;
    return {
      productId: prod.id,
      quantity: qty,
      priceAtTime: prod.pricePerUnit,
    };
  });

  await prisma.order.create({
    data: {
      customerId: c1.id,
      status: OrderStatus.CONFIRMED,
      totalAmount: total,
      notes: "Deliver before noon",
      items: { create: items },
    },
  });

  console.log("Seed complete.");
  console.log("Admin: admin / admin123");
  console.log("Customers: freshmart, cornerstore / store123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

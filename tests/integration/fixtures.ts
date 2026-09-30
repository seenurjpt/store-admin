import { db } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth";

export async function resetDatabase() {
  await db.$executeRawUnsafe('TRUNCATE TABLE "Product", "Category", "User" CASCADE');

  const [admin, manager] = await Promise.all([
    db.user.create({
      data: { email: "admin@test.local", name: "Test Admin", role: "ADMIN", passwordHash: "not-used" },
      select: { id: true, name: true, email: true, role: true },
    }),
    db.user.create({
      data: { email: "manager@test.local", name: "Test Manager", role: "MANAGER", passwordHash: "not-used" },
      select: { id: true, name: true, email: true, role: true },
    }),
  ]);

  const [food, drink] = await Promise.all([
    db.category.create({ data: { name: "Food", slug: "food" } }),
    db.category.create({ data: { name: "Drink", slug: "drink" } }),
  ]);

  return { admin: admin satisfies CurrentUser, manager: manager satisfies CurrentUser, food, drink };
}

export function productFormData(values: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) formData.set(key, value);
  return formData;
}

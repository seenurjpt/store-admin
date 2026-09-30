import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type ProductStatus } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const users = [
  { email: "admin@example.com", name: "Alice Admin", password: "Admin123!", role: "ADMIN" },
  { email: "manager@example.com", name: "Mark Manager", password: "Manager123!", role: "MANAGER" },
] as const;

const categories = [
  { name: "Food", slug: "food" },
  { name: "Drink", slug: "drink" },
  { name: "Dessert", slug: "dessert" },
  { name: "Other", slug: "other" },
];

type SeedProduct = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  status: "active" | "inactive";
  /** Unsplash photo id; products without one show a category placeholder. */
  photo?: string;
};

const products: SeedProduct[] = [
  { name: "Margherita Pizza", description: "Classic Italian pizza with tomato and mozzarella", price: 12, stock: 20, category: "food", status: "active", photo: "1574071318508-1cdbab80d002" },
  { name: "Classic Burger", description: "Beef burger with lettuce and tomato", price: 10, stock: 15, category: "food", status: "active", photo: "1568901346375-23c9450c58cd" },
  { name: "Coca Cola", description: "330ml Coca Cola", price: 3, stock: 50, category: "drink", status: "inactive", photo: "1554866585-cd94860890b7" },
  { name: "Pepperoni Pizza", description: "Tomato, mozzarella and spicy pepperoni", price: 14, stock: 18, category: "food", status: "active", photo: "1628840042765-356cda07504e" },
  { name: "Vegetarian Pizza", description: "Peppers, mushrooms, onions and olives", price: 13, stock: 0, category: "food", status: "inactive", photo: "1565299624946-b28f40a0ae38" },
  { name: "Four Cheese Pizza", description: "Mozzarella, gorgonzola, parmesan and fontina", price: 15.5, stock: 9, category: "food", status: "active", photo: "1513104890138-7c749659a591" },
  { name: "Chicken Caesar Salad", description: "Romaine, grilled chicken, croutons and parmesan", price: 9.5, stock: 12, category: "food", status: "active", photo: "1550304943-4f24f54ddde9" },
  { name: "Cheeseburger", description: "Beef burger with cheddar, pickles and onion", price: 11, stock: 22, category: "food", status: "active", photo: "1572802419224-296b0aeee0d9" },
  { name: "Veggie Wrap", description: "Grilled vegetables and hummus in a tortilla", price: 8, stock: 6, category: "food", status: "active", photo: "1626700051175-6818013e1d4f" },
  { name: "French Fries", description: "Crispy fries with sea salt", price: 4, stock: 40, category: "food", status: "active", photo: "1573080496219-bb080dd4f877" },
  { name: "Chicken Wings", description: "Six wings with barbecue sauce", price: 9, stock: 3, category: "food", status: "inactive", photo: "1567620832903-9fc6debc209f" },
  { name: "Spaghetti Bolognese", description: "Slow-cooked beef ragù with spaghetti", price: 12.5, stock: 14, category: "food", status: "active", photo: "1622973536968-3ead9e780960" },
  { name: "Sprite", description: "330ml Sprite", price: 3, stock: 45, category: "drink", status: "active", photo: "1625772299848-391b6a87d7b3" },
  { name: "Orange Juice", description: "Freshly squeezed, 250ml", price: 4.5, stock: 20, category: "drink", status: "active", photo: "1600271886742-f049cd451bba" },
  { name: "Sparkling Water", description: "500ml sparkling mineral water", price: 2, stock: 60, category: "drink", status: "active", photo: "1523362628745-0c100150b504" },
  { name: "Iced Tea", description: "Peach iced tea, 330ml", price: 3.5, stock: 0, category: "drink", status: "inactive", photo: "1556679343-c7306c1976bc" },
  { name: "Espresso", description: "Single shot of espresso", price: 2.5, stock: 100, category: "drink", status: "active", photo: "1510591509098-f4fdc6d0ff04" },
  { name: "Cappuccino", description: "Espresso with steamed milk foam", price: 3.8, stock: 80, category: "drink", status: "active", photo: "1572442388796-11668a67e53d" },
  { name: "Lemonade", description: "Homemade lemonade with mint", price: 4, stock: 25, category: "drink", status: "active", photo: "1621263764928-df1444c5e859" },
  { name: "Tiramisu", description: "Coffee-soaked ladyfingers with mascarpone", price: 6.5, stock: 10, category: "dessert", status: "active", photo: "1571877227200-a0d98ea607e9" },
  { name: "Chocolate Brownie", description: "Warm brownie with a fudgy centre", price: 5, stock: 16, category: "dessert", status: "active", photo: "1606313564200-e75d5e30476c" },
  { name: "Cheesecake", description: "New York style with berry compote", price: 6, stock: 8, category: "dessert", status: "active", photo: "1533134242443-d4fd215305ad" },
  { name: "Vanilla Ice Cream", description: "Two scoops of vanilla ice cream", price: 4, stock: 30, category: "dessert", status: "active", photo: "1570197788417-0e82375c9371" },
  { name: "Apple Pie", description: "Traditional apple pie with cinnamon", price: 5.5, stock: 0, category: "dessert", status: "inactive", photo: "1568571780765-9276ac8b75a2" },
  { name: "Panna Cotta", description: "Vanilla panna cotta with raspberry sauce", price: 5.8, stock: 7, category: "dessert", status: "active", photo: "1488477181946-6428a0291777" },
  { name: "Gift Card", description: "Store gift card worth 25", price: 25, stock: 100, category: "other", status: "active" },
  { name: "Tote Bag", description: "Reusable cotton tote bag with store logo", price: 7, stock: 35, category: "other", status: "active" },
  { name: "Takeaway Box", description: "Eco-friendly takeaway container", price: 0.5, stock: 200, category: "other", status: "inactive" },
  { name: "Chili Sauce", description: "Homemade chili sauce, 200ml bottle", price: 4.2, stock: 18, category: "other", status: "active" },
  { name: "Mini Pizza Party Pack", description: "Six mini pizzas for sharing", price: 22, stock: 5, category: "food", status: "active" },
];

function unsplashImage(photoId: string) {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=600&h=600&q=80`;
}

async function main() {
  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, passwordHash },
      create: { email: user.email, name: user.name, role: user.role, passwordHash },
    });
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  // Only seed products into an empty table so re-running the seed never duplicates them.
  if ((await prisma.product.count()) > 0) {
    console.log("Products already exist, skipping product seed.");
    return;
  }

  const admin = await prisma.user.findUniqueOrThrow({ where: { email: "admin@example.com" } });
  const categoryIds = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id]),
  );

  // Spread creation dates over the last month so "created date" sorting is meaningful.
  const now = Date.now();
  await prisma.product.createMany({
    data: products.map((product, index) => ({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      status: product.status.toUpperCase() as ProductStatus,
      imageUrl: product.photo ? unsplashImage(product.photo) : null,
      categoryId: categoryIds[product.category],
      createdById: admin.id,
      createdAt: new Date(now - (products.length - index) * 24 * 60 * 60 * 1000),
    })),
  });

  console.log(`Seeded ${users.length} users, ${categories.length} categories and ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

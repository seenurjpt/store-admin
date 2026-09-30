import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.")),
  password: z.string().min(1, "Enter your password."),
});

// Form values arrive as strings, so an empty string means "not provided".
function numberField(label: string) {
  return z
    .string({ error: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`)
    .pipe(z.coerce.number({ error: `${label} must be a number.` }));
}

export const productSchema = z.object({
  name: z
    .string({ error: "Name is required." })
    .trim()
    .min(1, "Name is required.")
    .min(3, "Name must be at least 3 characters.")
    .max(120, "Name must be 120 characters or fewer."),
  description: z
    .string({ error: "Description is required." })
    .trim()
    .min(1, "Description is required.")
    .max(2000, "Description must be 2000 characters or fewer."),
  price: numberField("Price").pipe(
    z.number().gt(0, "Price must be greater than 0.").max(1_000_000, "Price is too high."),
  ),
  stock: numberField("Stock").pipe(
    z.number().int("Stock must be a whole number.").min(0, "Stock cannot be negative.").max(1_000_000, "Stock is too high."),
  ),
  categoryId: z.string({ error: "Category is required." }).min(1, "Category is required."),
  // Only http(s) URLs are accepted so values like `javascript:` never end up in an <img src>.
  imageUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null)
    .pipe(z.url({ protocol: /^https?$/, error: "Enter a valid URL starting with http:// or https://." }).nullable()),
  status: z.enum(["ACTIVE", "INACTIVE"], { error: "Select a status." }),
});

export type ProductInput = z.output<typeof productSchema>;
export type ProductField = keyof z.input<typeof productSchema>;
export type ProductFormValues = Partial<Record<ProductField, string>>;

const PRODUCT_FIELDS: ProductField[] = ["name", "description", "price", "stock", "categoryId", "imageUrl", "status"];

/** Reads the product fields from submitted form data. Used by both the form and the Server Actions. */
export function readProductForm(formData: FormData): ProductFormValues {
  const values: ProductFormValues = {};
  for (const field of PRODUCT_FIELDS) {
    const value = formData.get(field);
    if (typeof value === "string") values[field] = value;
  }
  return values;
}

export const productStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

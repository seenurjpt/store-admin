import Avatar from "@mui/material/Avatar";
import type { SvgIconComponent } from "@mui/icons-material";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import IcecreamOutlinedIcon from "@mui/icons-material/IcecreamOutlined";
import LocalCafeOutlinedIcon from "@mui/icons-material/LocalCafeOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { DARK } from "@/lib/tint";

type CategoryColors = { color: string; background: string; darkColor: string; darkBackground: string; Icon: SvgIconComponent };

// Each category gets its own colour and icon, used for placeholders and category chips.
const categoryColors: Record<string, CategoryColors> = {
  food: { color: "#c2410c", background: "#ffedd5", darkColor: "#fdba74", darkBackground: "rgb(251 146 60 / 0.16)", Icon: RestaurantOutlinedIcon },
  drink: { color: "#0369a1", background: "#e0f2fe", darkColor: "#7dd3fc", darkBackground: "rgb(56 189 248 / 0.16)", Icon: LocalCafeOutlinedIcon },
  dessert: { color: "#be185d", background: "#fce7f3", darkColor: "#f9a8d4", darkBackground: "rgb(244 114 182 / 0.16)", Icon: IcecreamOutlinedIcon },
  other: { color: "#6d28d9", background: "#ede9fe", darkColor: "#c4b5fd", darkBackground: "rgb(167 139 250 / 0.16)", Icon: ShoppingBagOutlinedIcon },
};

const defaultColors: CategoryColors = {
  color: "#475569",
  background: "#f1f5f9",
  darkColor: "#cbd5e1",
  darkBackground: "rgb(148 163 184 / 0.16)",
  Icon: CategoryOutlinedIcon,
};

/** Text and background colours for a category, for light and dark mode (usable in `sx`). */
export function categorySx(slug: string) {
  const c = categoryColors[slug] ?? defaultColors;
  return { color: c.color, bgcolor: c.background, [DARK]: { color: c.darkColor, bgcolor: c.darkBackground } };
}

type Props = {
  product: { imageUrl: string | null; category: { slug: string } };
  /** Leave empty when the product name is already shown next to the image. */
  alt?: string;
  /** "small" for list thumbnails, "banner" for the full-width image on the product page. */
  size?: "small" | "banner";
};

/**
 * Image URLs are entered by users and can point to any host, so MUI's Avatar (a plain <img>)
 * is used instead of next/image, which would need every host allow-listed. Avatar also falls
 * back to the category icon when the image is missing or fails to load.
 */
export function ProductAvatar({ product, alt = "", size = "small" }: Props) {
  const { Icon } = categoryColors[product.category.slug] ?? defaultColors;
  const banner = size === "banner";

  return (
    <Avatar
      variant="rounded"
      src={product.imageUrl ?? undefined}
      alt={alt}
      slotProps={{ img: { referrerPolicy: "no-referrer", loading: "lazy" } }}
      sx={{
        ...categorySx(product.category.slug),
        ...(banner
          ? { width: "100%", height: { xs: 240, sm: 320, lg: 380 }, borderRadius: 0 }
          : { width: 40, height: 40, borderRadius: 2 }),
      }}
    >
      <Icon sx={{ fontSize: banner ? 96 : 20 }} />
    </Avatar>
  );
}

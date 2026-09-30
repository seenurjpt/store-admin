import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { getCurrentUser } from "@/lib/auth";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

const features = [
  { icon: <Inventory2OutlinedIcon />, title: "Product catalogue", text: "Create, edit and organise products by category." },
  { icon: <InsightsOutlinedIcon />, title: "Live overview", text: "See stock levels and product status at a glance." },
  { icon: <ShieldOutlinedIcon />, title: "Role-based access", text: "Admins and managers get the right permissions." },
];

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <Box component="main" sx={{ minHeight: "100vh", display: "grid", gridTemplateColumns: { md: "1fr 1fr" } }}>
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          position: "relative",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          p: 6,
          color: "#ffffff",
          background: "linear-gradient(150deg, #1e1b4b 0%, #312e81 45%, #4f46e5 100%)",
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            top: -180,
            right: -180,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgb(129 140 248 / 0.35), transparent 70%)",
          }}
        />
        <Box sx={{ position: "relative", width: "100%", maxWidth: 460 }}>
          <Brand inverted />
          <Typography variant="h4" component="p" sx={{ mt: 6, fontSize: "2.5rem", lineHeight: 1.15 }}>
            Everything your store needs, in one place.
          </Typography>
          <Typography sx={{ mt: 2, color: "#c7d2fe" }}>
            Keep products, prices and stock up to date, with the right access for every member of your team.
          </Typography>

          <Stack spacing={1.5} sx={{ mt: 5 }}>
            {features.map((feature) => (
              <Stack
                key={feature.title}
                direction="row"
                spacing={2}
                sx={{ alignItems: "center", p: 2, borderRadius: 3, bgcolor: "rgb(255 255 255 / 0.08)", border: "1px solid rgb(255 255 255 / 0.12)" }}
              >
                <Box
                  aria-hidden="true"
                  sx={{ width: 40, height: 40, flexShrink: 0, borderRadius: 2, display: "grid", placeItems: "center", color: "#e0e7ff", bgcolor: "rgb(255 255 255 / 0.12)" }}
                >
                  {feature.icon}
                </Box>
                <div>
                  <Typography sx={{ fontWeight: 600 }}>{feature.title}</Typography>
                  <Typography variant="body2" sx={{ color: "#c7d2fe" }}>
                    {feature.text}
                  </Typography>
                </div>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>

      <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", px: 3, py: 8, bgcolor: "background.paper" }}>
        <Box sx={{ position: "absolute", top: 16, right: 16 }}>
          <ThemeToggle />
        </Box>
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Box sx={{ display: { md: "none" }, mb: 5 }}>
            <Brand />
          </Box>
          <Typography variant="h4" component="h1">
            Welcome back
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
            Log in to manage your store.
          </Typography>
          <LoginForm />
        </Box>
      </Box>
    </Box>
  );
}

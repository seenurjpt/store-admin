"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import type { Theme } from "@mui/material/styles";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { logout } from "@/app/actions/auth";
import type { CurrentUser } from "@/lib/auth";
import { SIDEBAR_COOKIE } from "@/lib/sidebar";
import { tint } from "@/lib/tint";
import { Brand } from "./brand";
import { useColorModeToggle } from "./theme-toggle";

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 76;

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: <DashboardOutlinedIcon /> },
  { href: "/products", label: "Products", icon: <Inventory2OutlinedIcon /> },
];

const widthTransition = (theme: Theme) => theme.transitions.create("width", { duration: theme.transitions.duration.shorter });

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SidebarItem({
  label,
  text = label,
  icon,
  collapsed,
  active = false,
  ...props
}: {
  /** Accessible name and tooltip. */
  label: string;
  /** Visible text when expanded, if shorter than the label. */
  text?: string;
  icon: React.ReactNode;
  collapsed: boolean;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  return (
    // Labels are hidden when collapsed, so the tooltip and aria-label carry the name.
    <Tooltip title={collapsed ? label : ""} placement="right">
      <ListItemButton
        {...props}
        selected={active}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        sx={{
          mb: 0.5,
          minHeight: 44,
          borderRadius: 2,
          justifyContent: collapsed ? "center" : "flex-start",
          color: "text.secondary",
          "& .MuiListItemIcon-root": { minWidth: collapsed ? 0 : 36, color: "inherit" },
          "&:hover": { bgcolor: "action.hover", color: "text.primary" },
          "&.Mui-selected, &.Mui-selected:hover": { bgcolor: tint("primary"), color: "primary.main" },
        }}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        {!collapsed && <ListItemText primary={text} slotProps={{ primary: { sx: { fontSize: 14, fontWeight: active ? 600 : 500 } } }} />}
      </ListItemButton>
    </Tooltip>
  );
}

type SidebarProps = {
  user: CurrentUser;
  collapsed: boolean;
  onNavigate?: () => void;
  onToggleCollapsed?: () => void;
};

function SidebarContent({ user, collapsed, onNavigate, onToggleCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const colorMode = useColorModeToggle();
  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: collapsed ? "column" : "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          px: collapsed ? 1 : 2,
          py: 2,
        }}
      >
        <Box component={Link} href="/dashboard" onClick={onNavigate} sx={{ display: "flex", textDecoration: "none", borderRadius: 2 }}>
          <Brand compact={collapsed} />
        </Box>
        {onToggleCollapsed && (
          <Tooltip title={toggleLabel} placement="right">
            <IconButton
              aria-label={toggleLabel}
              onClick={onToggleCollapsed}
              size="small"
              sx={{ color: "text.secondary", border: 1, borderColor: "divider", borderRadius: 2 }}
            >
              {collapsed ? <KeyboardDoubleArrowRightIcon fontSize="small" /> : <KeyboardDoubleArrowLeftIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box component="nav" aria-label="Main" sx={{ flex: 1, px: 1.5 }}>
        <Typography variant="overline" component="p" sx={{ px: 1.5, color: "text.secondary", visibility: collapsed ? "hidden" : "visible" }}>
          Menu
        </Typography>
        <List disablePadding>
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              collapsed={collapsed}
              active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              onClick={onNavigate}
            />
          ))}
        </List>
      </Box>

      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <List disablePadding>
          <SidebarItem
            label={colorMode.label}
            text={colorMode.isDark ? "Light mode" : "Dark mode"}
            icon={colorMode.icon}
            collapsed={collapsed}
            onClick={colorMode.toggle}
          />
        </List>

        <Box
          sx={{
            display: "flex",
            flexDirection: collapsed ? "column" : "row",
            alignItems: "center",
            gap: 1.5,
            mt: 1,
            p: collapsed ? 1 : 1.5,
            borderRadius: 2,
            bgcolor: "action.hover",
          }}
        >
          <Tooltip title={collapsed ? `${user.name} (${user.role === "ADMIN" ? "Admin" : "Manager"})` : ""} placement="right">
            <Avatar sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 600, bgcolor: "primary.main", color: "primary.contrastText" }}>
              {initials(user.name)}
            </Avatar>
          </Tooltip>
          {!collapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.role === "ADMIN" ? "Admin" : "Manager"}
              </Typography>
            </Box>
          )}
          <form action={logout}>
            <Tooltip title="Log out" placement={collapsed ? "right" : "top"}>
              <IconButton type="submit" aria-label="Log out" size="small" sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </form>
        </Box>
      </Box>
    </Box>
  );
}

export function AppShell({
  user,
  defaultCollapsed,
  children,
}: {
  user: CurrentUser;
  defaultCollapsed: boolean;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }

  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const paperSx = { bgcolor: "background.paper", borderRight: 1, borderColor: "divider" };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="a"
        href="#main"
        sx={{
          position: "absolute",
          top: -48,
          left: 8,
          zIndex: "tooltip",
          px: 2,
          py: 1,
          borderRadius: 1,
          bgcolor: "background.paper",
          boxShadow: 2,
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </Box>

      {/* Mobile: top bar with a menu button that opens the sidebar as a drawer */}
      <AppBar position="fixed" color="inherit" elevation={0} sx={{ display: { md: "none" }, borderBottom: 1, borderColor: "divider" }}>
        <Toolbar>
          <IconButton edge="start" aria-label="Open navigation" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
          <Box component={Link} href="/dashboard" sx={{ textDecoration: "none" }}>
            <Brand />
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={closeMobile}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { md: "none" } }}
        slotProps={{ paper: { sx: { ...paperSx, width: EXPANDED_WIDTH } } }}
      >
        <SidebarContent user={user} collapsed={false} onNavigate={closeMobile} />
      </Drawer>

      {/* Desktop: permanent sidebar that can be collapsed to icons */}
      <Drawer
        variant="permanent"
        sx={{ display: { xs: "none", md: "block" }, width, flexShrink: 0, transition: widthTransition }}
        slotProps={{ paper: { sx: { ...paperSx, width, overflowX: "hidden", transition: widthTransition } } }}
      >
        <SidebarContent user={user} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
      </Drawer>

      <Box component="main" id="main" tabIndex={-1} sx={{ flex: 1, minWidth: 0, outline: "none" }}>
        <Toolbar sx={{ display: { md: "none" } }} />
        <Container maxWidth={false} sx={{ py: { xs: 3, md: 4 }, px: { xs: 2, sm: 3, lg: 4 } }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}

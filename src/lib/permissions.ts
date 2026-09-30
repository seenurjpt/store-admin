import type { Role } from "@/generated/prisma/enums";

export type Permission =
  | "product:view"
  | "product:create"
  | "product:update"
  | "product:change-status"
  | "product:delete";

const rolePermissions: Record<Role, readonly Permission[]> = {
  ADMIN: ["product:view", "product:create", "product:update", "product:change-status", "product:delete"],
  MANAGER: ["product:view", "product:create", "product:update", "product:change-status"],
};

export function can(role: Role, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

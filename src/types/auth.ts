export const ROLE_OPTIONS = [
  { value: "lider", label: "Líder" },
  { value: "investigador", label: "Investigador" },
  { value: "admin", label: "Admin" },
] as const;

export type Role = (typeof ROLE_OPTIONS)[number]["value"];

export type AccountStatus = "pendiente" | "activo";

export interface PlatformUser {
  id: string;
  nombre: string;
  email: string;
  password: string;
  status: AccountStatus;
  role: Role | null;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  nombre: string;
  email: string;
  role: Role;
}

export function roleLabel(role: Role): string {
  const match = ROLE_OPTIONS.find((option) => option.value === role);
  return match ? match.label : role;
}

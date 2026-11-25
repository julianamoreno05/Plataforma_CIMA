import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";
import type { PlatformUser, Role, SessionUser } from "@/types/auth";

/**
 * Sesión y directorio de la maqueta.
 * Las credenciales viven en localStorage solo para simular el flujo.
 */

export const DEMO_ADMIN = {
  nombre: "Administración CIMA",
  email: "admin@cima.local",
  password: "admin123",
} as const;

export const DEMO_PENDING_USERS = [
  { nombre: "Ana Gómez", email: "ana.gomez@comunidad.org" },
  { nombre: "Carlos Ruiz", email: "carlos.ruiz@uni.edu" },
] as const;

export const DEMO_PENDING_PASSWORD = "cima123";

export interface RegisterInput {
  nombre: string;
  email: string;
  password: string;
}

export type RegisterResult = { ok: true } | { ok: false; reason: "duplicate" };

export type LoginResult =
  | { ok: true; role: Role }
  | { ok: false; reason: "invalid" | "pending" };

interface AuthState {
  users: PlatformUser[];
  session: SessionUser | null;
  register: (input: RegisterInput) => RegisterResult;
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
  approveUser: (userId: string, role: Role) => boolean;
}

const seedUsers: PlatformUser[] = [
  {
    id: "usr-admin",
    nombre: DEMO_ADMIN.nombre,
    email: DEMO_ADMIN.email,
    password: DEMO_ADMIN.password,
    status: "activo",
    role: "admin",
    createdAt: "2026-10-01T12:00:00.000Z",
  },
  {
    id: "usr-ana",
    nombre: DEMO_PENDING_USERS[0].nombre,
    email: DEMO_PENDING_USERS[0].email,
    password: DEMO_PENDING_PASSWORD,
    status: "pendiente",
    role: null,
    createdAt: "2026-10-20T15:30:00.000Z",
  },
  {
    id: "usr-carlos",
    nombre: DEMO_PENDING_USERS[1].nombre,
    email: DEMO_PENDING_USERS[1].email,
    password: DEMO_PENDING_PASSWORD,
    status: "pendiente",
    role: null,
    createdAt: "2026-10-27T09:10:00.000Z",
  },
];

const serverStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      session: null,
      register: (input) => {
        const email = normalizeEmail(input.email);
        const exists = get().users.some((user) => user.email === email);
        if (exists) {
          return { ok: false, reason: "duplicate" };
        }

        const user: PlatformUser = {
          id: crypto.randomUUID(),
          nombre: input.nombre.trim(),
          email,
          password: input.password,
          status: "pendiente",
          role: null,
          createdAt: new Date().toISOString(),
        };

        set({ users: [user, ...get().users] });
        return { ok: true };
      },
      login: (email, password) => {
        const user = get().users.find(
          (item) => item.email === normalizeEmail(email) && item.password === password,
        );

        if (!user) {
          return { ok: false, reason: "invalid" };
        }

        if (user.status !== "activo" || user.role === null) {
          return { ok: false, reason: "pending" };
        }

        set({
          session: {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            role: user.role,
          },
        });

        return { ok: true, role: user.role };
      },
      logout: () => set({ session: null }),
      approveUser: (userId, role) => {
        const current = get().users.find((user) => user.id === userId);
        if (!current || current.status !== "pendiente") {
          return false;
        }

        set({
          users: get().users.map((user) =>
            user.id === userId ? { ...user, status: "activo", role } : user,
          ),
        });
        return true;
      },
    }),
    {
      name: "cima-auth",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? serverStorage : localStorage,
      ),
      partialize: (state) => ({
        users: state.users,
        session: state.session,
      }),
    },
  ),
);

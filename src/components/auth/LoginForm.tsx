"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import {
  DEMO_ADMIN,
  DEMO_PENDING_PASSWORD,
  DEMO_PENDING_USERS,
  useAuthStore,
} from "@/store/auth-store";

export function LoginForm() {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const session = useAuthStore((state) => state.session);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError("Escribe tu correo y contraseña.");
      return;
    }

    const result = login(email, password);
    if (!result.ok) {
      setFormError(
        result.reason === "pending"
          ? "Tu cuenta está en estado Pendiente. Un administrador debe aprobarla y asignarte un rol."
          : "Correo o contraseña incorrectos.",
      );
      return;
    }

    router.push(result.role === "admin" ? "/admin" : "/");
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col">
      {!hydrated ? (
        <p className="mx-auto max-w-xl px-8 py-16 text-sm text-muted">Cargando sesión…</p>
      ) : session ? (
        <div className="mx-auto max-w-xl px-8 py-16">
          <div className="rounded-2xl border border-line bg-white p-8">
            <h2 className="text-xl font-bold">Sesión activa</h2>
            <p className="mt-2 text-sm text-muted">{session.nombre}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={session.role === "admin" ? "/admin" : "/"}
                className="flex min-h-[48px] items-center rounded-[10px] bg-teal px-6 text-[17px] font-bold text-white no-underline hover:bg-teal-dark"
              >
                Continuar
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex min-h-[48px] items-center rounded-[10px] border border-line bg-white px-6 text-[17px] font-semibold text-foreground hover:bg-background"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-wrap">
          {/* Left panel */}
          <div className="flex flex-1 basis-[420px] flex-col justify-center gap-5 bg-teal-soft px-12 py-16">
            <p className="text-xs font-bold uppercase tracking-[2px] text-teal">BIENVENIDA</p>
            <h1 className="max-w-[440px] text-4xl font-bold leading-[1.15]">
              Tu territorio, explicado con claridad
            </h1>
            <ul className="flex flex-col gap-3.5 text-[17px]">
              <li className="flex items-center gap-2.5">
                <CheckIcon />
                Un mapa simple con pocas capas
              </li>
              <li className="flex items-center gap-2.5">
                <CheckIcon />
                Un asistente que cita sus fuentes
              </li>
              <li className="flex items-center gap-2.5">
                <CheckIcon />
                Funciona sin conexión
              </li>
            </ul>
          </div>

          {/* Right panel - form */}
          <div className="flex flex-1 basis-[420px] items-center justify-center px-8 py-12">
            <form
              noValidate
              onSubmit={handleSubmit}
              className="flex w-full max-w-[420px] flex-col gap-[18px] rounded-2xl border border-line bg-white p-8"
            >
              <div>
                <h2 className="text-[26px] font-bold">Ingresar</h2>
                <p className="mt-1 text-[15px] text-muted">
                  Accede con tu cuenta de la plataforma.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-semibold">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-[48px] w-full rounded-[10px] border border-[#7B8794] bg-white px-3.5 text-base text-foreground outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-semibold">
                  Contraseña
                </label>
                <div className="flex items-center rounded-[10px] border border-[#7B8794] pr-1 focus-within:border-teal focus-within:ring-2 focus-within:ring-teal/20">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="min-h-[46px] min-w-0 flex-1 border-none bg-transparent px-3.5 text-base text-foreground outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="min-h-[44px] cursor-pointer border-none bg-transparent px-3 text-sm font-bold text-teal"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              {formError ? (
                <p role="alert" className="text-sm text-red-700">
                  {formError}
                </p>
              ) : null}

              <button
                type="submit"
                className="flex min-h-[48px] items-center justify-center rounded-[10px] bg-teal text-[17px] font-bold text-white hover:bg-teal-dark"
              >
                Ingresar
              </button>

              <div className="border-t border-line pt-4 text-center text-[15px] text-muted">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="font-bold text-teal">
                  Regístrate
                </Link>
              </div>

              {/* Demo access box */}
              <div className="rounded-xl border border-dashed border-line bg-background px-4 py-3 text-sm text-muted">
                <p className="font-semibold text-foreground">Acceso de demostración</p>
                <p className="mt-2">
                  Administrador: {DEMO_ADMIN.email} · {DEMO_ADMIN.password}
                </p>
                <p className="mt-2">
                  Pendientes de ejemplo (contraseña {DEMO_PENDING_PASSWORD}; solo ingresan después
                  de ser aprobados):
                </p>
                <ul className="mt-1 list-disc pl-5">
                  {DEMO_PENDING_USERS.map((user) => (
                    <li key={user.email}>{user.email}</li>
                  ))}
                </ul>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function CheckIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0F766E"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

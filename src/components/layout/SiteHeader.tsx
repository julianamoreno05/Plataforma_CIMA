"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { useAuthStore } from "@/store/auth-store";
import { roleLabel } from "@/types/auth";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="border-b border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-8 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3.5">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-teal text-xl font-bold text-white"
            aria-hidden="true"
          >
            C
          </span>
          <span>
            <span className="block text-[17px] font-bold leading-tight">Plataforma CIMA</span>
            <span className="block text-[13px] text-muted">Acceso institucional</span>
          </span>
        </Link>

        {/* Nav */}
        <nav
          className="flex flex-wrap items-center gap-1 text-base"
          aria-label="Principal"
        >
          <NavItem href="/" pathname={pathname}>Inicio</NavItem>
          <NavItem href="/mapa" pathname={pathname}>Mapa</NavItem>
          <NavItem href="/archivos" pathname={pathname}>Archivos</NavItem>
          {hydrated && session?.role === "admin" ? (
            <NavItem href="/admin" pathname={pathname}>Administración</NavItem>
          ) : null}
          {hydrated && !session ? (
            <>
              <NavItem href="/login" pathname={pathname}>Ingresar</NavItem>
              <NavItem href="/register" pathname={pathname}>Registro</NavItem>
            </>
          ) : null}
          {hydrated && session ? (
            <div className="ml-2 flex items-center gap-3 border-l border-line pl-4">
              <div className="text-right">
                <p className="max-w-48 truncate text-sm font-semibold">{session.nombre}</p>
                <p className="text-xs font-semibold text-teal">{roleLabel(session.role)}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-[44px] items-center rounded-[10px] border border-line bg-white px-3 text-sm font-semibold text-foreground hover:bg-background"
              >
                Salir
              </button>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

function NavItem({
  href,
  pathname,
  children,
}: {
  href: string;
  pathname: string;
  children: string;
}) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`flex min-h-[44px] items-center px-3.5 no-underline ${
        active
          ? "font-bold text-teal"
          : "font-semibold text-muted hover:text-teal"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

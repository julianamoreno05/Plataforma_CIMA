"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayerControl } from "@/components/map/LayerControl";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { useAuthStore } from "@/store/auth-store";
import { roleLabel } from "@/types/auth";
import type { LayerId } from "@/types/map";

interface MapSidebarProps {
  visibility: Record<LayerId, boolean>;
  selectedLayerId: LayerId | null;
  onToggle: (layerId: LayerId) => void;
  onSelect: (layerId: LayerId) => void;
}

const links = [
  { href: "/", label: "Inicio" },
  { href: "/mapa", label: "Mapa" },
  { href: "/archivos", label: "Archivos" },
];

export function MapSidebar({ visibility, selectedLayerId, onToggle, onSelect }: MapSidebarProps) {
  const pathname = usePathname();
  const hydrated = useAuthHydrated();
  const session = useAuthStore((state) => state.session);
  const showAdmin = hydrated && session?.role === "admin";

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-r border-line bg-white">
      {/* Header */}
      <div className="border-b border-line px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-[2px] text-teal">Samaná, Caldas</p>
        <h1 className="mt-1 text-lg font-bold">Visor de capas</h1>
      </div>

      {/* Navigation */}
      <nav className="border-b border-line px-3 py-4" aria-label="Navegación">
        <p className="px-2 text-xs font-bold uppercase tracking-[1.5px] text-muted">Navegación</p>
        <ul className="mt-2 space-y-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-[10px] px-2 py-2 text-sm font-semibold ${
                    active ? "bg-teal-soft text-teal-dark" : "text-foreground hover:bg-background"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          {showAdmin ? (
            <li>
              <Link
                href="/admin"
                className="block rounded-[10px] px-2 py-2 text-sm font-semibold text-foreground hover:bg-background"
              >
                Administración
              </Link>
            </li>
          ) : null}
        </ul>
      </nav>

      {/* User info */}
      {hydrated && session ? (
        <div className="border-b border-line px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-soft text-sm font-bold text-teal">
              {session.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{session.nombre}</p>
              <p className="text-xs text-muted">{roleLabel(session.role)}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Layers */}
      <div className="flex-1 overflow-y-auto py-4">
        <LayerControl
          visibility={visibility}
          selectedLayerId={selectedLayerId}
          onToggle={onToggle}
          onSelect={onSelect}
        />
      </div>

      <p className="border-t border-line px-5 py-4 text-xs leading-5 text-muted">
        Capas simuladas. Enciende o apaga cada una y abre sus metadatos con un clic en el nombre.
      </p>
    </aside>
  );
}

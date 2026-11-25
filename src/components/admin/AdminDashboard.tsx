"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ApproveRoleModal } from "@/components/admin/ApproveRoleModal";
import { PendingUsersTable } from "@/components/admin/PendingUsersTable";
import { buttonClass } from "@/components/ui/Button";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { useAuthStore } from "@/store/auth-store";
import type { Role, SessionUser } from "@/types/auth";
import { roleLabel } from "@/types/auth";

export function AdminDashboard() {
  const hydrated = useAuthHydrated();
  const session = useAuthStore((state) => state.session);
  const users = useAuthStore((state) => state.users);
  const approveUser = useAuthStore((state) => state.approveUser);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const closeModal = useCallback(() => setSelectedUserId(null), []);

  const pending = useMemo(
    () =>
      users
        .filter((user) => user.status === "pendiente")
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [users],
  );
  const selected = pending.find((user) => user.id === selectedUserId) ?? null;

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-6xl px-8 py-12">
        <p className="text-sm text-muted">Cargando sesión…</p>
      </main>
    );
  }

  if (!session || session.role !== "admin") {
    return <AdminAccessGate session={session} />;
  }

  function handleConfirm(role: Role) {
    if (!selected) {
      return;
    }
    const approved = approveUser(selected.id, role);
    setSelectedUserId(null);
    if (approved) {
      setNotice(`Se aprobó a ${selected.nombre} con el rol ${roleLabel(role)}.`);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-8 py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">CIMA</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Dashboard del Administrador
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Revisa las cuentas en estado Pendiente y asigna un rol para habilitar el acceso.
        </p>
      </header>

      {notice ? (
        <p
          role="status"
          className="mb-6 rounded-md border border-teal/30 bg-teal-soft px-4 py-3 text-sm text-teal-dark"
        >
          {notice}
        </p>
      ) : null}

      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-lg font-semibold">Solicitudes pendientes</h2>
        <p className="text-sm text-muted">{pending.length} pendientes</p>
      </div>

      <PendingUsersTable users={pending} onApprove={setSelectedUserId} />

      {selected ? (
        <ApproveRoleModal user={selected} onClose={closeModal} onConfirm={handleConfirm} />
      ) : null}
    </main>
  );
}

function AdminAccessGate({ session }: { session: SessionUser | null }) {
  return (
    <main className="mx-auto max-w-xl px-8 py-16">
      <section className="rounded-xl border border-line bg-surface px-8 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
          Administración
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Dashboard del Administrador</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          {session
            ? `Tu sesión tiene el rol ${roleLabel(session.role)}. Esta vista está reservada al rol Admin.`
            : "Inicia sesión con una cuenta de administrador para revisar solicitudes y asignar roles."}
        </p>
        <div className="mt-6">
          <Link href={session ? "/" : "/login"} className={buttonClass("primary")}>
            {session ? "Volver al inicio" : "Iniciar sesión"}
          </Link>
        </div>
      </section>
    </main>
  );
}

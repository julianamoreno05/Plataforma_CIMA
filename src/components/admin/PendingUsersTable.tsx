"use client";

import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/format";
import type { PlatformUser } from "@/types/auth";

interface PendingUsersTableProps {
  users: PlatformUser[];
  onApprove: (userId: string) => void;
}

export function PendingUsersTable({ users, onApprove }: PendingUsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-14 text-center">
        <p className="text-base font-semibold text-foreground">
          La bandeja de solicitudes está vacía.
        </p>
        <p className="mt-2 text-sm text-muted">
          Los registros nuevos aparecen aquí en estado Pendiente.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">Usuarios en estado Pendiente</caption>
        <thead className="bg-[#f6f8f7] text-xs uppercase tracking-wide text-muted">
          <tr>
            <th scope="col" className="px-5 py-3 font-semibold">
              Nombre
            </th>
            <th scope="col" className="px-5 py-3 font-semibold">
              Correo
            </th>
            <th scope="col" className="px-5 py-3 font-semibold">
              Registro
            </th>
            <th scope="col" className="px-5 py-3 font-semibold">
              Estado
            </th>
            <th scope="col" className="px-5 py-3 font-semibold">
              Acción
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-line">
              <th scope="row" className="px-5 py-4 text-left font-semibold text-foreground">
                {user.nombre}
              </th>
              <td className="px-5 py-4">{user.email}</td>
              <td className="px-5 py-4 text-muted">{formatDateTime(user.createdAt)}</td>
              <td className="px-5 py-4">
                <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200 ring-inset">
                  Pendiente
                </span>
              </td>
              <td className="px-5 py-4">
                <Button className="px-3 py-2" onClick={() => onApprove(user.id)}>
                  Aprobar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import type { PlatformUser, Role } from "@/types/auth";
import { ROLE_OPTIONS } from "@/types/auth";

interface ApproveRoleModalProps {
  user: PlatformUser;
  onClose: () => void;
  onConfirm: (role: Role) => void;
}

export function ApproveRoleModal({ user, onClose, onConfirm }: ApproveRoleModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const selectRef = useRef<HTMLSelectElement>(null);
  const onCloseRef = useRef(onClose);
  const [role, setRole] = useState<Role | "">("");

  onCloseRef.current = onClose;

  useEffect(() => {
    selectRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!role) {
      return;
    }
    onConfirm(role);
  }

  function handleRoleChange(value: string) {
    const match = ROLE_OPTIONS.find((option) => option.value === value);
    setRole(match ? match.value : "");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#14211e]/45 px-6"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <h2 id={titleId} className="text-xl font-semibold">
              Asignar rol
            </h2>
            <p id={descriptionId} className="mt-2 text-sm leading-6 text-muted">
              Elige el rol para {user.nombre}. La cuenta pasará de Pendiente a activa.
            </p>
          </div>
          <div>
            <label htmlFor="role" className="mb-1.5 block text-sm font-semibold">
              Rol
            </label>
            <select
              ref={selectRef}
              id="role"
              name="role"
              value={role}
              onChange={(event) => handleRoleChange(event.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            >
              <option value="">Selecciona un rol</option>
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!role}>
              Aprobar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

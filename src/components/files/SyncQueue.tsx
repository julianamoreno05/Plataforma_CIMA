"use client";

import { FileRecordRow } from "@/components/files/FileRecordRow";
import { Button } from "@/components/ui/Button";
import type { QueuedFileView } from "@/types/files";

interface SyncQueueProps {
  pending: QueuedFileView[];
  syncing: boolean;
  disabled: boolean;
  onSync: () => void;
}

export function SyncQueue({ pending, syncing, disabled, onSync }: SyncQueueProps) {
  return (
    <aside className="rounded-xl border border-line bg-surface px-5 py-5">
      <h2 className="text-lg font-semibold">Cola de sincronización</h2>
      <p className="mt-1 text-sm leading-6 text-muted">
        Archivos guardados sin conexión. Sincronizar simula que vuelve la red y los marca como
        enviados.
      </p>

      {pending.length === 0 ? (
        <p className="mt-5 text-sm text-muted">No hay archivos pendientes.</p>
      ) : (
        <ul className="mt-5 space-y-2">
          {pending.map((file) => (
            <FileRecordRow key={file.id} file={file} />
          ))}
        </ul>
      )}

      <Button
        className="mt-5 w-full"
        onClick={onSync}
        disabled={disabled || syncing || pending.length === 0}
      >
        {syncing ? "Sincronizando…" : "Sincronizar"}
      </Button>
    </aside>
  );
}

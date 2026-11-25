"use client";

import { useCallback, useEffect, useState } from "react";
import { FileUploader } from "@/components/files/FileUploader";
import { SyncQueue } from "@/components/files/SyncQueue";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { getFileDb } from "@/lib/file-db";
import { toQueuedFileView, type QueuedFile, type QueuedFileView } from "@/types/files";

const MAX_FILE_BYTES = 20 * 1024 * 1024;

export function FileWorkspace() {
  const online = useOnlineStatus();
  const [received, setReceived] = useState<QueuedFileView[]>([]);
  const [pending, setPending] = useState<QueuedFileView[]>([]);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const rows = await getFileDb().files.orderBy("addedAt").reverse().toArray();
    const views = rows.flatMap((row) => {
      const view = toQueuedFileView(row);
      return view ? [view] : [];
    });
    setReceived(views.filter((file) => file.status === "synced"));
    setPending(views.filter((file) => file.status === "pending"));
  }, []);

  useEffect(() => {
    let active = true;
    void reload()
      .catch(() => {
        if (active) {
          setError("No se pudo leer la cola de archivos.");
        }
      })
      .finally(() => {
        if (active) {
          setReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, [reload]);

  async function uploadFiles(incoming: File[]) {
    const accepted: File[] = [];
    const rejected: string[] = [];
    for (const file of incoming) {
      if (file.size > MAX_FILE_BYTES) {
        rejected.push(file.name);
      } else {
        accepted.push(file);
      }
    }

    if (rejected.length > 0) {
      setError(`Supera 20 MB: ${rejected.join(", ")}.`);
    } else {
      setError(null);
    }
    if (accepted.length === 0) {
      return;
    }

    const status = online ? "synced" : "pending";
    const records: QueuedFile[] = accepted.map((file) => ({
      name: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      addedAt: new Date().toISOString(),
      status,
      data: file,
    }));

    try {
      await getFileDb().files.bulkAdd(records);
      await reload();
      setMessage(
        status === "pending"
          ? accepted.length === 1
            ? "Sin conexión. El archivo quedó pendiente de sincronizar."
            : `Sin conexión. ${accepted.length} archivos quedaron pendientes de sincronizar.`
          : accepted.length === 1
            ? "Archivo recibido. No se puede editar."
            : `${accepted.length} archivos recibidos. No se pueden editar.`,
      );
    } catch {
      setError("No se pudo guardar el archivo.");
    }
  }

  async function syncPending() {
    if (pending.length === 0 || syncing) {
      return;
    }
    const count = pending.length;
    setSyncing(true);
    setError(null);
    try {
      await getFileDb().files.where("status").equals("pending").modify({ status: "synced" });
      await reload();
      setMessage(count === 1 ? "Se sincronizó 1 archivo." : `Se sincronizaron ${count} archivos.`);
    } catch {
      setError("No se pudo sincronizar la cola.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto grid max-w-6xl items-start gap-6 px-8 py-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Repositorio</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Archivos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            La subida no abre el archivo para edición. Si el navegador está sin conexión, el
            archivo espera en la cola local.
          </p>
          {message ? (
            <p className="mt-4 rounded-md bg-teal-soft px-3 py-2 text-sm font-semibold text-teal-dark" role="status">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-6">
            <FileUploader
              online={online}
              received={received}
              disabled={!ready || syncing}
              onUpload={(files) => void uploadFiles(files)}
            />
          </div>
        </div>
        <SyncQueue
          pending={pending}
          syncing={syncing}
          disabled={!ready}
          onSync={() => void syncPending()}
        />
      </div>
    </div>
  );
}

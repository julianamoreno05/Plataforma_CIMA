"use client";

import { useState, type DragEvent } from "react";
import { FileRecordRow } from "@/components/files/FileRecordRow";
import type { QueuedFileView } from "@/types/files";

interface FileUploaderProps {
  online: boolean;
  received: QueuedFileView[];
  disabled: boolean;
  onUpload: (files: File[]) => void;
}

export function FileUploader({ online, received, disabled, onUpload }: FileUploaderProps) {
  const [dragDepth, setDragDepth] = useState(0);
  const dragging = dragDepth > 0;

  function takeFiles(list: FileList | null) {
    if (!list || list.length === 0 || disabled) {
      return;
    }
    onUpload(Array.from(list));
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
  }

  function handleDragEnter(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragDepth((depth) => depth + 1);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragDepth((depth) => Math.max(0, depth - 1));
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragDepth(0);
    takeFiles(event.dataTransfer.files);
  }

  return (
    <section className="rounded-xl border border-line bg-surface px-6 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Subir archivos</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Arrastra y suelta. El archivo queda en solo lectura y no se puede editar.
          </p>
        </div>
        {online ? (
          <span className="inline-flex shrink-0 rounded-full bg-teal-soft px-2.5 py-1 text-xs font-semibold text-teal-dark">
            En línea
          </span>
        ) : (
          <span className="inline-flex shrink-0 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
            Offline
          </span>
        )}
      </div>

      <label
        data-file-dropzone=""
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mt-5 flex cursor-pointer flex-col items-center rounded-lg border border-dashed px-6 py-10 text-center ${
          dragging ? "border-teal bg-teal-soft" : "border-line bg-background"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <input
          type="file"
          multiple
          disabled={disabled}
          className="sr-only"
          onChange={(event) => {
            takeFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <span className="text-sm font-semibold">Arrastra archivos aquí o haz clic para seleccionarlos</span>
        <span className="mt-2 max-w-md text-xs leading-5 text-muted">
          {online
            ? "Con conexión, el archivo se marca como sincronizado."
            : "Sin conexión, el archivo entra a la cola con estado pendiente."}
        </span>
      </label>

      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Recibidos</h3>
        {received.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Todavía no hay archivos sincronizados.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {received.map((file) => (
              <FileRecordRow key={file.id} file={file} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

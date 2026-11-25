import { formatDateTime, formatFileSize } from "@/lib/format";
import type { QueuedFileView } from "@/types/files";

const statusLabel: Record<QueuedFileView["status"], string> = {
  pending: "Pendiente",
  synced: "Sincronizado",
};

export function FileRecordRow({ file }: { file: QueuedFileView }) {
  return (
    <li className="rounded-md border border-line bg-background px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 break-all text-sm font-semibold">{file.name}</p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
            file.status === "pending" ? "bg-amber-100 text-amber-900" : "bg-teal-soft text-teal-dark"
          }`}
        >
          {statusLabel[file.status]}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">
        {formatFileSize(file.size)} · {formatDateTime(file.addedAt)} · Solo lectura
      </p>
    </li>
  );
}

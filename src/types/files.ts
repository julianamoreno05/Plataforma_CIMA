export type FileSyncStatus = "pending" | "synced";

export interface QueuedFile {
  id?: number;
  name: string;
  size: number;
  mimeType: string;
  addedAt: string;
  status: FileSyncStatus;
  data: Blob;
}

export interface QueuedFileView {
  id: number;
  name: string;
  size: number;
  mimeType: string;
  addedAt: string;
  status: FileSyncStatus;
}

export function toQueuedFileView(record: QueuedFile): QueuedFileView | null {
  if (record.id === undefined) {
    return null;
  }
  return {
    id: record.id,
    name: record.name,
    size: record.size,
    mimeType: record.mimeType,
    addedAt: record.addedAt,
    status: record.status,
  };
}

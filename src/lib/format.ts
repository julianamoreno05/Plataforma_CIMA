const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }
  return dateTimeFormatter.format(date);
}

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "long",
});

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "Tamaño no disponible";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ["KB", "MB", "GB"] as const;
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const formatted = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value);
  return `${formatted} ${units[unit]}`;
}

export function formatDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) {
    return "Fecha no disponible";
  }
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return dateFormatter.format(date);
}

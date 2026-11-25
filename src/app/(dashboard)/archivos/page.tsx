import type { Metadata } from "next";
import { FileWorkspace } from "@/components/files/FileWorkspace";

export const metadata: Metadata = {
  title: "Archivos",
};

export default function ArchivosPage() {
  return <FileWorkspace />;
}

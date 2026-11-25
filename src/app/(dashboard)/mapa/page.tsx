import type { Metadata } from "next";
import { ChatAssistant } from "@/components/features/ChatAssistant";
import { MapWorkspace } from "@/components/map/MapWorkspace";

export const metadata: Metadata = {
  title: "Mapa",
};

export default function MapaPage() {
  return (
    <>
      <MapWorkspace />
      <ChatAssistant />
    </>
  );
}

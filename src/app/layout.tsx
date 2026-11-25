import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Plataforma CIMA",
    template: "%s | Plataforma CIMA",
  },
  description:
    "Maqueta de acceso institucional: registro, confirmación simulada y aprobación de roles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
        <body className="antialiased">
          <SiteHeader />
          {children}
        </body>
    </html>
  );
}

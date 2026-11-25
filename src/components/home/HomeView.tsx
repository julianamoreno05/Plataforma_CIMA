"use client";

import Link from "next/link";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { useAuthStore } from "@/store/auth-store";

const features = [
  {
    title: "Pregunta con tus palabras",
    body: "El asistente responde citando sus fuentes y te dice qué tan seguro es.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 5h16v11H9l-5 4V5z" />
      </svg>
    ),
  },
  {
    title: "Un mapa simple",
    body: "Pocas capas, leyenda clara y comparación entre dos fechas.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
        <path d="M9 4v14" />
        <path d="M15 6v14" />
      </svg>
    ),
  },
  {
    title: "Explicaciones sencillas",
    body: "Los índices y las alertas se traducen al lenguaje de todos los días.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 4h11l3 3v13H5V4z" />
        <path d="M9 10h6M9 14h6" />
      </svg>
    ),
  },
  {
    title: "Funciona sin conexión",
    body: "Guarda mapas y respuestas y sincroniza cuando vuelva la señal.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 12a8 8 0 1 1-2.3-5.6" />
        <path d="M20 4v5h-5" />
      </svg>
    ),
  },
];

export function HomeView() {
  const hydrated = useAuthHydrated();
  const session = useAuthStore((state) => state.session);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Hero */}
      <section className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-12 px-8 py-14">
        <div className="min-w-0 flex-1 basis-[440px]">
          <p className="text-xs font-bold uppercase tracking-[2px] text-teal">
            PLATAFORMA CIMA
          </p>
          <h1 className="mt-2.5 text-[46px] font-bold leading-[1.1]">
            Entiende tu territorio con información clara
          </h1>
          <p className="mt-4 max-w-[520px] text-[19px] leading-[1.5] text-muted">
            Consulta mapas, alertas y biodiversidad del Magdalena Caldense en
            lenguaje sencillo, y sigue trabajando aunque no tengas internet.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/mapa"
              className="flex min-h-[48px] items-center rounded-[10px] bg-teal px-6 text-[17px] font-bold text-white no-underline hover:bg-teal-dark"
            >
              Abrir el mapa
            </Link>
            {hydrated && !session ? (
              <Link
                href="/login"
                className="box-border flex min-h-[48px] items-center rounded-[10px] border-2 border-teal bg-white px-6 text-[17px] font-bold text-teal no-underline hover:bg-teal-soft"
              >
                Ingresar
              </Link>
            ) : null}
          </div>
        </div>

        {/* Map preview */}
        <div className="relative min-w-0 flex-1 basis-[440px] overflow-hidden rounded-[20px] border border-line bg-[#F2F3F0]" style={{ height: 380 }}>
          <svg
            viewBox="0 0 900 700"
            preserveAspectRatio="xMidYMid slice"
            width="100%"
            height="100%"
            role="img"
            aria-label="Vista previa del mapa de Samaná con capas y alertas"
            className="absolute inset-0 block"
          >
            <rect width="900" height="700" fill="#F2F3F0" />
            <path d="M0 120 C120 90 200 140 320 110 C460 75 600 120 720 90 L900 70 L900 0 L0 0Z" fill="#E9ECE8" />
            <path d="M0 640 C150 600 300 670 450 640 C600 610 750 660 900 620 L900 700 L0 700Z" fill="#E9ECE8" />
            <path d="M610 0 C600 120 650 200 620 320 C600 420 640 520 600 700" fill="none" stroke="#C9D3DA" strokeWidth="6" />
            <polygon points="40,230 430,90 740,80 900,300 800,470 640,520 330,590 140,440" fill="#2F7D4B" fillOpacity="0.42" stroke="#2F7D4B" strokeWidth="2" />
            <polygon points="300,250 560,210 700,310 520,400 290,330" fill="#0F766E" fillOpacity="0.5" stroke="#0F766E" strokeWidth="2" />
            <text x="420" y="500" fontSize="22" fontWeight="600" fill="#1F2933" fontFamily="'Source Sans 3', sans-serif">Samaná</text>
            <circle cx="235" cy="310" r="12" fill="#D97706" stroke="#FFFFFF" strokeWidth="3" />
            <circle cx="470" cy="470" r="12" fill="#D97706" stroke="#FFFFFF" strokeWidth="3" />
          </svg>
          <div className="absolute right-4 bottom-4 left-4 rounded-xl border border-line border-l-4 border-l-[#D97706] bg-white px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[1px] text-[#B45309]">
              ATENCIÓN · REVISAR
            </p>
            <p className="mt-0.5 text-base font-bold">
              Se ve menos bosque en dos zonas
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-b border-line bg-white">
        <div className="mx-auto max-w-[1200px] px-8 py-12">
          <h2 className="mb-6 text-[28px] font-semibold">Qué puedes hacer</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
            {features.map((f) => (
              <div key={f.title} className="rounded-[14px] border border-line p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-teal-soft">
                  {f.icon}
                </div>
                <h3 className="mt-3.5 text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 text-[15px] leading-[1.45] text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 px-8 py-6 text-sm text-muted">
        <div>Plataforma CIMA · Universidad de Caldas y organizaciones comunitarias del Magdalena Caldense</div>
        <div className="flex gap-4">
          <Link href="/login" className="font-semibold text-teal">Ingresar</Link>
        </div>
      </footer>
    </div>
  );
}

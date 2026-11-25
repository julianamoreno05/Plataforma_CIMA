import type { ReactNode } from "react";

interface AuthFrameProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthFrame({ title, description, children }: AuthFrameProps) {
  return (
    <main className="mx-auto flex w-full max-w-5xl items-center px-8 py-12">
      <section className="grid w-full overflow-hidden rounded-xl border border-line bg-surface shadow-[0_12px_40px_rgba(20,33,30,0.06)] min-[960px]:grid-cols-[17.5rem_1fr]">
        <aside className="bg-teal px-8 py-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
            Plataforma CIMA
          </p>
          <h1 className="mt-4 text-[1.75rem] font-semibold leading-tight">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-white/85">{description}</p>
        </aside>
        <div className="px-8 py-10 min-[960px]:px-10">{children}</div>
      </section>
    </main>
  );
}

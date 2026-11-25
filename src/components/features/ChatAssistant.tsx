"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { loadHistorialLocal, saveHistorial } from "@/lib/historial-db";
import { historialSimulado } from "@/mocks/chat";
import { useAssistantPanel } from "@/store/assistant-panel";
import type { HistorialChat, IncertidumbreChat, MensajeChat } from "@/types";

const TRANSCRIPCION_SIMULADA = "¿Qué indica el índice de cobertura en el bosque?";
const ABSTENCION_TECNICA = "No hay datos para responder esta pregunta. Me abstengo.";
const ABSTENCION_COTIDIANA = "No tengo datos para responder esa pregunta. Prefiero no inventar una respuesta.";

const uncertaintyClass: Record<IncertidumbreChat, string> = {
  Baja: "bg-teal-soft text-teal-dark",
  Media: "bg-amber-100 text-amber-900",
  Alta: "bg-red-50 text-red-800",
};

export function ChatAssistant() {
  const open = useAssistantPanel((state) => state.open);
  const closePanel = useAssistantPanel((state) => state.closePanel);
  const [modoTecnico, setModoTecnico] = useState(false);
  const [mensajes, setMensajes] = useState<MensajeChat[]>(historialSimulado.mensajes);
  const [guardadoLocal, setGuardadoLocal] = useState(false);
  const [draft, setDraft] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  const [contactoAbierto, setContactoAbierto] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [speakerSupported, setSpeakerSupported] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const hydrated = useRef(false);
  const micTimer = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    loadHistorialLocal()
      .then((historial) => {
        if (!active) {
          return;
        }
        hydrated.current = true;
        setMensajes(historial.mensajes);
        setGuardadoLocal(true);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        hydrated.current = true;
        setGuardadoLocal(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated.current) {
      return;
    }
    const historial: HistorialChat = { id: historialSimulado.id, mensajes };
    void saveHistorial(historial)
      .then(() => setGuardadoLocal(true))
      .catch(() => setGuardadoLocal(false));
  }, [mensajes]);

  useEffect(() => {
    setSpeakerSupported("speechSynthesis" in window);
    return () => {
      if (micTimer.current !== null) {
        window.clearTimeout(micTimer.current);
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    list.scrollTop = list.scrollHeight;
  }, [mensajes, open]);

  useEffect(() => {
    if (!contactoAbierto) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setContactoAbierto(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [contactoAbierto]);

  function textoVisible(mensaje: MensajeChat): string {
    if (mensaje.rol === "user") {
      return mensaje.textoCotidiano;
    }
    return modoTecnico ? mensaje.textoTecnico : mensaje.textoCotidiano;
  }

  function speak(mensaje: MensajeChat) {
    if (!("speechSynthesis" in window)) {
      return;
    }
    if (speakingId === mensaje.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textoVisible(mensaje));
    utterance.lang = "es-CO";
    const voice = window.speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith("es"));
    if (voice) {
      utterance.voice = voice;
    }
    utterance.onend = () => setSpeakingId(null);
    setSpeakingId(mensaje.id);
    window.speechSynthesis.speak(utterance);
  }

  function simularMicrofono() {
    if (escuchando) {
      return;
    }
    setEscuchando(true);
    micTimer.current = window.setTimeout(() => {
      setDraft(TRANSCRIPCION_SIMULADA);
      setEscuchando(false);
      micTimer.current = null;
    }, 700);
  }

  function enviar(texto: string) {
    const trimmed = texto.trim();
    if (!trimmed) {
      return;
    }
    const estado = navigator.onLine ? "synced" : "pending";
    const pregunta: MensajeChat = {
      id: crypto.randomUUID(),
      rol: "user",
      textoTecnico: trimmed,
      textoCotidiano: trimmed,
      fuentes: [],
      incertidumbre: "Baja",
      estadoSincronizacion: estado,
    };
    const respuesta: MensajeChat = {
      id: crypto.randomUUID(),
      rol: "assistant",
      textoTecnico: ABSTENCION_TECNICA,
      textoCotidiano: ABSTENCION_COTIDIANA,
      fuentes: [],
      incertidumbre: "Alta",
      estadoSincronizacion: estado,
    };
    setDraft("");
    setMensajes((current) => [...current, pregunta, respuesta]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    enviar(draft);
  }

  return (
    <aside
      inert={!open}
      aria-hidden={!open}
      id="asistente-c1"
      aria-label="Asistente conversacional"
      className={`fixed top-16 right-0 z-40 flex h-[calc(100vh-4rem)] w-96 flex-col border-l border-line bg-surface shadow-xl transition-transform duration-300 ${
        open ? "translate-x-0" : "pointer-events-none translate-x-full"
      }`}
    >
      <header className="border-b border-line px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">C1 · C3</p>
            <h2 className="text-lg font-semibold">Asistente</h2>
          </div>
          <button
            type="button"
            onClick={closePanel}
            aria-label="Cerrar asistente"
            className="rounded-md px-2 py-1 text-lg leading-none text-muted hover:bg-background hover:text-foreground"
          >
            ×
          </button>
        </div>
        <p className="mt-4 text-sm font-semibold" id="modo-lenguaje">
          Modo: Lenguaje Cotidiano / Lenguaje Técnico
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={modoTecnico}
          aria-labelledby="modo-lenguaje"
          onClick={() => setModoTecnico((value) => !value)}
          className="mt-2 grid h-14 w-full grid-cols-2 rounded-full bg-background p-1 text-sm font-semibold"
        >
          <span
            className={`flex items-center justify-center rounded-full ${
              modoTecnico ? "text-muted" : "bg-teal text-white"
            }`}
          >
            Lenguaje Cotidiano
          </span>
          <span
            className={`flex items-center justify-center rounded-full ${
              modoTecnico ? "bg-teal text-white" : "text-muted"
            }`}
          >
            Lenguaje Técnico
          </span>
        </button>
        {guardadoLocal ? (
          <p className="mt-3 text-xs font-semibold text-teal">Historial guardado localmente</p>
        ) : null}
      </header>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {mensajes.map((mensaje) => (
          <article
            key={mensaje.id}
            className={`rounded-lg px-3 py-3 text-sm leading-6 ${
              mensaje.rol === "user" ? "ml-6 bg-teal-soft" : "mr-2 border border-line bg-background"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p>{textoVisible(mensaje)}</p>
              <button
                type="button"
                onClick={() => speak(mensaje)}
                disabled={!speakerSupported}
                aria-pressed={speakingId === mensaje.id}
                aria-label={speakingId === mensaje.id ? "Detener lectura" : "Leer mensaje"}
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line ${
                  speakingId === mensaje.id ? "bg-teal text-white" : "bg-surface text-foreground hover:bg-background"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <SpeakerIcon />
              </button>
            </div>
            {mensaje.rol === "assistant" ? (
              <p className="mt-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${uncertaintyClass[mensaje.incertidumbre]}`}
                >
                  Incertidumbre {mensaje.incertidumbre}
                </span>
              </p>
            ) : null}
            {mensaje.rol === "assistant" && mensaje.fuentes.length > 0 ? (
              <ul className="mt-2 list-disc pl-4 text-xs text-muted">
                {mensaje.fuentes.map((fuente) => (
                  <li key={fuente}>{fuente}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="relative space-y-3 border-t border-line px-4 py-4">
        <label htmlFor="chat-c1-draft" className="sr-only">
          Mensaje
        </label>
        <textarea
          id="chat-c1-draft"
          value={draft}
          rows={3}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              enviar(draft);
            }
          }}
          placeholder="Escribe tu pregunta"
          className="w-full resize-none rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={simularMicrofono}
            aria-pressed={escuchando}
            title="Dictar en español"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-md border border-line ${
              escuchando ? "bg-teal text-white" : "bg-surface text-foreground hover:bg-background"
            }`}
          >
            <span className="sr-only">{escuchando ? "Escuchando" : "Activar micrófono"}</span>
            <MicIcon />
          </button>
          <Button type="submit" className="flex-1" disabled={draft.trim().length === 0}>
            Enviar
          </Button>
        </div>
        {escuchando ? <p className="text-xs text-teal">Escuchando…</p> : null}
        <Button variant="secondary" className="w-full" onClick={() => setContactoAbierto(true)}>
          Contactar a un experto
        </Button>
        {contactoAbierto ? (
          <div className="absolute inset-x-4 bottom-4 z-10 rounded-lg border border-line bg-surface p-4 shadow-lg" role="dialog" aria-modal="true" aria-labelledby="contacto-experto-titulo">
            <h3 id="contacto-experto-titulo" className="text-base font-semibold">
              Contactar a un experto
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">Un asesor humano se comunicará contigo.</p>
            <Button className="mt-4 w-full" onClick={() => setContactoAbierto(false)}>
              Entendido
            </Button>
          </div>
        ) : null}
      </form>
    </aside>
  );
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 10h3l5-4v12l-5-4H4v-4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 9a4 4 0 0 1 0 6M18.5 7a7 7 0 0 1 0 10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { useSpeechInput, useSpeechOutput } from "@/hooks/use-speech";
import { getChatDb } from "@/lib/chat-db";
import { formatDateTime } from "@/lib/format";
import { consultarAsistente } from "@/services/ragService";
import type { ChatMessageRecord, Incertidumbre } from "@/types/chat";

const TRANSFER_MESSAGE = "Un asesor se contactará contigo";

const uncertaintyClass: Record<Incertidumbre, string> = {
  Baja: "bg-teal-soft text-teal-dark",
  Media: "bg-amber-50 text-amber-900",
  Alta: "bg-red-50 text-red-800",
};

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { listening, supported: micSupported, error: micError, toggleListening } = useSpeechInput(setDraft);
  const { speakingId, supported: speakerSupported, speak } = useSpeechOutput();

  useEffect(() => {
    let active = true;
    getChatDb()
      .messages.toArray()
      .then((rows) => {
        if (active) {
          setMessages(rows);
        }
      })
      .catch(() => {
        if (active) {
          setStorageError("No se pudo leer el historial.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    list.scrollTop = list.scrollHeight;
  }, [messages, pending, open]);

  async function persist(message: Omit<ChatMessageRecord, "id">) {
    const id = await getChatDb().messages.add(message);
    const stored = { ...message, id };
    setMessages((current) => [...current, stored]);
    return stored;
  }

  async function sendMessage(texto: string) {
    const trimmed = texto.trim();
    if (!trimmed || pending) {
      return;
    }

    setDraft("");
    setPending(true);
    setStorageError(null);

    try {
      await persist({
        role: "user",
        texto: trimmed,
        fuentes: [],
        incertidumbre: null,
        createdAt: new Date().toISOString(),
      });
      const response = await consultarAsistente(trimmed);
      await persist({
        role: "assistant",
        texto: response.texto,
        fuentes: response.fuentes,
        incertidumbre: response.incertidumbre,
        createdAt: new Date().toISOString(),
      });
    } catch {
      setStorageError("No se pudo guardar la conversación.");
    } finally {
      setPending(false);
    }
  }

  async function transferToExpert() {
    if (pending) {
      return;
    }
    setStorageError(null);
    try {
      await persist({
        role: "notice",
        texto: TRANSFER_MESSAGE,
        fuentes: [],
        incertidumbre: null,
        createdAt: new Date().toISOString(),
      });
    } catch {
      setStorageError("No se pudo registrar la transferencia.");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

  if (!open) {
    return (
      <div className="flex h-full w-14 shrink-0 items-start justify-center border-l border-line bg-surface pt-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-label="Abrir asistente"
          className="flex h-28 w-10 items-center justify-center rounded-md bg-teal text-xs font-semibold tracking-wide text-white [writing-mode:vertical-rl]"
        >
          Asistente
        </button>
      </div>
    );
  }

  return (
    <aside
      className="flex h-full w-96 shrink-0 flex-col border-l border-line bg-surface"
      aria-label="Asistente"
    >
      <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">CIMA</p>
          <h2 className="text-lg font-semibold">Asistente</h2>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cerrar asistente"
          className="rounded-md px-2 py-1 text-lg leading-none text-muted hover:bg-background hover:text-foreground"
        >
          ×
        </button>
      </header>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="text-sm leading-6 text-muted">
            Pregunta por las capas, sus fuentes o sus fechas. Si no hay datos, la respuesta es una
            abstención.
          </p>
        ) : null}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            speaking={speakingId === message.id}
            speakerSupported={speakerSupported}
            onSpeak={() => {
              if (message.id !== undefined) {
                speak(message.id, message.texto);
              }
            }}
          />
        ))}
        {pending ? <p className="text-sm text-muted">Consultando datos…</p> : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 border-t border-line px-4 py-4">
        <label htmlFor="chat-draft" className="sr-only">
          Mensaje
        </label>
        <textarea
          id="chat-draft"
          value={draft}
          rows={3}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void sendMessage(draft);
            }
          }}
          placeholder="Escribe tu pregunta"
          className="w-full resize-none rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleListening}
            aria-pressed={listening}
            disabled={!micSupported}
            title={micSupported ? "Dictar en español" : "Reconocimiento de voz no disponible"}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-md border border-line ${
              listening ? "bg-teal text-white" : "bg-surface text-foreground hover:bg-background"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <span className="sr-only">{listening ? "Detener micrófono" : "Activar micrófono"}</span>
            <MicIcon />
          </button>
          <Button type="submit" className="flex-1" disabled={pending || draft.trim().length === 0}>
            Enviar
          </Button>
        </div>
        {listening ? <p className="text-xs text-teal">Escuchando…</p> : null}
        {micError ? <p className="text-xs text-red-700">{micError}</p> : null}
        {storageError ? <p className="text-xs text-red-700">{storageError}</p> : null}
        <Button variant="secondary" className="w-full" onClick={() => void transferToExpert()} disabled={pending}>
          Hablar con un experto
        </Button>
      </form>
    </aside>
  );
}

function MessageBubble({
  message,
  speaking,
  speakerSupported,
  onSpeak,
}: {
  message: ChatMessageRecord;
  speaking: boolean;
  speakerSupported: boolean;
  onSpeak: () => void;
}) {
  const isUser = message.role === "user";
  const isNotice = message.role === "notice";

  return (
    <article
      className={`rounded-lg px-3 py-3 text-sm leading-6 ${
        isUser
          ? "ml-6 bg-teal-soft text-foreground"
          : isNotice
            ? "border border-teal/30 bg-teal-soft"
            : "mr-4 border border-line bg-background"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="whitespace-pre-wrap">{message.texto}</p>
        {message.role === "assistant" ? (
          <button
            type="button"
            onClick={onSpeak}
            disabled={!speakerSupported}
            aria-pressed={speaking}
            aria-label={speaking ? "Detener lectura" : "Leer respuesta"}
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line ${
              speaking ? "bg-teal text-white" : "bg-surface text-foreground hover:bg-background"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <SpeakerIcon />
          </button>
        ) : null}
      </div>
      {message.role === "assistant" && message.incertidumbre ? (
        <p className="mt-2">
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${uncertaintyClass[message.incertidumbre]}`}
          >
            Incertidumbre {message.incertidumbre}
          </span>
        </p>
      ) : null}
      {message.role === "assistant" && message.fuentes.length > 0 ? (
        <div className="mt-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Fuentes</p>
          <ul className="mt-1 list-disc pl-4 text-xs text-muted">
            {message.fuentes.map((fuente) => (
              <li key={fuente}>{fuente}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="mt-2 text-xs text-muted">{formatDateTime(message.createdAt)}</p>
    </article>
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

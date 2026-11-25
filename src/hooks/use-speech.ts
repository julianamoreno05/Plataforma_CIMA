"use client";

import { useEffect, useRef, useState } from "react";

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface BrowserSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): BrowserSpeechRecognition;
}

function getRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }
  const host = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null;
}

function readTranscript(event: SpeechRecognitionEventLike): string {
  let transcript = "";
  for (let index = 0; index < event.results.length; index += 1) {
    transcript += event.results[index]?.[0]?.transcript ?? "";
  }
  return transcript.trim();
}

export function useSpeechInput(onTranscript: (transcript: string) => void) {
  const onTranscriptRef = useRef(onTranscript);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);

  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    setSupported(getRecognitionConstructor() !== null);
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        recognitionRef.current = null;
      }
    };
  }, []);

  function toggleListening() {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) {
      setError("Este navegador no ofrece reconocimiento de voz.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "es-CO";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      onTranscriptRef.current(readTranscript(event));
    };
    recognition.onerror = (event) => {
      setListening(false);
      setError(
        event.error === "not-allowed"
          ? "El navegador no autorizó el micrófono."
          : "No se pudo transcribir la voz.",
      );
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setError(null);
    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
      setError("No se pudo iniciar el micrófono.");
    }
  }

  return { listening, supported, error, toggleListening };
}

export function useSpeechOutput() {
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported("speechSynthesis" in window);
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function speak(id: number, texto: string) {
    if (!("speechSynthesis" in window)) {
      return;
    }
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "es-CO";
    const voice = window.speechSynthesis
      .getVoices()
      .find((item) => item.lang.toLowerCase().startsWith("es"));
    if (voice) {
      utterance.voice = voice;
    }
    utterance.onend = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  }

  return { speakingId, supported, speak };
}

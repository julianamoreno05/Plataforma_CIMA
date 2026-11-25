import { capasSamana } from "@/data/capas-samana";
import { MAP_LAYERS } from "@/data/map-layers";
import { formatDate } from "@/lib/format";
import type { RagResponse } from "@/types/chat";

/**
 * Sustituto de la llamada a Ollama/LangChain.
 * Recupera solo documentos cargados en la maqueta. Si no hay coincidencia, se abstiene.
 */

interface KnowledgeDoc {
  texto: string;
  fuente: string;
  terminos: string[];
}

const ABSTENCION: RagResponse = {
  texto: "No hay datos para responder esta pregunta. Me abstengo.",
  fuentes: [],
  incertidumbre: "Alta",
};

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function nombresDeCapa(capa: string): string[] {
  return capasSamana.features.flatMap((feature) => {
    const properties = feature.properties;
    if (!properties || properties.capa !== capa) {
      return [];
    }
    return typeof properties.nombre === "string" ? [properties.nombre] : [];
  });
}

function buildDocuments(): KnowledgeDoc[] {
  const capas = MAP_LAYERS.map((layer) => {
    const nombres = nombresDeCapa(layer.id);
    const elementos =
      nombres.length > 0 ? ` Elementos registrados: ${nombres.join(", ")}.` : "";
    return {
      texto: `La capa ${layer.label} tiene como fuente «${layer.fuente}» y fecha ${formatDate(layer.fecha)}.${elementos}`,
      fuente: layer.fuente,
      terminos: [layer.label, layer.id, ...nombres, "fuente", "fecha", layer.fuente],
    };
  });

  return [
    ...capas,
    {
      texto:
        "El visor muestra capas simuladas de Samaná, Caldas. Cada capa se enciende o se apaga con su interruptor.",
      fuente: "Visor de capas · Plataforma CIMA",
      terminos: ["samana", "caldas", "visor", "capa", "capas", "interruptor", "mapa"],
    },
    {
      texto:
        "El registro queda en estado Pendiente. Un administrador asigna uno de estos roles: Líder, Investigador o Admin.",
      fuente: "Flujo de acceso de la maqueta",
      terminos: ["registro", "pendiente", "rol", "roles", "lider", "investigador", "administrador", "admin"],
    },
    {
      texto:
        "El asistente responde solo con los datos cargados del visor: capas, fuentes, fechas y elementos de Samaná, Caldas. Si la pregunta no está en esos datos, se abstiene.",
      fuente: "Alcance del asistente · Plataforma CIMA",
      terminos: ["ayuda", "asistente", "que puedes", "como funciona", "alcance"],
    },
  ];
}

const DOCUMENTS = buildDocuments();

function scoreDocument(question: string, document: KnowledgeDoc): number {
  return document.terminos.reduce((total, term) => {
    const normalized = normalize(term);
    if (normalized.length < 4) {
      return total;
    }
    return question.includes(normalized) ? total + 2 : total;
  }, 0);
}

function consultarCorpus(pregunta: string): RagResponse {
  const question = normalize(pregunta.trim());
  if (!question) {
    return ABSTENCION;
  }

  const ranked = DOCUMENTS.map((document) => ({
    document,
    score: scoreDocument(question, document),
  })).filter((item) => item.score > 0);

  if (ranked.length === 0) {
    return ABSTENCION;
  }

  const maxScore = Math.max(...ranked.map((item) => item.score));
  const selected = ranked.filter((item) => item.score === maxScore);
  const fuentes = [...new Set(selected.map((item) => item.document.fuente))];
  const incertidumbre = maxScore >= 4 || selected.length === 1 ? "Baja" : "Media";

  return {
    texto: selected.map((item) => item.document.texto).join("\n\n"),
    fuentes,
    incertidumbre,
  };
}

export async function consultarAsistente(pregunta: string): Promise<RagResponse> {
  await new Promise((resolve) => {
    setTimeout(resolve, 450);
  });
  return consultarCorpus(pregunta);
}

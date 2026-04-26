export type BackendDominio =
  | "licencias"
  | "estatuto"
  | "general"
  | "coberturas";

export type BackendArticuloLicencia = {
  capitulo?: string;
  titulo_capitulo?: string;
  articulo?: number | string;
  titulo_articulo?: string;
  texto?: string;
  resumen?: string | null;
  fuente?: string;
  [key: string]: any;
};

export type BackendBusquedaItem = {
  filename?: string;
  score?: number;
  text?: string;
};

export type BackendRespuestaLicencias = {
  ok: boolean;
  tipo: string;
  dominio: BackendDominio | string;
  origen: string;
  consulta: string;
  consultaNormalizada?: string;
  respuesta: string;
  articulos: BackendArticuloLicencia[];
  referencias?: string[];
  busqueda?: BackendBusquedaItem[];
  conversationId?: string | null;
  error?: string;
};

export type N8nArticuloLicencia = BackendArticuloLicencia;
export type N8nRespuestaLicencias = BackendRespuestaLicencias;

export type ChatbotDetalleUi = {
  mensajePrincipal: string;
  articuloPrincipal: BackendArticuloLicencia | null;
  articulosSecundarios: BackendArticuloLicencia[];
  fuentes: string[];
  busqueda: BackendBusquedaItem[];
};

const CHATBOT_BACKEND_BASE_URL =
  process.env.EXPO_PUBLIC_CHATBOT_BACKEND_URL ??
  "https://sidca-chatbot-backend-994896485736.us-central1.run.app";

const CHATBOT_API_URL =
  process.env.EXPO_PUBLIC_CHATBOT_API_URL ??
  `${CHATBOT_BACKEND_BASE_URL.replace(/\/$/, "")}/api/chatbot/query`;

const DEFAULT_MAX_RESULTS = 5;
const REQUEST_TIMEOUT_MS = 30000;

function limpiarTexto(texto?: string | null): string {
  return (texto || "").replace(/\s+/g, " ").trim();
}

function dedupeStrings(items: string[] = []): string[] {
  return [...new Set(items.map((i) => limpiarTexto(i)).filter(Boolean))];
}

function normalizarArticuloKey(art: BackendArticuloLicencia): string {
  const articulo = limpiarTexto(String(art?.articulo ?? ""));
  const titulo = limpiarTexto(art?.titulo_articulo);
  const texto = limpiarTexto(art?.texto).slice(0, 120);

  return `${articulo}::${titulo}::${texto}`;
}

function dedupeArticulos(
  articulos: BackendArticuloLicencia[] = []
): BackendArticuloLicencia[] {
  const seen = new Set<string>();
  const out: BackendArticuloLicencia[] = [];

  for (const art of articulos) {
    const key = normalizarArticuloKey(art);

    if (!key || seen.has(key)) continue;

    seen.add(key);
    out.push(art);
  }

  return out;
}

function normalizarDominio(dominio?: string): BackendDominio {
  if (
    dominio === "licencias" ||
    dominio === "estatuto" ||
    dominio === "general" ||
    dominio === "coberturas"
  ) {
    return dominio;
  }

  return "licencias";
}

async function fetchConTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function respuestaErrorBackend(params: {
  pregunta: string;
  dominio: BackendDominio;
  respuesta?: string;
  error?: string;
  articulos?: BackendArticuloLicencia[];
  referencias?: string[];
  busqueda?: BackendBusquedaItem[];
  status?: number;
}): BackendRespuestaLicencias {
  return {
    ok: false,
    tipo: "error",
    dominio: params.dominio,
    origen: "cloud_run",
    consulta: params.pregunta,
    consultaNormalizada: params.pregunta,
    respuesta:
      params.respuesta ||
      "No pude consultar la IA en este momento. Voy a usar la búsqueda local.",
    articulos: Array.isArray(params.articulos) ? params.articulos : [],
    referencias: Array.isArray(params.referencias) ? params.referencias : [],
    busqueda: Array.isArray(params.busqueda) ? params.busqueda : [],
    conversationId: null,
    error:
      params.error ||
      (params.status ? `Error HTTP ${params.status}` : "Error desconocido"),
  };
}

function normalizarRespuestaBackend(
  data: any,
  pregunta: string,
  dominio: BackendDominio
): BackendRespuestaLicencias {
  return {
    ok: Boolean(data?.ok),
    tipo: data?.tipo || "respuesta_ia",
    dominio: normalizarDominio(data?.dominio || dominio),
    origen: data?.origen || "cloud_run",
    consulta: data?.consulta || pregunta,
    consultaNormalizada: data?.consultaNormalizada || pregunta,
    respuesta:
      data?.respuesta ||
      "No encontré una respuesta suficientemente clara en la documentación.",
    articulos: Array.isArray(data?.articulos) ? data.articulos : [],
    referencias: Array.isArray(data?.referencias) ? data.referencias : [],
    busqueda: Array.isArray(data?.busqueda) ? data.busqueda : [],
    conversationId: data?.conversationId || null,
    error: data?.error,
  };
}

export async function consultarLicenciasEnBackend(
  pregunta: string,
  dominio: BackendDominio = "licencias",
  maxResults: number = DEFAULT_MAX_RESULTS
): Promise<BackendRespuestaLicencias> {
  const dominioSeguro = normalizarDominio(dominio);
  const preguntaLimpia = limpiarTexto(pregunta);

  console.log("[Chatbot] Consultando backend IA Groq/RAG...");
  console.log("[Chatbot] CHATBOT_API_URL:", CHATBOT_API_URL);

  if (!preguntaLimpia) {
    return respuestaErrorBackend({
      pregunta,
      dominio: dominioSeguro,
      respuesta: "Escribí una consulta para poder ayudarte.",
      error: "Pregunta vacía",
    });
  }

  try {
    const resp = await fetchConTimeout(CHATBOT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pregunta: preguntaLimpia,
        dominio: dominioSeguro,
        maxResults,
      }),
    });

    const text = await resp.text();

    console.log("[Chatbot] Status backend IA:", resp.status);
    console.log("[Chatbot] Body backend IA:", text);

    let data: any = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    if (!resp.ok) {
      return respuestaErrorBackend({
        pregunta: preguntaLimpia,
        dominio: dominioSeguro,
        respuesta:
          data?.respuesta ||
          "No pude consultar la IA en este momento. Voy a usar la búsqueda local.",
        error: data?.error || `Error HTTP ${resp.status}`,
        articulos: Array.isArray(data?.articulos) ? data.articulos : [],
        referencias: Array.isArray(data?.referencias) ? data.referencias : [],
        busqueda: Array.isArray(data?.busqueda) ? data.busqueda : [],
        status: resp.status,
      });
    }

    return normalizarRespuestaBackend(data, preguntaLimpia, dominioSeguro);
  } catch (error: any) {
    console.log("[Chatbot] Error consultando backend IA:", error);

    const esTimeout =
      error?.name === "AbortError" ||
      String(error?.message || "").toLowerCase().includes("aborted");

    return respuestaErrorBackend({
      pregunta: preguntaLimpia,
      dominio: dominioSeguro,
      respuesta: esTimeout
        ? "La consulta demoró más de lo esperado. Voy a usar la búsqueda local."
        : "No pude consultar la IA en este momento. Voy a usar la búsqueda local.",
      error: esTimeout
        ? "Tiempo de espera agotado"
        : error?.message || "Error de red",
    });
  }
}

export function construirDetalleDesdeBackend(
  r: BackendRespuestaLicencias
): ChatbotDetalleUi {
  const articulos = dedupeArticulos(
    Array.isArray(r?.articulos) ? r.articulos : []
  );

  const fuentes = dedupeStrings(
    Array.isArray(r?.referencias) ? r.referencias : []
  );

  const busqueda = Array.isArray(r?.busqueda) ? r.busqueda.slice(0, 5) : [];

  return {
    mensajePrincipal: limpiarTexto(r?.respuesta),
    articuloPrincipal: articulos.length > 0 ? articulos[0] : null,
    articulosSecundarios: articulos.slice(1, 3),
    fuentes,
    busqueda,
  };
}

export function construirMensajeDesdeBackend(
  r: BackendRespuestaLicencias
): string {
  if (!r.ok) {
    return (
      r.respuesta ||
      "No encontré una coincidencia clara en la normativa consultada. Probá escribirlo de otra forma o ser más específico."
    );
  }

  const detalle = construirDetalleDesdeBackend(r);

  return (
    detalle.mensajePrincipal ||
    "No encontré una respuesta suficientemente clara en la documentación."
  );
}

export function obtenerArticuloPrincipalDesdeBackend(
  r: BackendRespuestaLicencias
): BackendArticuloLicencia | null {
  return construirDetalleDesdeBackend(r).articuloPrincipal;
}

export function obtenerArticulosSecundariosDesdeBackend(
  r: BackendRespuestaLicencias
): BackendArticuloLicencia[] {
  return construirDetalleDesdeBackend(r).articulosSecundarios;
}

export function obtenerFuentesDesdeBackend(
  r: BackendRespuestaLicencias
): string[] {
  return construirDetalleDesdeBackend(r).fuentes;
}

export function obtenerBusquedaDesdeBackend(
  r: BackendRespuestaLicencias
): BackendBusquedaItem[] {
  return construirDetalleDesdeBackend(r).busqueda;
}

export async function consultarLicenciasEnN8n(
  pregunta: string
): Promise<N8nRespuestaLicencias> {
  return consultarLicenciasEnBackend(pregunta, "licencias");
}

export function construirMensajeDesdeN8n(
  r: N8nRespuestaLicencias
): string {
  return construirMensajeDesdeBackend(r);
}
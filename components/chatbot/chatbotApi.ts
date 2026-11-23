export type BackendDominio =
  | "licencias"
  | "estatuto"
  | "general"
  | "coberturas"
  | "servicios";

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

export type BackendServiceContact = {
  area?: string;
  whatsapp?: string;
  url?: string;
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
  asesoramientoGremial?: BackendServiceContact;
  status?: number;
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
  asesoramientoGremial?: BackendServiceContact;
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

function limpiarRespuestaVisible(texto?: string | null): string {
  const lineas = String(texto || "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((linea) => {
      let limpia = linea
        .replace(/^\s*#{1,6}\s*/, "")
        .replace(/#/g, "")
        .replace(/^\s*[*]\s+/, "• ")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .trim();

      if (/^respuesta breve[:：]?$/i.test(limpia)) {
        return "";
      }

      return limpia;
    });

  return lineas
    .filter(Boolean)
    .join("\n")
    .replace(/\bpuedes\s+(consultar|revisar|presentar|ver)\b/gi, "podés $1")
    .replace(/\bdebes\s+(presentar|solicitar|consultar)\b/gi, "debés $1")
    .replace(/\bpresenta\s+(el|la|los|las)\b/gi, "presentá $1")
    .replace(/\bsolicita\s+(el|la|los|las)\b/gi, "solicitá $1")
    .replace(/\baseg[uú]rate\s+de\b/gi, "asegurate de")
    .trim();
}

function dedupeStrings(items: string[] = []): string[] {
  return [...new Set(items.map((i) => limpiarTexto(i)).filter(Boolean))];
}

function normalizarArticuloKey(art: BackendArticuloLicencia): string {
  const articulo = limpiarTexto(String(art?.articulo ?? ""));
  const titulo = limpiarTexto(art?.titulo_articulo);
  const texto = limpiarTexto(art?.texto).slice(0, 120);

  if (!articulo && !titulo && !texto) return "";

  return `${articulo}::${titulo}::${texto}`;
}

function identidadEstructuralArticulo(art: BackendArticuloLicencia): string {
  const fields = [
    art.fuente,
    art.referencia,
    art.anexo,
    art.capitulo,
    art.titulo_capitulo,
    art.seccion,
    art.punto,
    art.articulo,
    art.titulo_articulo,
  ].map((value) => limpiarTexto(String(value ?? "")).toLowerCase());

  const fallback = limpiarTexto(art.texto || art.resumen).slice(0, 120);
  return [...fields, fallback].join("|");
}

function dedupeArticulos(
  articulos: BackendArticuloLicencia[] = []
): BackendArticuloLicencia[] {
  const normalizados = articulos.filter((art) => normalizarArticuloKey(art));
  const individuales = new Set<string>();

  for (const art of normalizados) {
    const refs = String(art.articulo ?? "").match(/\d+/g) || [];
    if (refs.length === 1 && art.texto) {
      individuales.add(
        `${identidadEstructuralArticulo(art).split("|").slice(0, 7).join("|")}|${refs[0]}`
      );
    }
  }

  const seen = new Set<string>();
  const out: BackendArticuloLicencia[] = [];

  for (const art of normalizados) {
    const refs = String(art.articulo ?? "").match(/\d+/g) || [];
    const isComposite = refs.length > 1;
    const contextKey = identidadEstructuralArticulo(art)
      .split("|")
      .slice(0, 7)
      .join("|");
    const compositeCovered =
      isComposite &&
      refs.every((ref) => individuales.has(`${contextKey}|${ref}`));

    if (compositeCovered) continue;

    const key =
      refs.length === 1
        ? `${contextKey}|${refs[0]}|${limpiarTexto(art.titulo_articulo)}`
        : identidadEstructuralArticulo(art) || normalizarArticuloKey(art);
    if (seen.has(key)) continue;

    seen.add(key);
    out.push(art);
  }

  return out;
}

function extraerArticulosCitados(texto?: string | null): Set<string> {
  const normalizado = String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/°/g, " ");
  const citados = new Set<string>();
  const patron = /\b(?:articulos?|arts?)\s+([0-9]+(?:\s*(?:y|e|,)\s*[0-9]+)*)/g;

  for (const match of normalizado.matchAll(patron)) {
    for (const numero of String(match[1] || "").match(/\d+/g) || []) {
      citados.add(numero);
    }
  }

  return citados;
}

function fusionarArticulos(
  articulos: BackendArticuloLicencia[]
): BackendArticuloLicencia[] {
  const grupos = new Map<string, BackendArticuloLicencia>();

  for (const articulo of articulos) {
    const refs = String(articulo.articulo ?? "").match(/\d+/g) || [];
    const contexto = [
      articulo.fuente,
      articulo.referencia,
      articulo.anexo,
      articulo.capitulo,
      articulo.titulo_capitulo,
      articulo.seccion,
      articulo.punto,
      refs.join(","),
    ]
      .map((value) => limpiarTexto(String(value ?? "")).toLowerCase())
      .join("|");
    const actual = grupos.get(contexto);

    if (!actual) {
      grupos.set(contexto, articulo);
      continue;
    }

    const textoActual = limpiarTexto(actual.texto || actual.resumen);
    const textoNuevo = limpiarTexto(articulo.texto || articulo.resumen);
    const base = textoNuevo.length > textoActual.length ? articulo : actual;
    const complemento = base === articulo ? actual : articulo;

    grupos.set(contexto, {
      ...complemento,
      ...base,
      articulo: base.articulo || complemento.articulo,
      titulo_articulo:
        base.titulo_articulo || complemento.titulo_articulo,
      texto: textoNuevo.length > textoActual.length
        ? articulo.texto || articulo.resumen
        : actual.texto || actual.resumen,
      resumen: base.resumen || complemento.resumen,
      otorgante: base.otorgante || complemento.otorgante,
      interviniente: base.interviniente || complemento.interviniente,
    });
  }

  return Array.from(grupos.values());
}

function articulosUsadosEnRespuesta(
  respuesta: string,
  articulos: BackendArticuloLicencia[]
): BackendArticuloLicencia[] {
  const citados = extraerArticulosCitados(respuesta);
  if (!citados.size) return [];

  return articulos.filter((articulo) => {
    const refs = String(articulo.articulo ?? "").match(/\d+/g) || [];
    if (!refs.length) return false;
    return refs.length === 1
      ? citados.has(refs[0])
      : refs.every((ref) => citados.has(ref));
  });
}

function normalizarDominio(dominio?: string): BackendDominio {
  if (
    dominio === "licencias" ||
    dominio === "estatuto" ||
    dominio === "general" ||
    dominio === "coberturas" ||
    dominio === "servicios"
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
    status: params.status,
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
    asesoramientoGremial:
      data?.asesoramientoGremial && typeof data.asesoramientoGremial === "object"
        ? {
            area: data.asesoramientoGremial.area,
            whatsapp: data.asesoramientoGremial.whatsapp,
            url: data.asesoramientoGremial.url,
          }
        : undefined,
    status: typeof data?.status === "number" ? data.status : undefined,
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
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = Date.now();

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
    console.log("[Chatbot] respuesta", {
      requestId,
      status: resp.status,
      dominio: dominioSeguro,
      duracionMs: Date.now() - startedAt,
    });

    let data: any = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    if (!resp.ok) {
      const esSolicitudInvalida = resp.status === 400;
      const esRateLimit = resp.status === 429;
      const esBackendNoDisponible = [500, 502, 503, 504].includes(resp.status);

      return respuestaErrorBackend({
        pregunta: preguntaLimpia,
        dominio: dominioSeguro,
        respuesta: esSolicitudInvalida
          ? data?.respuesta || "Solicitud inválida."
          : esRateLimit
            ? "Hay muchas consultas en este momento. Esperá unos segundos e intentá nuevamente."
            : esBackendNoDisponible
                ? "No pude consultar el servicio en este momento."
                : "No se pudo procesar la consulta.",
        error: esSolicitudInvalida
          ? "invalid_request"
          : esRateLimit
            ? "rate_limit"
            : esBackendNoDisponible
              ? "backend_unavailable"
              : `http_${resp.status}`,
        articulos: Array.isArray(data?.articulos) ? data.articulos : [],
        referencias: Array.isArray(data?.referencias) ? data.referencias : [],
        busqueda: Array.isArray(data?.busqueda) ? data.busqueda : [],
        status: resp.status,
      });
    }

    return normalizarRespuestaBackend(data, preguntaLimpia, dominioSeguro);
  } catch (error: any) {
    const esTimeout =
      error?.name === "AbortError" ||
      String(error?.message || "").toLowerCase().includes("aborted");
    const errorCode = esTimeout ? "timeout" : "network_error";

    console.warn("[Chatbot] error", {
      requestId,
      dominio: dominioSeguro,
      code: errorCode,
      duracionMs: Date.now() - startedAt,
    });

    return respuestaErrorBackend({
      pregunta: preguntaLimpia,
      dominio: dominioSeguro,
      respuesta: esTimeout
        ? "La consulta demoró más de lo esperado."
        : "No pude conectar con el servicio.",
      error: errorCode,
    });
  }
}

export function construirDetalleDesdeBackend(
  r: BackendRespuestaLicencias
): ChatbotDetalleUi {
  const articulosRecuperados = dedupeArticulos(
    Array.isArray(r?.articulos) ? r.articulos : []
  );
  const articulos = fusionarArticulos(
    articulosUsadosEnRespuesta(r?.respuesta, articulosRecuperados)
  );

  const fuentes = dedupeStrings(
    Array.isArray(r?.referencias) ? r.referencias : []
  );

  const busqueda = Array.isArray(r?.busqueda) ? r.busqueda.slice(0, 5) : [];

  return {
    mensajePrincipal: limpiarRespuestaVisible(r?.respuesta),
    articuloPrincipal: articulos.length > 0 ? articulos[0] : null,
    articulosSecundarios: articulos.slice(1),
    fuentes,
    busqueda,
    asesoramientoGremial: r?.asesoramientoGremial,
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

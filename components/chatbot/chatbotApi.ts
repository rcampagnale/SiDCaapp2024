export type BackendArticuloLicencia = {
  capitulo?: string;
  titulo_capitulo?: string;
  articulo?: number | string;
  titulo_articulo?: string;
  texto?: string;
  resumen?: string | null;
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
  dominio: string;
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

const CHATBOT_API_URL =
  process.env.EXPO_PUBLIC_CHATBOT_API_URL ??
  "https://sidca-chatbot-backend-994896485736.us-central1.run.app/api/chatbot/query";

function limpiarTexto(texto?: string | null): string {
  return (texto || "").replace(/\s+/g, " ").trim();
}

function dedupeStrings(items: string[] = []): string[] {
  return [...new Set(items.map((i) => limpiarTexto(i)).filter(Boolean))];
}

function dedupeArticulos(
  articulos: BackendArticuloLicencia[] = []
): BackendArticuloLicencia[] {
  const seen = new Set<string>();
  const out: BackendArticuloLicencia[] = [];

  for (const art of articulos) {
    const key =
      String(art?.articulo ?? "") + "::" + limpiarTexto(art?.titulo_articulo);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(art);
  }

  return out;
}

export async function consultarLicenciasEnBackend(
  pregunta: string,
  dominio: "licencias" | "estatuto" | "general" = "licencias"
): Promise<BackendRespuestaLicencias> {
  console.log("[Chatbot] Consultando backend IA...");
  console.log("[Chatbot] CHATBOT_API_URL:", CHATBOT_API_URL);

  try {
    const resp = await fetch(CHATBOT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pregunta,
        dominio,
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
      return {
        ok: false,
        tipo: "error",
        dominio,
        origen: "cloud_run",
        consulta: pregunta,
        consultaNormalizada: pregunta,
        respuesta:
          data?.respuesta ||
          "No pude consultar la IA en este momento. Voy a usar la búsqueda local.",
        articulos: Array.isArray(data?.articulos) ? data.articulos : [],
        referencias: Array.isArray(data?.referencias) ? data.referencias : [],
        busqueda: Array.isArray(data?.busqueda) ? data.busqueda : [],
        conversationId: data?.conversationId || null,
        error: data?.error || `Error HTTP ${resp.status}`,
      };
    }

    return {
      ok: Boolean(data?.ok),
      tipo: data?.tipo || "respuesta_ia",
      dominio: data?.dominio || dominio,
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
  } catch (error: any) {
    console.log("[Chatbot] Error consultando backend IA:", error);

    return {
      ok: false,
      tipo: "error",
      dominio,
      origen: "cloud_run",
      consulta: pregunta,
      consultaNormalizada: pregunta,
      respuesta:
        "No pude consultar la IA en este momento. Voy a usar la búsqueda local.",
      articulos: [],
      referencias: [],
      busqueda: [],
      conversationId: null,
      error: error?.message || "Error de red",
    };
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
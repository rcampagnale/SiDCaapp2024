export type N8nArticuloLicencia = {
  capitulo: string;
  titulo_capitulo: string;
  articulo: number;
  titulo_articulo: string;
  texto: string;
  resumen: string | null;
};

export type N8nRespuestaLicencias = {
  ok: boolean;
  tipo: string;
  dominio: string;
  origen: string;
  consulta: string;
  consultaNormalizada?: string;
  respuesta: string;
  articulos: N8nArticuloLicencia[];
};

// URL del webhook de n8n en Render (path real: /webhook/sidca-test)
const N8N_WEBHOOK_URL =
  process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL ??
  "https://sidca-n8n-chatbot-1.onrender.com/webhook/sidca-test";


export async function consultarLicenciasEnN8n(
  pregunta: string
): Promise<N8nRespuestaLicencias> {
  console.log("[Chatbot] Consultando a n8n via webhook...");
  console.log("[Chatbot] N8N_WEBHOOK_URL:", N8N_WEBHOOK_URL);

  const resp = await fetch(N8N_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // 👇 si en n8n esperás el campo "consulta", usá { consulta: pregunta }
    body: JSON.stringify({ consulta: pregunta }),
  });

  console.log("[Chatbot] Status n8n:", resp.status);

  if (!resp.ok) {
    const errorText = await resp.text().catch(() => "");
    console.log("[Chatbot] Error body n8n:", errorText);
    throw new Error(`Error HTTP ${resp.status}`);
  }

  const data = (await resp.json()) as N8nRespuestaLicencias;
  console.log("[Chatbot] Respuesta de n8n:", data);
  return data;
}

/**
 * Convierte la respuesta de n8n en un texto para mostrar en el chat.
 */
export function construirMensajeDesdeN8n(r: N8nRespuestaLicencias): string {
  if (!r.ok) {
    return (
      r.respuesta ||
      "No encontré una coincidencia clara en el Régimen de Licencias. Probá escribirlo de otra forma o ser más específico."
    );
  }

  let texto = r.respuesta?.trim() || "";

  if (r.articulos && r.articulos.length > 0) {
    const lista = r.articulos
      .slice(0, 3)
      .map((a) => {
        const lineaResumen = a.resumen ? `\n  ${a.resumen}` : "";
        return `• Artículo ${a.articulo} – ${a.titulo_articulo}${lineaResumen}`;
      })
      .join("\n\n");

    texto += `\n\nArtículos relacionados:\n${lista}`;
  }

  return texto;
}

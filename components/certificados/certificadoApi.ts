const CERTIFICADOS_BACKEND_BASE_URL = (
  process.env.EXPO_PUBLIC_CHATBOT_BACKEND_URL ||
  "https://sidca-chatbot-backend-994896485736.us-central1.run.app"
).replace(/\/$/, "");

export class CertificadoApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "CertificadoApiError";
    this.status = status;
  }
}

const mensajePorEstado = (status: number, fallback: string) => {
  if (status === 404) return "El certificado todavía no fue emitido por la administración.";
  if (status === 409) return "Se encontró más de un certificado vigente. Comunicate con SiDCa.";
  return fallback;
};

async function solicitarJson<T>(ruta: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const respuesta = await fetch(`${CERTIFICADOS_BACKEND_BASE_URL}${ruta}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      throw new CertificadoApiError(
        respuesta.status,
        mensajePorEstado(
          respuesta.status,
          String(datos?.error || "No se pudo completar la consulta.")
        )
      );
    }

    return datos as T;
  } catch (error: any) {
    if (error instanceof CertificadoApiError) throw error;

    throw new CertificadoApiError(
      0,
      "No se pudo conectar con el servidor. Verificá tu conexión."
    );
  } finally {
    clearTimeout(timeout);
  }
}

const rutaCertificado = (cursoId: string, dni: string) =>
  `/api/certificados/app/cursos/${encodeURIComponent(cursoId)}/usuario/${encodeURIComponent(dni)}`;

export type CertificadoEmitidoResponse = {
  ok: boolean;
  emitido: boolean;
  validacion?: {
    registrado: boolean;
    fecha?: string;
    validadoPor?: string;
  } | null;
};

export type CertificadoArchivoResponse = {
  ok: boolean;
  emitido: boolean;
  url: string;
  filename: string;
  expiraEn: string;
};

export type CursosCertificadoDisponiblesResponse = {
  ok: boolean;
  cursoIds: string[];
};

let cursosDisponiblesCache: Set<string> | null = null;
let cursosDisponiblesPromise: Promise<Set<string>> | null = null;

async function cargarCursosConCertificado(): Promise<Set<string>> {
  const respuesta = await solicitarJson<CursosCertificadoDisponiblesResponse>(
    "/api/certificados/app/cursos-disponibles"
  );

  if (respuesta.ok !== true || !Array.isArray(respuesta.cursoIds)) {
    throw new CertificadoApiError(500, "No se pudo obtener la configuración de certificados.");
  }

  const ids = new Set(
    respuesta.cursoIds
      .map((cursoId) => String(cursoId || "").trim())
      .filter(Boolean)
  );
  cursosDisponiblesCache = ids;
  return ids;
}

export function obtenerCursosConCertificado(): Promise<Set<string>> {
  if (cursosDisponiblesCache) return Promise.resolve(cursosDisponiblesCache);
  if (cursosDisponiblesPromise) return cursosDisponiblesPromise;

  const solicitud = cargarCursosConCertificado();
  cursosDisponiblesPromise = solicitud.catch((error) => {
    cursosDisponiblesPromise = null;
    throw error;
  });
  return cursosDisponiblesPromise;
}

export function prefetchCursosConCertificado(): void {
  void obtenerCursosConCertificado().catch(() => {
    // El prefetch es oportunista: la pantalla de cursos reintentará si hace falta.
  });
}

export function consultarCertificadoEmitido(cursoId: string, dni: string) {
  return solicitarJson<CertificadoEmitidoResponse>(rutaCertificado(cursoId, dni));
}

export function obtenerPreviewCertificado(cursoId: string, dni: string) {
  return solicitarJson<CertificadoArchivoResponse>(`${rutaCertificado(cursoId, dni)}/preview`);
}

export function obtenerPdfCertificado(cursoId: string, dni: string) {
  return solicitarJson<CertificadoArchivoResponse>(`${rutaCertificado(cursoId, dni)}/pdf`);
}

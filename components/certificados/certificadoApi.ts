import * as FileSystem from "expo-file-system";

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
  if (status === 404) return "El certificado todavía no fue emitido por SiDCa.";
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
  descargaHabilitada?: boolean;
  validacion?: {
    registrado: boolean;
    registros: RegistroValidacion[];
  } | null;
};

export type CampoValidacion = {
  etiqueta: string;
  valor: string;
};

export type RegistroValidacion = {
  id: string;
  titulo: string;
  campos: CampoValidacion[];
};

export type CertificadoArchivoResponse = {
  ok: boolean;
  emitido: boolean;
  url: string;
  filename: string;
  expiraEn: string;
};

export type CertificadoQrResponse = {
  ok: boolean;
  emitido: boolean;
  qrDataUri: string;
};

export type CursosCertificadoDisponiblesResponse = {
  ok: boolean;
  cursoIds: string[];
};

export type CertificadoPrecargado = {
  previewLocalUri: string;
};

let cursosDisponiblesCache: Set<string> | null = null;
let cursosDisponiblesPromise: Promise<Set<string>> | null = null;
const certificadosPrecargados = new Map<string, CertificadoPrecargado>();
const certificadosPrecargaPromises = new Map<string, Promise<CertificadoPrecargado>>();

const claveCertificado = (cursoId: string, dni: string) =>
  `${String(cursoId || "").trim()}:${String(dni || "").replace(/\D/g, "")}`;

const hashClave = (valor: string) => {
  let hash = 2166136261;
  for (let indice = 0; indice < valor.length; indice += 1) {
    hash ^= valor.charCodeAt(indice);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

const nombrePreviewCache = (cursoId: string, dni: string) =>
  `preview-certificado-${hashClave(claveCertificado(cursoId, dni))}.pdf`;

async function verificarArchivoPreview(uri: string) {
  const info = await FileSystem.getInfoAsync(uri).catch(() => ({ exists: false }));
  return info.exists === true;
}

async function cargarCertificadoParaCache(cursoId: string, dni: string): Promise<CertificadoPrecargado> {
  const respuesta = await obtenerPreviewCertificado(cursoId, dni);
  const directorio = FileSystem.cacheDirectory || FileSystem.documentDirectory;
  if (!directorio) throw new Error("No hay una carpeta temporal disponible.");

  const previewLocalUri = `${directorio}${nombrePreviewCache(cursoId, dni)}`;
  if (!(await verificarArchivoPreview(previewLocalUri))) {
    const resultado = await FileSystem.downloadAsync(respuesta.url, previewLocalUri);
    if (!(await verificarArchivoPreview(resultado.uri))) {
      throw new Error("El archivo de vista previa no está disponible.");
    }
  }

  const precargado = { previewLocalUri };
  certificadosPrecargados.set(claveCertificado(cursoId, dni), precargado);
  return precargado;
}

export function precargarCertificado(cursoId: string, dni: string): Promise<CertificadoPrecargado> {
  const clave = claveCertificado(cursoId, dni);
  const enCurso = certificadosPrecargaPromises.get(clave);
  if (enCurso) return enCurso;

  const solicitud = (async () => {
    const existente = certificadosPrecargados.get(clave);
    if (existente && await verificarArchivoPreview(existente.previewLocalUri)) {
      return existente;
    }
    if (existente) certificadosPrecargados.delete(clave);
    return cargarCertificadoParaCache(cursoId, dni);
  })();

  const solicitudControlada = solicitud.finally(() => {
    certificadosPrecargaPromises.delete(clave);
  });
  certificadosPrecargaPromises.set(clave, solicitudControlada);
  return solicitudControlada;
}

export async function obtenerCertificadoPrecargado(
  cursoId: string,
  dni: string
): Promise<CertificadoPrecargado | null> {
  const clave = claveCertificado(cursoId, dni);
  const existente = certificadosPrecargados.get(clave);
  if (existente) {
    if (await verificarArchivoPreview(existente.previewLocalUri)) return existente;
    certificadosPrecargados.delete(clave);
    return precargarCertificado(cursoId, dni);
  }

  const enCurso = certificadosPrecargaPromises.get(clave);
  return enCurso ? enCurso : null;
}

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

export function obtenerQrCertificado(cursoId: string, dni: string) {
  return solicitarJson<CertificadoQrResponse>(`${rutaCertificado(cursoId, dni)}/qr`);
}

export function obtenerPdfCertificado(cursoId: string, dni: string) {
  return solicitarJson<CertificadoArchivoResponse>(`${rutaCertificado(cursoId, dni)}/pdf`);
}

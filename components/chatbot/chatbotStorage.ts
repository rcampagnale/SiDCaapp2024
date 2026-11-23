// components/chatbot/chatbotStorage.ts
import { firebaseconn } from "@/constants/FirebaseConn";
import {
  getStorage,
  ref,
  getDownloadURL,
  listAll,
} from "firebase/storage";

const storage = getStorage(firebaseconn);
const FOLDER_CONCURRENCY = 4;

type FolderCacheEntry = {
  status: "loading" | "success" | "error";
  data: any[];
  archivos: number;
  promise?: Promise<any[]>;
};

const folderCache = new Map<string, FolderCacheEntry>();

function fuenteLabel(url: string): string {
  const raw = url.startsWith("gs://") ? storagePathFromGs(url) || "" : url;
  const withoutQuery = raw.split("?")[0];
  const parts = withoutQuery.split("/").filter(Boolean);
  return parts.slice(-2).join("/") || "chatbot-folder";
}

async function mapConcurrenciaLimitada<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  const runWorker = async () => {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  };

  await Promise.all(
    Array.from(
      { length: Math.min(Math.max(concurrency, 1), items.length || 1) },
      () => runWorker(),
    ),
  );

  return results;
}

/**
 * Convierte una URL gs://... a path interno de Storage
 *  ej: gs://sidca-a33f0.appspot.com/Chatboot/xxx -> Chatboot/xxx
 */
export const storagePathFromGs = (gsUrl: string): string | null => {
  if (!gsUrl || !gsUrl.startsWith("gs://")) return null;
  const withoutScheme = gsUrl.replace("gs://", "");
  const parts = withoutScheme.split("/");
  // [bucket, ...path]
  return parts.slice(1).join("/");
};

/**
 * Lee un único archivo JSON desde Storage (gs:// o https...)
 * Devuelve siempre `any[]` (array), para simplificar el consumo.
 */
export const loadJsonFromStorageUrl = async (url: string): Promise<any[]> => {
  let downloadUrl = url;

  // Si viene como gs://... armamos la URL pública con getDownloadURL
  if (url.startsWith("gs://")) {
    const path = storagePathFromGs(url);
    if (!path) throw new Error("Path de Storage inválido (gs:// sin path)");
    const fileRef = ref(storage, path);
    downloadUrl = await getDownloadURL(fileRef);
  }

  const resp = await fetch(downloadUrl);
  if (!resp.ok) {
    throw new Error("Storage request failed");
  }
  const text = await resp.text();

  try {
    const json = JSON.parse(text);
    if (Array.isArray(json)) {
      return json;
    } else {
      // Normalizamos a array para que el resto del código pueda hacer `.map`
      return [json];
    }
  } catch (error) {
    console.error("[ChatbotStorage] json_parse_error", { code: "invalid_json" });
    throw error;
  }
};

/**
 * Lee TODOS los JSON dentro de una carpeta de Storage.
 * - `url` puede ser:
 *    • gs://sidca-a33f0.appspot.com/Chatboot/mi_carpeta
 *    • "Chatboot/mi_carpeta" (ruta relativa en el bucket)
 * Devuelve un único array con todos los registros concatenados.
 */
export const loadJsonFolderFromStorageUrl = async (
  url: string
): Promise<any[]> => {
  const cacheKey = url.startsWith("gs://")
    ? storagePathFromGs(url) || url
    : url.split("?")[0];
  const label = fuenteLabel(url);
  const cached = folderCache.get(cacheKey);

  if (cached?.status === "success") {
    console.log("[ChatbotStorage] folder_cache_hit", {
      fuente: label,
      archivos: cached.archivos,
      registros: cached.data.length,
    });
    return cached.data;
  }

  if (cached?.status === "loading" && cached.promise) {
    console.log("[ChatbotStorage] folder_cache_hit", {
      fuente: label,
      estado: "loading",
    });
    return cached.promise;
  }

  const promise = cargarCarpeta(url, label, cacheKey).catch((error) => {
    folderCache.set(cacheKey, {
      status: "error",
      data: [],
      archivos: 0,
    });
    console.error("[ChatbotStorage] folder_load_error", {
      fuente: label,
      code: "folder_unavailable",
    });
    throw error;
  });
  folderCache.set(cacheKey, {
    status: "loading",
    data: [],
    archivos: 0,
    promise,
  });

  return promise;
};

async function cargarCarpeta(
  url: string,
  label: string,
  cacheKey: string,
): Promise<any[]> {
  const startedAt = Date.now();
  console.log("[ChatbotStorage] folder_load_start", { fuente: label });

  let folderRef;

  if (url.startsWith("gs://")) {
    const path = storagePathFromGs(url);
    if (!path) throw new Error("Path de Storage inválido (gs:// sin path)");
    folderRef = ref(storage, path);
  } else {
    // Ruta relativa directa dentro del bucket
    folderRef = ref(storage, url);
  }

  const listResult = await listAll(folderRef);
  console.log("[ChatbotStorage] folder_list", {
    fuente: label,
    archivos: listResult.items.length,
  });

  if (!listResult.items.length) {
    folderCache.set(cacheKey, {
      status: "success",
      data: [],
      archivos: 0,
    });
    console.log("[ChatbotStorage] folder_loaded", {
      fuente: label,
      archivos: 0,
      registros: 0,
      duracionMs: Date.now() - startedAt,
    });
    return [];
  }

  // Ordenamos por nombre para mantener orden lógico (capitulo_1, 2, 3, ...)
  const itemsOrdenados = [...listResult.items].sort((a, b) =>
    a.name.localeCompare(b.name, "es", { numeric: true })
  );

  let archivosFallidos = 0;
  const resultados = await mapConcurrenciaLimitada(
    itemsOrdenados,
    FOLDER_CONCURRENCY,
    async (itemRef) => {
      try {
        const fileUrl = await getDownloadURL(itemRef);
        return await loadJsonFromStorageUrl(fileUrl);
      } catch {
        archivosFallidos += 1;
        console.error("[ChatbotStorage] file_read_error", {
          fuente: label,
          code: "storage_file_unavailable",
        });
        return [];
      }
    },
  );

  const acumulado = resultados.flatMap((contenido) =>
    Array.isArray(contenido) ? contenido : contenido ? [contenido] : [],
  );
  const totalRegs = acumulado.length;

  if (archivosFallidos === itemsOrdenados.length) {
    throw new Error("No se pudo cargar la carpeta del chatbot");
  }

  folderCache.set(
    cacheKey,
    {
      status: "success",
      data: acumulado,
      archivos: itemsOrdenados.length,
    },
  );

  console.log("[ChatbotStorage] folder_loaded", {
    fuente: label,
    archivos: listResult.items.length,
    registros: totalRegs,
    duracionMs: Date.now() - startedAt,
  });

  return acumulado;
}

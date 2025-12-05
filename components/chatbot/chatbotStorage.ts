// components/chatbot/chatbotStorage.ts
import { firebaseconn } from "@/constants/FirebaseConn";
import {
  getStorage,
  ref,
  getDownloadURL,
  listAll,
} from "firebase/storage";

const storage = getStorage(firebaseconn);

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
  console.log("[ChatbotStorage] loadJsonFromStorageUrl -> url:", url);

  let downloadUrl = url;

  // Si viene como gs://... armamos la URL pública con getDownloadURL
  if (url.startsWith("gs://")) {
    const path = storagePathFromGs(url);
    if (!path) throw new Error("Path de Storage inválido (gs:// sin path)");
    const fileRef = ref(storage, path);
    downloadUrl = await getDownloadURL(fileRef);
  }

  const resp = await fetch(downloadUrl);
  const text = await resp.text();

  console.log(
    "[ChatbotStorage] Primeros 200 chars del archivo:",
    text.slice(0, 200)
  );

  try {
    const json = JSON.parse(text);
    if (Array.isArray(json)) {
      console.log(
        "[ChatbotStorage] JSON.parse OK, tipo: array len:",
        json.length
      );
      return json;
    } else {
      console.log("[ChatbotStorage] JSON.parse OK, tipo: object len: n/a");
      // Normalizamos a array para que el resto del código pueda hacer `.map`
      return [json];
    }
  } catch (e) {
    console.error("❌ Error haciendo JSON.parse del archivo de chatbot:", e);
    throw e;
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
  console.log("[ChatbotStorage] loadJsonFolderFromStorageUrl -> url:", url);

  let folderRef;

  if (url.startsWith("gs://")) {
    const path = storagePathFromGs(url);
    if (!path) throw new Error("Path de Storage inválido (gs:// sin path)");
    console.log("[ChatbotStorage] (folder) gs:// path resuelto:", path);
    folderRef = ref(storage, path);
  } else {
    // Ruta relativa directa dentro del bucket
    console.log("[ChatbotStorage] (folder) ruta relativa:", url);
    folderRef = ref(storage, url);
  }

  const listResult = await listAll(folderRef);
  console.log(
    "[ChatbotStorage] listAll OK. Archivos encontrados:",
    listResult.items.length
  );

  if (!listResult.items.length) {
    console.warn("⚠️ La carpeta no tiene archivos JSON.");
    return [];
  }

  // Ordenamos por nombre para mantener orden lógico (capitulo_1, 2, 3, ...)
  const itemsOrdenados = [...listResult.items].sort((a, b) =>
    a.name.localeCompare(b.name, "es", { numeric: true })
  );

  const acumulado: any[] = [];
  let totalRegs = 0;

  for (const itemRef of itemsOrdenados) {
    try {
      console.log(
        "[ChatbotStorage] Leyendo archivo de carpeta:",
        itemRef.fullPath
      );
      const fileUrl = await getDownloadURL(itemRef);
      console.log("[ChatbotStorage] fileUrl:", fileUrl);

      const contenido = await loadJsonFromStorageUrl(fileUrl);

      if (Array.isArray(contenido)) {
        acumulado.push(...contenido);
        totalRegs += contenido.length;
      } else if (contenido) {
        // Por si acaso, si loadJsonFromStorageUrl cambiara su contrato
        acumulado.push(contenido);
        totalRegs += 1;
      }
    } catch (e) {
      console.error("❌ Error leyendo JSON de", itemRef.fullPath, e);
    }
  }

  console.log(
    "[ChatbotStorage] Total registros acumulados en carpeta:",
    totalRegs
  );

  return acumulado;
};

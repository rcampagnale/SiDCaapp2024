import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import { estilosConstanciaPDF } from "./generarConstanciaCapacitacionPDF.styles";
import { plantillaConstanciaBase64 } from "./constanciaPlantillaBase64";

/**
 * generarConstanciaCapacitacionPDF.js
 *
 * Versión limpia para producción:
 * - Usa la plantilla real constancia_capacitacion.png convertida previamente a base64.
 * - No intenta leer la imagen desde assets en tiempo de ejecución.
 * - Soluciona el error de APK: Unsupported scheme for location assets_cursos_constancia_capacitacion.
 * - Usa estilos desde generarConstanciaCapacitacionPDF.styles.js.
 * - No agrega marca de agua al PDF final.
 * - No usa pdf-lib.
 * - No modifica automáticamente diasCurso ni fechaEmision.
 * - Toma diasCurso y fechaEmision exactamente desde Firebase/web administrativa.
 * - Limpia valores inválidos como "Sin apellido".
 * - Sin console.log.
 */

/* ============================================================
   HELPERS GENERALES
   ============================================================ */

const limpiarTexto = (valor) => {
  if (valor === null || valor === undefined) return "";

  if (valor instanceof Date) return valor;

  if (typeof valor?.toDate === "function") return valor;

  if (typeof valor === "object" && (valor.seconds || valor._seconds)) {
    return valor;
  }

  if (typeof valor === "object") return "";

  return String(valor).replace(/\s+/g, " ").trim();
};

const textoSeguro = (valor) => {
  const texto = limpiarTexto(valor);

  if (texto instanceof Date) return "";

  return String(texto || "")
    .replace(/\u00A0/g, " ")
    .replace(/[–—−]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, "...")
    .replace(/•/g, "-")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
};

const normalizarTextoComparacion = (valor) => {
  return textoSeguro(valor)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const esApellidoInvalido = (valor) => {
  const texto = normalizarTextoComparacion(valor);

  return (
    texto === "" ||
    texto === "sin apellido" ||
    texto === "s/apellido" ||
    texto === "s apellido" ||
    texto === "sin datos" ||
    texto === "no informado" ||
    texto === "no informa"
  );
};

const limpiarApellidoDocente = (valor) => {
  if (esApellidoInvalido(valor)) return "";
  return textoSeguro(valor);
};

const limpiarNombreCompletoDocente = (valor) => {
  const texto = textoSeguro(valor);

  if (!texto) return "";

  return texto
    .replace(
      /^\s*(sin apellido|s\/apellido|sin datos|no informado|no informa)\s*[,;-]\s*/i,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
};

const escapeHtml = (valor) => {
  return textoSeguro(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const slugFileName = (texto = "") =>
  textoSeguro(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 90);

const armarNombreCompleto = ({ nombre, apellido, nombreCompleto }) => {
  const directo = limpiarNombreCompletoDocente(nombreCompleto);

  if (directo) return directo;

  const ap = limpiarApellidoDocente(apellido);
  const nom = limpiarNombreCompletoDocente(nombre);

  if (ap && nom) return `${ap}, ${nom}`;
  if (nom) return nom;
  if (ap) return ap;

  return "";
};

/* ============================================================
   NORMALIZACIÓN DE DATOS
   ============================================================ */

const esObjetoPlano = (value) => {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
};

const recolectarFuentes = (value, salida = [], profundidad = 0) => {
  if (!esObjetoPlano(value) || profundidad > 4) return salida;

  salida.push(value);

  const posiblesContenedores = [
    "asistencia",
    "registro",
    "data",
    "docente",
    "afiliado",
    "usuario",
    "persona",
    "curso",
    "cursoData",
    "cursoSeleccionado",
    "config",
    "configuracion",
    "configConstancia",
    "constanciaConfig",
    "datosConstancia",
    "constancia",
    "configuracionConstancia",
    "configuracionConstanciaCurso",
  ];

  posiblesContenedores.forEach((key) => {
    if (esObjetoPlano(value[key])) {
      recolectarFuentes(value[key], salida, profundidad + 1);
    }
  });

  return salida;
};

const recolectarContenedoresPorClave = (
  value,
  claves,
  salida = [],
  profundidad = 0
) => {
  if (!esObjetoPlano(value) || profundidad > 4) return salida;

  claves.forEach((key) => {
    if (esObjetoPlano(value[key])) {
      salida.push(value[key]);
      recolectarContenedoresPorClave(
        value[key],
        claves,
        salida,
        profundidad + 1
      );
    }
  });

  Object.values(value).forEach((child) => {
    if (esObjetoPlano(child)) {
      recolectarContenedoresPorClave(child, claves, salida, profundidad + 1);
    }
  });

  return salida;
};

const tomarValor = (fuentes, keys) => {
  for (const fuente of fuentes) {
    for (const key of keys) {
      const value = fuente?.[key];
      const clean = textoSeguro(value);

      if (clean && clean !== "[object Object]") {
        return clean;
      }
    }
  }

  return "";
};

const normalizarEntrada = (...rawArgs) => {
  let args = rawArgs;

  if (rawArgs.length === 1 && Array.isArray(rawArgs[0])) {
    args = rawArgs[0];
  }

  if (
    rawArgs.length === 1 &&
    esObjetoPlano(rawArgs[0]) &&
    Array.isArray(rawArgs[0].args)
  ) {
    args = rawArgs[0].args;
  }

  const fuentes = [];

  args.forEach((arg) => {
    if (esObjetoPlano(arg)) {
      recolectarFuentes(arg, fuentes);
    }
  });

  const fuentesCurso = [];

  args.forEach((arg) => {
    if (esObjetoPlano(arg)) {
      recolectarContenedoresPorClave(
        arg,
        [
          "curso",
          "cursoData",
          "cursoSeleccionado",
          "config",
          "configuracion",
          "configConstancia",
          "constanciaConfig",
          "datosConstancia",
          "constancia",
          "configuracionConstancia",
          "configuracionConstanciaCurso",
        ],
        fuentesCurso
      );
    }
  });

  const nombre = limpiarNombreCompletoDocente(
    tomarValor(fuentes, [
      "nombre",
      "Nombre",
      "nombres",
      "Nombres",
      "name",
      "Name",
    ])
  );

  const apellido = limpiarApellidoDocente(
    tomarValor(fuentes, [
      "apellido",
      "Apellido",
      "apellidos",
      "Apellidos",
      "surname",
      "lastName",
    ])
  );

  const nombreCompletoDirecto = limpiarNombreCompletoDocente(
    tomarValor(fuentes, [
      "nombreCompleto",
      "NombreCompleto",
      "displayName",
      "fullName",
      "apenom",
      "apellidoNombre",
      "apellido_y_nombre",
      "nombreApellido",
      "apellidoYNombre",
    ])
  );

  const nombreCompleto =
    armarNombreCompleto({
      nombre,
      apellido,
      nombreCompleto: nombreCompletoDirecto,
    }) || "DOCENTE";

  const dni =
    tomarValor(fuentes, [
      "dni",
      "DNI",
      "documento",
      "Documento",
      "nroDocumento",
      "numeroDocumento",
      "numDocumento",
    ]) || "SIN DNI";

  const tituloCursoEspecifico = tomarValor(fuentes, [
    "tituloCurso",
    "cursoTitulo",
    "cursoNombre",
    "nombreCurso",
    "nombreCapacitacion",
    "capacitacion",
    "curso",
    "Curso",
  ]);

  const tituloCursoDesdeContenedor = tomarValor(fuentesCurso, [
    "titulo",
    "Titulo",
    "nombre",
    "Nombre",
    "name",
    "curso",
    "cursoNombre",
    "cursoTitulo",
    "nombreCurso",
  ]);

  const tituloCurso =
    tituloCursoEspecifico || tituloCursoDesdeContenedor || "CAPACITACIÓN";

  const resolucion = tomarValor(fuentes, [
    "resolucion",
    "Resolucion",
    "resolución",
    "numeroResolucion",
    "resolucionMinisterial",
    "resolucionCurso",
  ]);

  const diasCurso = tomarValor(fuentes, [
    "diasCurso",
    "dias",
    "fechasCurso",
    "textoDiasCurso",
  ]);

  const fechaEmision = tomarValor(fuentes, [
    "fechaEmision",
    "textoEmision",
    "emision",
    "fechaConstancia",
  ]);

  return {
    nombreCompleto,
    dni,
    tituloCurso,
    resolucion,
    diasCurso,
    fechaEmision,
  };
};

/* ============================================================
   PLANTILLA BASE64
   ============================================================ */

const cargarPlantillaBase64 = async () => {
  if (!plantillaConstanciaBase64) {
    throw new Error("No se encontró la plantilla base64 de la constancia.");
  }

  if (
    typeof plantillaConstanciaBase64 !== "string" ||
    !plantillaConstanciaBase64.startsWith("data:image/png;base64,")
  ) {
    throw new Error(
      "La plantilla base64 de la constancia no tiene un formato válido."
    );
  }

  return plantillaConstanciaBase64;
};

/* ============================================================
   HTML
   ============================================================ */

const construirHtmlConstancia = ({ data, plantillaBase64 }) => {
  const docente = escapeHtml(data.nombreCompleto);
  const dni = escapeHtml(data.dni);
  const curso = escapeHtml(data.tituloCurso).toUpperCase();
  const resolucion = escapeHtml(data.resolucion);
  const dias = escapeHtml(data.diasCurso);
  const emision = escapeHtml(data.fechaEmision);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          ${estilosConstanciaPDF}
        </style>
      </head>

      <body>
        <div class="page">
          <img class="template" src="${plantillaBase64}" />

          <div class="dato docente">${docente}</div>
          <div class="dato dni">${dni}</div>
          <div class="dato curso">${curso}</div>

          ${
            resolucion
              ? `<div class="dato resolucion">${resolucion}</div>`
              : ""
          }

          <div class="dato dias">${dias}</div>
          <div class="dato emision">${emision}</div>
        </div>
      </body>
    </html>
  `;
};

/* ============================================================
   FUNCIÓN PRINCIPAL
   ============================================================ */

export const generarConstanciaCapacitacionPDF = async (...args) => {
  const data = normalizarEntrada(...args);

  const plantillaBase64 = await cargarPlantillaBase64();

  const html = construirHtmlConstancia({
    data,
    plantillaBase64,
  });

  const printResult = await Print.printToFileAsync({
    html,
    base64: false,
  });

  if (!printResult?.uri) {
    throw new Error("Expo Print no devolvió la URI del PDF.");
  }

  const dniSlug = slugFileName(data.dni || "sin_dni");
  const nombreSlug = slugFileName(data.nombreCompleto || "docente");

  const fileName = `constancia_${dniSlug}_${nombreSlug}.pdf`;

  const baseDirectory = FileSystem.documentDirectory || FileSystem.cacheDirectory;

  if (!baseDirectory) {
    throw new Error("No se encontró un directorio válido para guardar el PDF.");
  }

  const fileUri = `${baseDirectory}${fileName}`;

  await FileSystem.deleteAsync(fileUri, {
    idempotent: true,
  });

  await FileSystem.copyAsync({
    from: printResult.uri,
    to: fileUri,
  });

  return fileUri;
};

export default generarConstanciaCapacitacionPDF;
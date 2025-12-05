import Fuse, { Expression } from "fuse.js";

export type OrigenNormativa = "licencia" | "estatuto";

export type RegistroNormativa = {
  origen?: OrigenNormativa;
  articulo?: number | string;
  numero?: number | string;
  id?: string;
  titulo?: string;
  titulo_articulo?: string;
  titulo_capitulo?: string;
  subtitulo?: string;
  pregunta?: string;
  texto?: any;
  contenido?: any;
  descripcion?: string;
  articulos?: any;
  items?: any;
  [key: string]: any;
};

// ===== Normalización de texto =====

// Palabras muy comunes que NO queremos usar como keywords
const STOPWORDS = [
  "de",
  "del",
  "la",
  "el",
  "los",
  "las",
  "y",
  "o",
  "u",
  "un",
  "una",
  "unos",
  "unas",
  "en",
  "a",
  "al",
  "por",
  "para",
  "con",
  "sin",
  "que",
  "se",
  "su",
  "sus",
  "mi",
  "mis",
  "tu",
  "tus",
];

const esAnexoII = (d: RegistroNormativa): boolean => {
  const titulo = (d.titulo || "").toString().toUpperCase();
  const anexo = ((d as any).anexo || "").toString().toUpperCase();

  return (
    anexo === "II" ||
    titulo.includes("ANEXO II - FUNCIONARIOS OTORGANTES E INTERVINIENTES") ||
    titulo.startsWith("ANEXO II")
  );
};


const normalizarTextoBase = (str: string): string =>
  (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const extraerKeywords = (consulta: string): string[] => {
  const base = normalizarTextoBase(consulta);
  const tokens = base.split(/[^a-z0-9ñ]+/).filter(Boolean);
  return tokens.filter((t) => t.length >= 4 && !STOPWORDS.includes(t));
};

const tieneArticulo = (item: RegistroNormativa): boolean =>
  item?.articulo !== undefined &&
  item?.articulo !== null &&
  item?.articulo !== "";

// 🔹 Normaliza TODO el texto posible de un registro (licencias / estatuto)
export const normalizarContenido = (item: RegistroNormativa): string => {
  if (!item) return "";

  const partes: string[] = [];

  const acum = (valor: any) => {
    if (!valor) return;

    if (Array.isArray(valor)) {
      valor.forEach(acum);
    } else if (typeof valor === "string") {
      partes.push(valor);
    } else if (typeof valor === "object") {
      Object.values(valor).forEach(acum);
    }
  };

  // Campos habituales en tus JSON
  acum(item.titulo);
  acum(item.titulo_capitulo);
  acum(item.titulo_articulo);
  acum(item.subtitulo);
  acum(item.texto);
  acum(item.contenido);
  acum(item.descripcion);

  // Casos especiales (ej. { articulos: [...] }, anexos, items)
  acum(item.articulos);
  acum(item.items);

  return partes.join("\n").trim();
};

export const getArticulo = (
  datos: RegistroNormativa[],
  origen: OrigenNormativa,
  numero: number
): RegistroNormativa | null => {
  return (
    datos.find(
      (d) =>
        d.origen === origen &&
        (d.articulo === numero ||
          d.articulo === String(numero) ||
          d.numero === numero ||
          d.numero === String(numero))
    ) || null
  );
};

// 🔹 Devuelve texto amigable a partir de un registro de licencias
export const buildRespuestaDesdeArticulo = (
  art: RegistroNormativa
): string => {
  if (!art) {
    return "No encontré el artículo específico para esta consulta.";
  }

  const num =
    art?.articulo ??
    art?.numero ??
    (typeof art?.id === "string"
      ? art.id.match(/\d+/)?.[0] ?? ""
      : "");

  const titulo =
    art?.titulo_articulo ||
    art?.titulo ||
    art?.pregunta ||
    "";

  const normativa = normalizarContenido(art);

  console.log("[ChatbotLicencias] buildRespuestaDesdeArticulo ->", {
    articulo: num,
    titulo,
    tieneNormativa: normativa.length > 0,
  });

  let encabezado = "";

  if (titulo && num) {
    encabezado = `Tu consulta se relaciona con **${titulo}** (Artículo ${num}) del Régimen de Licencias.\n\n`;
  } else if (num) {
    encabezado = `Tu consulta se relaciona con el **Artículo ${num}** del Régimen de Licencias.\n\n`;
  } else if (titulo) {
    encabezado = `Tu consulta se relaciona con **${titulo}** del Régimen de Licencias.\n\n`;
  } else {
    encabezado = `Te comparto lo que indica el Régimen de Licencias sobre este tema:\n\n`;
  }

  const cuerpo =
    normativa && normativa.trim().length > 0
      ? normativa
      : "No tengo cargado el texto completo de este artículo.";

  return encabezado + cuerpo;
};

// ===== Reglas especiales (fallecimiento, largo tratamiento, maternidad) =====

const buildRespuestaFallecimiento = (
  consulta: string,
  datos: RegistroNormativa[]
): string | null => {
  const t = consulta.toLowerCase();

  if (
    !(
      t.includes("fallec") ||
      t.includes("murio") ||
      t.includes("murió") ||
      t.includes("muerte") ||
      t.includes("duelo")
    )
  ) {
    return null;
  }

  const art48 = getArticulo(datos, "licencia", 48);
  const normativa48 = art48 ? normalizarContenido(art48) : "";

  const grupoARegex =
    /(padre|madre|papá|papa|mamá|mama|hijo|hija|hije|c[oó]nyuge|conviviente|esposo|esposa|marido|mujer)/;
  const grupoBRegex =
    /(hermano|hermana|hermanos|hermanas|abuelo|abuela|abuelos|abuelas|nieto|nieta|nietos|nietas|suegro|suegra|suegros|suegras|yerno|nuera|yernos|nueras|cuñado|cuñada|cuñados|cuñadas|hijastro|hijastra|hijastros|hijastras|hijos politicos|hijos políticos|persona a cargo|tutor legal)/;
  const grupoCRegex =
    /(t[ií]o|t[ií]a|t[ií]os|t[ií]as|primo|prima|primos|primas|sobrino|sobrina|sobrinos|sobrinas|bisabuelo|bisabuela|bisabuelos|bisabuelas|bisnieto|bisnieta|bisnietos|bisnietas|3er grado|tercer grado|4to grado|cuarto grado)/;

  let respuestaPrincipal: string;

  if (grupoARegex.test(t)) {
    respuestaPrincipal =
      "Por fallecimiento de tu padre, madre, hijo/a o cónyuge/conviviente te corresponden **diez (10) días corridos** de licencia con goce de haberes.";
  } else if (grupoBRegex.test(t)) {
    respuestaPrincipal =
      "Por fallecimiento de hermanos, abuelos, nietos, suegros, yernos, nueras, cuñados, hijastros, hijos políticos o personas a cargo te corresponden **cinco (5) días corridos** de licencia con goce de haberes.";
  } else if (grupoCRegex.test(t)) {
    respuestaPrincipal =
      "Por fallecimiento de parientes de **3er y 4to grado** (primos, tíos, sobrinos, bisabuelos, bisnietos, etc.) te corresponde **un (1) día** de licencia (el día del sepelio).";
  } else {
    respuestaPrincipal =
      "En caso de fallecimiento, la cantidad de días de licencia depende del vínculo con la persona fallecida:\n\n" +
      "• **10 días** por fallecimiento de cónyuge/conviviente, padres e hijos.\n" +
      "• **5 días** por fallecimiento de hermanos, abuelos, nietos, suegros, yernos, nueras, cuñados, hijastros, hijos políticos o personas a cargo.\n" +
      "• **1 día** por fallecimiento de parientes de 3er y 4to grado (primos, tíos, sobrinos, bisabuelos, bisnietos, etc.).";
  }

  if (normativa48) {
    return (
      respuestaPrincipal +
      "\n\nA continuación te dejo el texto del **Artículo 48° – Fallecimiento**:\n\n" +
      normativa48
    );
  }

  return respuestaPrincipal;
};

const buildRespuestaLargoTratamiento = (
  consulta: string,
  datos: RegistroNormativa[]
): string | null => {
  const t = consulta.toLowerCase();

  if (
    !(
      t.includes("largo trat") ||
      t.includes("tratamiento prolongado") ||
      t.includes("enfermedad prolongada") ||
      t.includes("enfermedad de largo") ||
      t.includes("oncolog")
    )
  ) {
    return null;
  }

  const arts: RegistroNormativa[] = [];
  const a20 = getArticulo(datos, "licencia", 20);
  const a21 = getArticulo(datos, "licencia", 21);
  const a22 = getArticulo(datos, "licencia", 22);
  if (a20) arts.push(a20);
  if (a21) arts.push(a21);
  if (a22) arts.push(a22);

  const normativa = arts
    .map((a) => normalizarContenido(a))
    .filter(Boolean)
    .join("\n\n");

  let respuesta =
    "La **licencia por enfermedad de largo tratamiento** está regulada por los **Artículos 20°, 21° y 22°** del Régimen de Licencias.\n\n" +
    "En general, contempla un período prolongado de licencia que combina etapas con goce de haberes, con porcentaje reducido y, finalmente, un tramo sin goce de haberes, siempre con intervención de la Junta Médica.\n\n" +
    "Te dejo el texto completo de estos artículos:\n\n";

  if (normativa) respuesta += normativa;

  return respuesta;
};

const buildRespuestaMaternidad = (
  consulta: string,
  datos: RegistroNormativa[]
): string | null => {
  const t = consulta.toLowerCase();

  if (
    !(
      t.includes("maternidad") ||
      t.includes("embarazo") ||
      t.includes("prenatal") ||
      t.includes("pre natal") ||
      t.includes("postnatal") ||
      t.includes("posnatal") ||
      t.includes("nacimiento") ||
      t.includes("parto")
    )
  ) {
    return null;
  }

  const art27 = getArticulo(datos, "licencia", 27);
  const normativa27 = art27 ? normalizarContenido(art27) : "";

  let respuesta =
    "La **licencia por maternidad** otorga, en términos generales, **hasta ciento veinte (120) días corridos** de licencia, distribuidos entre un período **anterior** y otro **posterior** al parto, sin que este último pueda superar los **noventa (90) días** posteriores a la fecha del nacimiento.\n\n" +
    "La norma prevé además situaciones especiales (nacimiento múltiple, prematuro, fallecimiento del recién nacido, etc.) donde se pueden extender los plazos.\n\n";

  if (normativa27) {
    respuesta +=
      "Te comparto el texto del **Artículo 27° – Maternidad**:\n\n" +
      normativa27;
  }

  return respuesta;
};

export const resolverConsultaEspecial = (
  consulta: string,
  datos: RegistroNormativa[]
): string | null => {
  const t = consulta.toLowerCase();

  const respFallecimiento = buildRespuestaFallecimiento(t, datos);
  if (respFallecimiento) return respFallecimiento;

  if (
    t.includes("largo trat") ||
    t.includes("tratamiento prolongado") ||
    t.includes("enfermedad prolongada") ||
    t.includes("enfermedad de largo") ||
    t.includes("oncolog")
  ) {
    const respLT = buildRespuestaLargoTratamiento(t, datos);
    if (respLT) return respLT;
  }

  if (
    t.includes("maternidad") ||
    t.includes("embarazo") ||
    t.includes("prenatal") ||
    t.includes("pre natal") ||
    t.includes("postnatal") ||
    t.includes("posnatal") ||
    (t.includes("licencia") && t.includes("nacimiento"))
  ) {
    const respMat = buildRespuestaMaternidad(t, datos);
    if (respMat) return respMat;
  }

  return null;
};

// 🔹 Resolución genérica para TODAS las licencias (80+ artículos)
export const resolverConsultaGenericaLicencias = (
  consulta: string,
  datos: RegistroNormativa[]
): string | null => {
  const t = consulta.toLowerCase();
  const tNorm = normalizarTextoBase(consulta);

  console.log("========================================");
  console.log("[ChatbotLicencias] resolverConsultaGenericaLicencias");
  console.log("[ChatbotLicencias] consulta:", consulta);

  // 0) Universos de licencias
  const baseLicencias = datos.filter((d) => d.origen === "licencia");

  // Además, sumamos artículos del Estatuto que claramente son de licencias,
  // justificación de inasistencias o franquicias.
  const extraEstatuto = datos.filter((d) => {
    if (d.origen !== "estatuto") return false;
    const txt = normalizarTextoBase(
      `${d.titulo || ""} ${d.titulo_capitulo || ""} ${
        (d as any).titulo_articulo || ""
      } ${normalizarContenido(d)}`
    );
    return (
      txt.includes("licencia") ||
      txt.includes("licencias") ||
      txt.includes("franquicia") ||
      txt.includes("franquicias") ||
      txt.includes("justificacion de inasistencias") ||
      txt.includes("justificacion de inasistencia")
    );
  });

  const soloLicencias = [...baseLicencias, ...extraEstatuto];
  const anexoII = soloLicencias.find(esAnexoII);
  const soloLicenciasSinAnexo = soloLicencias.filter((d) => !esAnexoII(d));

  console.log("[ChatbotLicencias] baseLicencias:", baseLicencias.length);
  console.log(
    "[ChatbotLicencias] extraEstatuto (licencias en Estatuto):",
    extraEstatuto.length
  );
  console.log(
    "[ChatbotLicencias] total soloLicencias:",
    soloLicencias.length
  );

  // 0.b) Si el usuario pide explícitamente el Anexo II, lo devolvemos directo
  if (
    tNorm.includes("anexo ii") ||
    tNorm.includes("anexo 2") ||
    (tNorm.includes("anexo") &&
      tNorm.includes("funcionari") &&
      tNorm.includes("licencia"))
  ) {
    if (anexoII) {
      console.log(
        "[ChatbotLicencias] consulta apunta explícitamente al Anexo II"
      );
      return buildRespuestaDesdeArticulo(anexoII);
    }
  }

  // 1) Número de artículo explícito
  let numArticulo: number | null = null;

  const matchArticuloLargo = t.match(/art[íi]culo\s+(\d+)/);
  const matchArticuloCorto = !matchArticuloLargo
    ? t.match(/\bart\.?\s*(\d+)/)
    : null;

  if (matchArticuloLargo) {
    numArticulo = parseInt(matchArticuloLargo[1], 10);
  } else if (matchArticuloCorto) {
    numArticulo = parseInt(matchArticuloCorto[1], 10);
  }

  if (!Number.isNaN(numArticulo as any) && numArticulo !== null) {
    const art = soloLicenciasSinAnexo.find(
      (d) =>
        d.articulo === numArticulo ||
        d.articulo === String(numArticulo) ||
        (d as any).numero === numArticulo ||
        (d as any).numero === String(numArticulo)
    );

    console.log("[ChatbotLicencias] match por número de artículo:", {
      numArticulo,
      encontrado: !!art,
    });

    if (art) {
      return buildRespuestaDesdeArticulo(art);
    }
  }

  // 2) Caso específico: Licencia por estudios / exámenes
  const tieneEstudio =
    tNorm.includes("estudio") || tNorm.includes("estudios");
  const tieneExamen =
    tNorm.includes("examen") || tNorm.includes("examenes");

  if (tieneEstudio || tieneExamen) {
    const candidatosEstudioExamen = soloLicenciasSinAnexo.filter((item) => {
      const txt = normalizarTextoBase(
        `${item.titulo || ""} ${
          (item as any).titulo_articulo || ""
        } ${normalizarContenido(item)}`
      );
      return (
        txt.includes("estudio") ||
        txt.includes("estudios") ||
        txt.includes("examen") ||
        txt.includes("examenes")
      );
    });

    console.log(
      "[ChatbotLicencias] candidatos por estudios/exámenes:",
      candidatosEstudioExamen.map(
        (c) =>
          c.articulo ||
          (c as any).numero ||
          c.titulo ||
          (c as any).titulo_articulo
      )
    );

    if (candidatosEstudioExamen.length === 1) {
      return buildRespuestaDesdeArticulo(candidatosEstudioExamen[0]);
    } else if (candidatosEstudioExamen.length > 1) {
      const resultadosEspecificos = buscarInteligente(
        consulta,
        candidatosEstudioExamen
      );
      if (resultadosEspecificos.length > 0) {
        console.log(
          "[ChatbotLicencias] elegido dentro de candidatos estudio/examen:",
          resultadosEspecificos[0].articulo ||
            (resultadosEspecificos[0] as any).numero ||
            resultadosEspecificos[0].titulo ||
            (resultadosEspecificos[0] as any).titulo_articulo
        );
        return buildRespuestaDesdeArticulo(resultadosEspecificos[0]);
      }
    }
  }

  // 3) Si escribe "licencia por ..." o "licencia para ..."
  const matchLicencia = t.match(/licencia\s+(por|para)\s+(.+)/);
  if (matchLicencia) {
    const fraseClave = matchLicencia[2].trim();
    const resultadosPorFrase = buscarInteligente(
      fraseClave,
      soloLicenciasSinAnexo
    );

    console.log(
      "[ChatbotLicencias] búsqueda por 'licencia por/para':",
      fraseClave,
      " → candidatos:",
      resultadosPorFrase.map(
        (r) =>
          r.articulo ||
          (r as any).numero ||
          r.titulo ||
          (r as any).titulo_articulo
      )
    );

    if (resultadosPorFrase.length > 0) {
      return buildRespuestaDesdeArticulo(resultadosPorFrase[0]);
    }
  }

  // 4) Fallback: usar la consulta completa dentro del universo de licencias (sin Anexo II)
  const resultados = buscarInteligente(consulta, soloLicenciasSinAnexo);

  console.log(
    "[ChatbotLicencias] fallback Fuse soloLicenciasSinAnexo. Cant resultados:",
    resultados.length,
    " top:",
    resultados[0] &&
      (resultados[0].articulo ||
        (resultados[0] as any).numero ||
        resultados[0].titulo ||
        (resultados[0] as any).titulo_articulo)
  );

  if (resultados.length > 0) {
    return buildRespuestaDesdeArticulo(resultados[0]);
  }

  console.log("[ChatbotLicencias] sin coincidencias relevantes");
  return null;
};


// ===== Búsqueda general con Fuse =====

export const buscarInteligente = (
  consulta: string | Expression,
  datos: RegistroNormativa[]
): RegistroNormativa[] => {
  if (!consulta || !datos || !datos.length) return [];

  const datosNormalizados = datos.map((item: RegistroNormativa) => {
    const contenido = normalizarContenido(item);
    const etiquetaOriginal =
      item.pregunta ||
      item.titulo_articulo ||
      item.titulo ||
      (item.articulo ? `Artículo ${item.articulo}` : "");

    const pregunta = etiquetaOriginal;

    return { ...item, contenido, pregunta };
  });

  const fuse = new Fuse(datosNormalizados as any[], {
    keys: ["pregunta", "contenido"],
    threshold: 0.3,
    minMatchCharLength: 3,
    includeScore: true,
    ignoreLocation: true,
  });

  const resultados = fuse.search(consulta as any);
  if (!resultados.length) return [];

  const keywords = extraerKeywords(String(consulta));
  if (!keywords.length) {
    return [resultados[0].item as RegistroNormativa];
  }

  const candidatos = resultados.filter((r) =>
    tieneArticulo(r.item as RegistroNormativa)
  );
  const lista = candidatos.length ? candidatos : resultados;

  const scoreItem = (res: any) => {
    const item: RegistroNormativa = res.item;
    const textoPlano = normalizarTextoBase(
      `${(item as any).pregunta || ""} ${normalizarContenido(item) || ""}`
    );

    let coincidencias = 0;
    for (const kw of keywords) {
      if (textoPlano.includes(kw)) coincidencias++;
    }

    return {
      coincidencias,
      tieneArt: tieneArticulo(item),
      fuseScore: typeof res.score === "number" ? res.score : 0,
    };
  };

  let mejorRes = lista[0];
  let mejorScore = scoreItem(mejorRes);

  for (let i = 1; i < lista.length; i++) {
    const res = lista[i];
    const sc = scoreItem(res);

    const mejorEsMejor =
      sc.coincidencias > mejorScore.coincidencias ||
      (sc.coincidencias === mejorScore.coincidencias &&
        sc.tieneArt &&
        !mejorScore.tieneArt) ||
      (sc.coincidencias === mejorScore.coincidencias &&
        sc.tieneArt === mejorScore.tieneArt &&
        sc.fuseScore < mejorScore.fuseScore);

    if (mejorEsMejor) {
      mejorRes = res;
      mejorScore = sc;
    }
  }

  return [mejorRes.item as RegistroNormativa];
};

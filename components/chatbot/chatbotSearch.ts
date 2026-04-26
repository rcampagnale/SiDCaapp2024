import Fuse, { Expression } from "fuse.js";

export type OrigenNormativa = "licencia" | "estatuto";
export type DominioBackend = "licencias" | "estatuto" | "general";

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

type EstrategiaLicencia =
  | { tipo: "articulo_exacto"; articulo: number }
  | { tipo: "articulos_multiples"; articulos: number[] }
  | { tipo: "backend_licencias" }
  | null;

type EstrategiaEstatuto =
  | { tipo: "articulo_exacto"; articulo: number }
  | { tipo: "articulos_multiples"; articulos: number[] }
  | null;

type ResumenLicenciaItem = {
  articulo: string;
  descripcion: string;
  otorgante?: string;
  interviniente?: string;
};

// ===== Normalización de texto =====

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

const KEYWORDS_LICENCIAS = [
  "licencia",
  "licencias",
  "anual ordinaria",
  "descanso anual",
  "vacaciones",
  "receso escolar",
  "corto tratamiento",
  "enfermedad en hora de labor",
  "hora de labor",
  "largo tratamiento",
  "incapacidad",
  "cambio de funciones",
  "maternidad",
  "embarazo",
  "violencia de genero",
  "violencia genero",
  "accidente",
  "accidente de trabajo",
  "enfermedad profesional",
  "matrimonio",
  "casamiento",
  "estudio",
  "estudios",
  "examen",
  "examenes",
  "practicas",
  "capacitacion",
  "capacitaciones",
  "perfeccionamiento",
  "postgrado",
  "gremial",
  "licencia gremial",
  "representacion gremial",
  "delegado gremial",
  "delegados gremiales",
  "delegado gremiales",
  "donacion de sangre",
  "donacion de organos",
  "grupo familiar",
  "atencion del grupo familiar",
  "atencion de grupo familiar",
  "familiar enfermo",
  "hijo menor",
  "hijos menores",
  "atencion de hijos menores",
  "adopcion",
  "tenencia",
  "tenencia con fines de adopcion",
  "aislamiento",
  "persona disfuncionada",
  "disfuncionada",
  "asunto particular",
  "asuntos particulares",
  "razones particular",
  "razones particulares",
  "razones especiales",
  "razones especiales o particulares",
  "razones extraordinaria",
  "razones extraordinarias",
  "fallecimiento",
  "duelo",
  "superposicion horaria",
  "superposicion de horarios",
  "superposicion",
  "horarios superpuestos",
  "tramites personales",
  "tramite personal",
  "tramite",
  "tramites",
  "citacion",
  "citaciones",
  "citaciones y tramites personales",
  "franquicia",
  "franquicias",
  "horario para estudiantes",
  "horarios para estudiantes",
  "estudiante",
  "estudiantes",
  "lactancia",
  "pago de haberes",
  "tardanza",
  "ausencia injustificada",
  "abandono de servicio",
  "festividad religiosa",
  "festividades religiosas",
  "religiosa",
  "religiosas",
  "comision de servicio",
  "comision de servicios",
  "servicio",
  "servicios",
  "actividad educativa",
  "actividad cientifica",
  "actividad cultural",
  "actividad tecnologica",
  "actividades de interes educativo",
  "actividades de interes cientifico",
  "actividades de interes cultural",
  "actividades de interes tecnologico",
  "actividades deportivas",
  "deportivas no rentadas",
  "candidatura a cargos electivos",
  "cargo electivo",
  "cargos electivos",
  "funciones superiores de gobierno",
  "mayor jerarquia",
  "cargo de mayor jerarquia",
  "acompanar al conyuge",
  "acompanar al conviviente",
  "acompanar al concubino",
  "conyuge",
  "conviviente",
  "concubino",
];

const KEYWORDS_ESTATUTO = [
  "estatuto",
  "derechos del docente",
  "deberes del docente",
  "obligaciones del docente",
  "junta de clasificacion",
  "juntas de clasificacion",
  "tribunal de disciplina",
  "estabilidad",
  "ascenso",
  "ascensos",
  "traslado",
  "traslados",
  "permuta",
  "permutas",
  "reincorporacion",
  "ingreso a la docencia",
  "interinato",
  "interinatos",
  "suplencia",
  "suplencias",
  "remuneracion",
  "remuneraciones",
  "disciplina",
  "sanciones",
  "carrera docente",
  "titularidad",
  "titularizacion",
];

const TITULOS_GENERICOS_NO_CONFIABLES = [
  "licencias extraordinarias",
  "justificacion de inasistencias",
  "franquicias",
  "licencias especiales por salud y razones familiares",
  "derecho a licencia",
  "alcances",
  "disposiciones generales",
  "generalidades",
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

export const normalizarTextoBase = (str: string): string =>
  (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extraerKeywords = (consulta: string): string[] => {
  const base = normalizarTextoBase(consulta);
  const tokens = base.split(/[^a-z0-9ñ]+/).filter(Boolean);
  return tokens.filter((t) => t.length >= 4 && !STOPWORDS.includes(t));
};

const incluyeTodos = (texto: string, ...terminos: string[]): boolean => {
  return terminos.every((t) => texto.includes(normalizarTextoBase(t)));
};

const incluyeAlguno = (texto: string, ...terminos: string[]): boolean => {
  return terminos.some((t) => texto.includes(normalizarTextoBase(t)));
};

const esConsultaAmbiguaConyuge = (consulta: string): boolean => {
  const q = normalizarTextoBase(consulta);
  return q === "conyuge" || q === "conviviente" || q === "concubino";
};

const tieneArticulo = (item: RegistroNormativa): boolean =>
  item?.articulo !== undefined &&
  item?.articulo !== null &&
  item?.articulo !== "" &&
  !Number.isNaN(Number(item.articulo));

const extraerNumeroArticuloConsulta = (consulta: string): number | null => {
  const tNorm = normalizarTextoBase(consulta);

  const patrones = [
    /\bart[íi]?culos?\s+(\d+)\b/,
    /\barts?\.?\s*(\d+)\b/,
    /^\s*(\d{1,3})\s*$/,
  ];

  for (const patron of patrones) {
    const match = tNorm.match(patron);
    if (match?.[1]) {
      const n = parseInt(match[1], 10);
      if (!Number.isNaN(n)) return n;
    }
  }

  return null;
};

export const detectarDominioBackend = (
  consulta: string
): DominioBackend => {
  const q = normalizarTextoBase(consulta);

  if (
    q.includes("fallecimiento") ||
    q.includes("duelo") ||
    q.includes("razones extraordinaria") ||
    q.includes("razones extraordinarias") ||
    q.includes("razones particular") ||
    q.includes("razones particulares") ||
    q.includes("razones especiales") ||
    q.includes("razones especiales o particulares") ||
    q.includes("asuntos particulares") ||
    q.includes("acompanar al conyuge") ||
    q.includes("acompanar al conviviente") ||
    q.includes("acompanar al concubino") ||
    q.includes("donacion de sangre") ||
    q.includes("donacion de organos") ||
    q.includes("delegado gremial") ||
    q.includes("delegado gremiales") ||
    q.includes("delegados gremiales") ||
    q.includes("tramites personales") ||
    q.includes("citaciones y tramites personales") ||
    q.includes("citacion") ||
    q.includes("citaciones")
  ) {
    return "licencias";
  }

  if (KEYWORDS_LICENCIAS.some((k) => q.includes(k))) {
    return "licencias";
  }

  if (KEYWORDS_ESTATUTO.some((k) => q.includes(k))) {
    return "estatuto";
  }

  return "general";
};

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

  acum(item.titulo);
  acum(item.titulo_capitulo);
  acum(item.titulo_articulo);
  acum(item.subtitulo);
  acum(item.texto);
  acum(item.contenido);
  acum(item.descripcion);
  acum(item.articulos);
  acum(item.items);

  return partes.join("\n").trim();
};

const calcularCoincidenciasKeywords = (
  consulta: string,
  item: RegistroNormativa
) => {
  const keywords = extraerKeywords(consulta);
  const textoPlano = normalizarTextoBase(
    `${item.pregunta || ""} ${item.titulo || ""} ${
      item.titulo_articulo || ""
    } ${normalizarContenido(item) || ""}`
  );

  let coincidencias = 0;
  for (const kw of keywords) {
    if (textoPlano.includes(kw)) coincidencias++;
  }

  const ratio = keywords.length > 0 ? coincidencias / keywords.length : 0;

  return {
    keywords,
    coincidencias,
    ratio,
    textoPlano,
  };
};

const esTituloGenericoNoConfiable = (
  item?: RegistroNormativa | null
): boolean => {
  if (!item) return true;

  const titulo = normalizarTextoBase(
    item?.titulo ||
      item?.titulo_articulo ||
      item?.titulo_capitulo ||
      item?.subtitulo ||
      ""
  );

  return TITULOS_GENERICOS_NO_CONFIABLES.some((x) => titulo.includes(x));
};

export const esCoincidenciaLocalConfiable = (
  item?: RegistroNormativa | null
): boolean => {
  if (!item) return false;
  if (!tieneArticulo(item)) return false;
  if (esTituloGenericoNoConfiable(item)) return false;
  return true;
};

const esResultadoConfiableParaConsulta = (
  consulta: string,
  item: RegistroNormativa
): boolean => {
  if (!esCoincidenciaLocalConfiable(item)) {
    return false;
  }

  const consultaNorm = normalizarTextoBase(consulta).trim();
  const { keywords, coincidencias, ratio, textoPlano } =
    calcularCoincidenciasKeywords(consulta, item);

  if (consultaNorm.length >= 5 && textoPlano.includes(consultaNorm)) {
    return true;
  }

  if (!keywords.length) {
    return false;
  }

  if (keywords.length === 1) {
    return coincidencias === 1;
  }

  return coincidencias > 0 && ratio >= 0.5;
};

const nombreNormativa = (origen?: OrigenNormativa): string =>
  origen === "estatuto"
    ? "Estatuto Docente Provincial"
    : "Régimen de Licencias";

const extraerResumenLicencias = (
  datos: RegistroNormativa[]
): ResumenLicenciaItem[] => {
  const tabla = datos.find(
    (item) =>
      normalizarTextoBase(String(item?.titulo || "")) ===
        "resumen de licencia" &&
      (item as any)?.tipo === "tabla" &&
      Array.isArray((item as any)?.contenido)
  ) as any;

  if (!tabla || !Array.isArray(tabla.contenido)) return [];

  return tabla.contenido.filter(
    (fila: any) => fila && fila.articulo && fila.descripcion
  );
};

const parsearArticulosResumen = (
  valor: string | number | undefined
): number[] => {
  const nums =
    String(valor || "")
      .match(/\d+/g)
      ?.map((n) => Number(n))
      .filter((n) => !Number.isNaN(n)) || [];

  return [...new Set(nums)];
};

const buscarResumenPorArticulo = (
  articulo: number,
  datos: RegistroNormativa[]
): ResumenLicenciaItem | null => {
  const resumen = extraerResumenLicencias(datos);

  return (
    resumen.find((fila) =>
      parsearArticulosResumen(fila.articulo).includes(articulo)
    ) || null
  );
};

const buildFuncionariosDesdeResumen = (
  fila?: ResumenLicenciaItem | null
): string => {
  if (!fila) return "";

  const otorgante = (fila.otorgante || "").trim();
  const interviniente = (fila.interviniente || "").trim();

  if (!otorgante && !interviniente) return "";

  let bloque = "\n\n**Funcionarios según el resumen cargado:**\n";

  if (otorgante) {
    bloque += `• **Funcionario Otorgante:** ${otorgante}\n`;
  }

  if (interviniente) {
    bloque += `• **Funcionario Interviniente:** ${interviniente}\n`;
  }

  return bloque.trimEnd();
};

const buildRespuestaAmbiguaConyuge = (): string =>
  "La consulta **“Cónyuge”** es ambigua. Puede corresponder a:\n\n" +
  "• **Artículo 46°**: para acompañar al cónyuge/conviviente.\n" +
  "• **Artículo 48°**: fallecimiento de cónyuge/conviviente.\n" +
  "• **Artículo 28°**: atención de hijos menores ante fallecimiento del cónyuge/conviviente.\n\n" +
  "Escribí una consulta más específica, por ejemplo:\n" +
  "• **Acompañar al cónyuge**\n" +
  "• **Fallecimiento del cónyuge**";

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

const getArticulos = (
  datos: RegistroNormativa[],
  origen: OrigenNormativa,
  numeros: number[]
): RegistroNormativa[] => {
  return numeros
    .map((n) => getArticulo(datos, origen, n))
    .filter(Boolean) as RegistroNormativa[];
};

export const buildRespuestaDesdeArticulo = (
  art: RegistroNormativa,
  datos?: RegistroNormativa[]
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

  const titulo = art?.titulo_articulo || art?.titulo || art?.pregunta || "";
  const normativa = normalizarContenido(art);
  const norma = nombreNormativa(art.origen);

  console.log("[ChatbotLicencias] buildRespuestaDesdeArticulo ->", {
    articulo: num,
    titulo,
    tieneNormativa: normativa.length > 0,
  });

  let encabezado = "";

  if (titulo && num) {
    encabezado = `Tu consulta se relaciona con **${titulo}** (Artículo ${num}) del **${norma}**.\n\n`;
  } else if (num) {
    encabezado = `Tu consulta se relaciona con el **Artículo ${num}** del **${norma}**.\n\n`;
  } else if (titulo) {
    encabezado = `Tu consulta se relaciona con **${titulo}** del **${norma}**.\n\n`;
  } else {
    encabezado = `Te comparto lo que indica el **${norma}** sobre este tema:\n\n`;
  }

  const cuerpo =
    normativa && normativa.trim().length > 0
      ? normativa
      : "No tengo cargado el texto completo de este artículo.";

  let bloqueFuncionarios = "";
  if (datos && art?.origen !== "estatuto") {
    const numArt = Number(num);
    if (!Number.isNaN(numArt)) {
      const filaResumen = buscarResumenPorArticulo(numArt, datos);
      bloqueFuncionarios = buildFuncionariosDesdeResumen(filaResumen);
    }
  }

  return encabezado + cuerpo + bloqueFuncionarios;
};

const buildRespuestaDesdeArticulos = (
  origen: OrigenNormativa,
  articulos: RegistroNormativa[],
  introduccion: string,
  datos?: RegistroNormativa[]
): string | null => {
  if (!articulos.length) return null;

  const norma = nombreNormativa(origen);
  const textos = articulos
    .map((a) => {
      const num = a.articulo ?? a.numero ?? "";
      const titulo = a.titulo_articulo || a.titulo || "";
      const cuerpo = normalizarContenido(a);

      return [
        `**Artículo ${num}${titulo ? ` – ${titulo}` : ""}**`,
        cuerpo,
      ]
        .filter(Boolean)
        .join("\n\n");
    })
    .join("\n\n");

  let bloqueFuncionarios = "";
  if (datos && origen === "licencia") {
    const filasUnicas = articulos
      .map((a) => buscarResumenPorArticulo(Number(a.articulo), datos))
      .filter(Boolean)
      .filter(
        (fila, index, arr) =>
          arr.findIndex((x) => x?.articulo === fila?.articulo) === index
      ) as ResumenLicenciaItem[];

    if (filasUnicas.length) {
      bloqueFuncionarios =
        "\n\n**Funcionarios según el resumen cargado:**\n" +
        filasUnicas
          .map((fila) => {
            const partes = [
              `• **${fila.descripcion}**`,
              fila.otorgante
                ? `  - Funcionario Otorgante: ${fila.otorgante}`
                : "",
              fila.interviniente
                ? `  - Funcionario Interviniente: ${fila.interviniente}`
                : "",
            ].filter(Boolean);
            return partes.join("\n");
          })
          .join("\n");
    }
  }

  return `${introduccion}\n\nNormativa consultada: **${norma}**.\n\n${textos}${bloqueFuncionarios}`;
};

const resolverConsultaPorResumenLicencias = (
  consulta: string,
  datos: RegistroNormativa[]
): string | null => {
  const resumen = extraerResumenLicencias(datos);
  if (!resumen.length) return null;

  const consultaNorm = normalizarTextoBase(consulta);

  const filasPreparadas = resumen.map((fila) => ({
    ...fila,
    textoBusqueda: normalizarTextoBase(
      `${fila.descripcion || ""} ${fila.articulo || ""} ${fila.otorgante || ""} ${fila.interviniente || ""}`
    ),
  }));

  const exacta = filasPreparadas.find((fila) =>
    fila.textoBusqueda.includes(consultaNorm)
  );

  const mejorFila = exacta
    ? exacta
    : filasPreparadas
        .map((fila) => {
          const keywords = extraerKeywords(consulta);
          let coincidencias = 0;
          for (const kw of keywords) {
            if (fila.textoBusqueda.includes(kw)) coincidencias++;
          }
          const ratio = keywords.length ? coincidencias / keywords.length : 0;
          return { fila, coincidencias, ratio };
        })
        .filter((x) => x.coincidencias > 0 && x.ratio >= 0.5)
        .sort(
          (a, b) => b.ratio - a.ratio || b.coincidencias - a.coincidencias
        )[0]?.fila;

  if (!mejorFila) return null;

  let articulos = parsearArticulosResumen(mejorFila.articulo);

  if (
    normalizarTextoBase(mejorFila.descripcion).includes(
      "licencia anual ordinaria"
    ) &&
    articulos.includes(12) &&
    !articulos.includes(13)
  ) {
    articulos = [12, 13];
  }

  if (
    normalizarTextoBase(consulta).includes("franquicia") ||
    normalizarTextoBase(consulta).includes("franquicias")
  ) {
    articulos = [57, 58, 59, 60, 61];
  }

  const articulosReales = articulos
    .map((n) => getArticulo(datos, "licencia", n))
    .filter(Boolean) as RegistroNormativa[];

  if (!articulosReales.length) return null;

  const intro = `Tu consulta se relaciona con **${mejorFila.descripcion}**.`;

  return buildRespuestaDesdeArticulos(
    "licencia",
    articulosReales,
    intro,
    datos
  );
};

const buildRespuestaFallecimiento = (
  consulta: string,
  datos: RegistroNormativa[]
): string | null => {
  const t = normalizarTextoBase(consulta);

  if (
    !(
      t.includes("fallec") ||
      t.includes("murio") ||
      t.includes("muerte") ||
      t.includes("duelo")
    )
  ) {
    return null;
  }

  const art48 = getArticulo(datos, "licencia", 48);
  const normativa48 = art48 ? normalizarContenido(art48) : "";

  const grupoARegex =
    /(padre|madre|papa|mama|hijo|hija|hije|conyuge|conviviente|esposo|esposa|marido|mujer)/;
  const grupoBRegex =
    /(hermano|hermana|hermanos|hermanas|abuelo|abuela|abuelos|abuelas|nieto|nieta|nietos|nietas|suegro|suegra|suegros|suegras|yerno|nuera|yernos|nueras|cuñado|cuñada|cuñados|cuñadas|hijastro|hijastra|hijastros|hijastras|hijos politicos|persona a cargo|tutor legal)/;
  const grupoCRegex =
    /(tio|tia|tios|tias|primo|prima|primos|primas|sobrino|sobrina|sobrinos|sobrinas|bisabuelo|bisabuela|bisabuelos|bisabuelas|bisnieto|bisnieta|bisnietos|bisnietas|3er grado|tercer grado|4to grado|cuarto grado)/;

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
  datos: RegistroNormativa[]
): string | null => {
  const arts = getArticulos(datos, "licencia", [20, 21, 22]);

  return buildRespuestaDesdeArticulos(
    "licencia",
    arts,
    "La **licencia por enfermedad de largo tratamiento** está regulada por los **Artículos 20°, 21° y 22°**.",
    datos
  );
};

const buildRespuestaMaternidad = (
  consulta: string,
  datos: RegistroNormativa[]
): string | null => {
  const t = normalizarTextoBase(consulta);

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
    "La **licencia por maternidad** otorga, en términos generales, **hasta ciento veinte (120) días corridos** de licencia, distribuidos entre un período anterior y otro posterior al parto, sin que este último pueda superar los **noventa (90) días** posteriores a la fecha del nacimiento.\n\n" +
    "La norma prevé además situaciones especiales donde pueden extenderse o modificarse los plazos.\n\n";

  if (normativa27) {
    respuesta +=
      "Te comparto el texto del **Artículo 27° – Maternidad**:\n\n" +
      normativa27;

    const filaResumen = buscarResumenPorArticulo(27, datos);
    const bloqueFuncionarios = buildFuncionariosDesdeResumen(filaResumen);
    if (bloqueFuncionarios) {
      respuesta += bloqueFuncionarios;
    }
  }

  return respuesta;
};

const buildRespuestaSuperposicionHoraria = (
  datos: RegistroNormativa[]
): string | null => {
  const arts = getArticulos(datos, "licencia", [53, 54]);

  return buildRespuestaDesdeArticulos(
    "licencia",
    arts,
    "La **superposición de horarios** está contemplada en los **Artículos 53° y 54°** del Régimen de Licencias.",
    datos
  );
};

const buildRespuestaTardanza = (datos: RegistroNormativa[]): string | null => {
  const arts = getArticulos(datos, "licencia", [78, 83]);

  return buildRespuestaDesdeArticulos(
    "licencia",
    arts,
    "La normativa sobre **tardanzas** está prevista en los **Artículos 78° y 83°**.",
    datos
  );
};

const buildRespuestaAusenciaInjustificada = (
  datos: RegistroNormativa[]
): string | null => {
  const arts = getArticulos(datos, "licencia", [80, 84, 85, 86]);

  return buildRespuestaDesdeArticulos(
    "licencia",
    arts,
    "La normativa sobre **ausencia injustificada** y **abandono de servicio** está prevista en los **Artículos 80°, 84°, 85° y 86°**.",
    datos
  );
};

const buildRespuestaFranquicias = (
  datos: RegistroNormativa[]
): string | null => {
  const arts = getArticulos(datos, "licencia", [57, 58, 59, 60, 61]);

  return buildRespuestaDesdeArticulos(
    "licencia",
    arts,
    "Las **franquicias** están previstas en los **Artículos 57°, 58°, 59°, 60° y 61°** del Régimen de Licencias.",
    datos
  );
};

const buildRespuestaIncapacidad = (
  datos: RegistroNormativa[]
): string | null => {
  const arts = getArticulos(datos, "licencia", [23, 24]);

  return buildRespuestaDesdeArticulos(
    "licencia",
    arts,
    "La **incapacidad** está regulada por los **Artículos 23° y 24°** del Régimen de Licencias.",
    datos
  );
};

const buildRespuestaComisionServicios = (
  datos: RegistroNormativa[]
): string | null => {
  const art = getArticulo(datos, "licencia", 56);
  if (!art) return null;
  return buildRespuestaDesdeArticulo(art, datos);
};

export const resolverConsultaEspecial = (
  consulta: string,
  datos: RegistroNormativa[]
): string | null => {
  const t = normalizarTextoBase(consulta);

  const respFallecimiento = buildRespuestaFallecimiento(t, datos);
  if (respFallecimiento) return respFallecimiento;

  if (
    t.includes("largo trat") ||
    t.includes("tratamiento prolongado") ||
    t.includes("enfermedad prolongada") ||
    t.includes("enfermedad de largo") ||
    t.includes("oncolog")
  ) {
    const respLT = buildRespuestaLargoTratamiento(datos);
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

  if (
    t.includes("superposicion horaria") ||
    t.includes("superposicion de horarios") ||
    t.includes("horarios superpuestos")
  ) {
    const respSH = buildRespuestaSuperposicionHoraria(datos);
    if (respSH) return respSH;
  }

  if (t.includes("tardanza") || t.includes("tardanzas")) {
    const respTar = buildRespuestaTardanza(datos);
    if (respTar) return respTar;
  }

  if (
    t.includes("ausencia injustificada") ||
    t.includes("ausencias injustificadas") ||
    t.includes("abandono de servicio")
  ) {
    const respAus = buildRespuestaAusenciaInjustificada(datos);
    if (respAus) return respAus;
  }

  if (t.includes("franquicia") || t.includes("franquicias")) {
    const respFranq = buildRespuestaFranquicias(datos);
    if (respFranq) return respFranq;
  }

  if (t.includes("incapacidad")) {
    const respInc = buildRespuestaIncapacidad(datos);
    if (respInc) return respInc;
  }

  if (
    t.includes("comision de servicio") ||
    t.includes("comision de servicios")
  ) {
    const respCS = buildRespuestaComisionServicios(datos);
    if (respCS) return respCS;
  }

  return null;
};

const resolverTemaLicencias = (consulta: string): EstrategiaLicencia => {
  const q = normalizarTextoBase(consulta);

  if (
    q.includes("licencia anual ordinaria") ||
    q.includes("anual ordinaria") ||
    q.includes("descanso anual") ||
    q.includes("vacaciones")
  ) {
    return { tipo: "articulos_multiples", articulos: [12, 13] };
  }

  if (q.includes("receso escolar") || q.includes("lapsos entre ciclos")) {
    return { tipo: "articulo_exacto", articulo: 12 };
  }

  if (q.includes("corto tratamiento")) {
    return { tipo: "articulos_multiples", articulos: [16, 17] };
  }

  if (
    q.includes("fallecimiento") ||
    q.includes("duelo") ||
    incluyeTodos(q, "por", "fallecimiento")
  ) {
    return { tipo: "articulo_exacto", articulo: 48 };
  }

  if (
    q.includes("enfermedad en hora de labor") ||
    q.includes("hora de labor")
  ) {
    return { tipo: "articulo_exacto", articulo: 18 };
  }

  if (
    q.includes("accidente de trabajo") ||
    q.includes("enfermedad profesional")
  ) {
    return { tipo: "articulo_exacto", articulo: 19 };
  }

  if (q.includes("incapacidad")) {
    return { tipo: "articulos_multiples", articulos: [23, 24] };
  }

  if (q.includes("cambio de funciones")) {
    return { tipo: "articulo_exacto", articulo: 25 };
  }

  if (q.includes("violencia de genero") || q.includes("violencia genero")) {
    return { tipo: "articulo_exacto", articulo: 26 };
  }

  if (
    q.includes("atencion de hijos menores") ||
    q.includes("atencion hijos menores") ||
    q.includes("hijo menor") ||
    q.includes("hijos menores")
  ) {
    return { tipo: "articulo_exacto", articulo: 28 };
  }

  if (
    q.includes("tenencia con fines de adopcion") ||
    q.includes("tenencia") ||
    q.includes("adopcion")
  ) {
    return { tipo: "articulo_exacto", articulo: 29 };
  }

  if (
    q.includes("grupo familiar") ||
    q.includes("atencion del grupo familiar") ||
    q.includes("atencion de grupo familiar") ||
    q.includes("familiar enfermo")
  ) {
    return { tipo: "articulo_exacto", articulo: 30 };
  }

  if (
    q.includes("matrimonio del docente") ||
    q.includes("casamiento") ||
    q.includes("contraer matrimonio") ||
    q === "matrimonio"
  ) {
    return { tipo: "articulo_exacto", articulo: 31 };
  }

  if (q.includes("aislamiento")) {
    return { tipo: "articulo_exacto", articulo: 32 };
  }

  if (q.includes("persona disfuncionada") || q.includes("disfuncionada")) {
    return { tipo: "articulo_exacto", articulo: 33 };
  }

  if (
    q.includes("actividad educativa") ||
    q.includes("actividad cientifica") ||
    q.includes("actividad cultural") ||
    q.includes("actividad tecnologica") ||
    q.includes("actividades de interes educativo") ||
    q.includes("actividades de interes cientifico") ||
    q.includes("actividades de interes cultural") ||
    q.includes("actividades de interes tecnologico")
  ) {
    return { tipo: "articulo_exacto", articulo: 38 };
  }

  if (
    q.includes("actividades deportivas") ||
    q.includes("deportivas no rentadas")
  ) {
    return { tipo: "articulo_exacto", articulo: 39 };
  }

  if (q.includes("donacion de sangre")) {
    return { tipo: "articulo_exacto", articulo: 50 };
  }

  if (q.includes("donacion de organos")) {
    return { tipo: "articulo_exacto", articulo: 51 };
  }

  if (q.includes("asunto particular") || q.includes("asuntos particulares")) {
    return { tipo: "articulo_exacto", articulo: 45 };
  }

  if (
    q.includes("razones particular") ||
    q.includes("razones particulares") ||
    q.includes("razones especiales") ||
    q.includes("razones especiales o particulares")
  ) {
    return { tipo: "articulo_exacto", articulo: 52 };
  }

  if (
    q.includes("razones extraordinaria") ||
    q.includes("razones extraordinarias") ||
    q.includes("fuerza mayor") ||
    q.includes("fenomenos meteorologicos")
  ) {
    return { tipo: "articulo_exacto", articulo: 49 };
  }

  if (
    q.includes("superposicion horaria") ||
    q.includes("superposicion de horarios") ||
    q.includes("superposicion") ||
    q.includes("horarios superpuestos")
  ) {
    return { tipo: "articulos_multiples", articulos: [53, 54] };
  }

  if (
    q.includes("festividad religiosa") ||
    q.includes("festividades religiosas") ||
    (q.includes("religiosa") && q.includes("festividad"))
  ) {
    return { tipo: "articulo_exacto", articulo: 55 };
  }

  if (
    q.includes("comision de servicio") ||
    q.includes("comision de servicios") ||
    incluyeTodos(q, "comision", "servicio") ||
    incluyeTodos(q, "comision", "servicios")
  ) {
    return { tipo: "articulo_exacto", articulo: 56 };
  }

  if (
    incluyeTodos(q, "tramites", "personales") ||
    incluyeTodos(q, "tramite", "personal") ||
    incluyeTodos(q, "citaciones", "tramites") ||
    incluyeTodos(q, "citacion", "tramite") ||
    q.includes("citaciones y tramites personales")
  ) {
    return { tipo: "articulo_exacto", articulo: 60 };
  }

  if (q.includes("franquicia") || q.includes("franquicias")) {
    return { tipo: "articulos_multiples", articulos: [57, 58, 59, 60, 61] };
  }

  if (q.includes("citacion") || q.includes("citaciones")) {
    return { tipo: "articulo_exacto", articulo: 60 };
  }

  if (
    q.includes("horario para estudiantes") ||
    q.includes("horarios para estudiantes") ||
    (q.includes("estudiante") && q.includes("horario")) ||
    (q.includes("estudiantes") && q.includes("horario"))
  ) {
    return { tipo: "articulo_exacto", articulo: 58 };
  }

  if (q.includes("lactancia") || q.includes("madre lactante")) {
    return { tipo: "articulo_exacto", articulo: 59 };
  }

  if (
    incluyeTodos(q, "delegado", "gremial") ||
    incluyeTodos(q, "delegado", "gremiales") ||
    incluyeTodos(q, "delegados", "gremiales")
  ) {
    return { tipo: "articulo_exacto", articulo: 61 };
  }

  if (
    q.includes("licencia gremial") ||
    q.includes("representacion gremial") ||
    q === "gremial"
  ) {
    return { tipo: "articulos_multiples", articulos: [34, 40] };
  }

  if (
    q.includes("acompanar al conyuge") ||
    q.includes("acompanar al conviviente") ||
    q.includes("acompanar al concubino")
  ) {
    return { tipo: "articulo_exacto", articulo: 46 };
  }

  if (q.includes("capacitacion") || q.includes("capacitaciones")) {
    return { tipo: "articulo_exacto", articulo: 41 };
  }

  if (q.includes("perfeccionamiento")) {
    return { tipo: "articulo_exacto", articulo: 41 };
  }

  if (
    q.includes("candidatura a cargos electivos") ||
    q.includes("cargo electivo") ||
    q.includes("cargos electivos")
  ) {
    return { tipo: "articulo_exacto", articulo: 42 };
  }

  if (q.includes("funciones superiores de gobierno")) {
    return { tipo: "articulo_exacto", articulo: 43 };
  }

  if (
    q.includes("mayor jerarquia") ||
    q.includes("cargo de mayor jerarquia")
  ) {
    return { tipo: "articulo_exacto", articulo: 44 };
  }

  if (q.includes("pago de haberes") || q.includes("liquidacion de haberes")) {
    return { tipo: "articulo_exacto", articulo: 77 };
  }

  if (q.includes("tardanza") || q.includes("tardanzas")) {
    return { tipo: "articulos_multiples", articulos: [78, 83] };
  }

  if (
    q.includes("ausencia injustificada") ||
    q.includes("ausencias injustificadas") ||
    q.includes("abandono de servicio")
  ) {
    return { tipo: "articulos_multiples", articulos: [80, 84, 85, 86] };
  }

  if (q.includes("examen") || q.includes("examenes")) {
    return { tipo: "articulo_exacto", articulo: 35 };
  }

  if (q.includes("practicas")) {
    return { tipo: "articulo_exacto", articulo: 36 };
  }

  if (
    q.includes("postgrado") ||
    q.includes("investigacion") ||
    q.includes("investigaciones")
  ) {
    return { tipo: "articulo_exacto", articulo: 37 };
  }

  if (q.includes("por estudios") || q === "estudios" || q === "estudio") {
    return { tipo: "articulos_multiples", articulos: [35, 36, 37] };
  }

  if (q.includes("accidente")) {
    return { tipo: "backend_licencias" };
  }

  return null;
};

const resolverTemaEstatuto = (consulta: string): EstrategiaEstatuto => {
  const q = normalizarTextoBase(consulta);

  if (q.includes("derechos del docente") || q === "derechos") {
    return { tipo: "articulo_exacto", articulo: 6 };
  }

  if (q.includes("deberes del docente") || q === "deberes") {
    return { tipo: "articulo_exacto", articulo: 5 };
  }

  if (
    q.includes("junta de clasificacion") ||
    q.includes("juntas de clasificacion")
  ) {
    return { tipo: "articulos_multiples", articulos: [9, 10, 11] };
  }

  if (q.includes("ingreso a la docencia")) {
    return {
      tipo: "articulos_multiples",
      articulos: [12, 13, 14, 15, 16, 17, 18, 19],
    };
  }

  if (q.includes("estabilidad")) {
    return { tipo: "articulos_multiples", articulos: [21, 22] };
  }

  if (q.includes("ascenso") || q.includes("ascensos")) {
    return {
      tipo: "articulos_multiples",
      articulos: [26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    };
  }

  if (
    q.includes("traslado") ||
    q.includes("traslados") ||
    q.includes("permuta") ||
    q.includes("permutas")
  ) {
    return {
      tipo: "articulos_multiples",
      articulos: [37, 38, 39, 40, 41, 42, 43],
    };
  }

  if (q.includes("remuneracion") || q.includes("remuneraciones")) {
    return {
      tipo: "articulos_multiples",
      articulos: [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
    };
  }

  if (
    q.includes("sancion") ||
    q.includes("sanciones") ||
    q.includes("disciplina")
  ) {
    return {
      tipo: "articulos_multiples",
      articulos: [61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
    };
  }

  return null;
};

const resolverConsultaPorArticuloGlobal = (
  consulta: string,
  datos: RegistroNormativa[]
): string | null => {
  const num = extraerNumeroArticuloConsulta(consulta);
  if (num === null) return null;

  const q = normalizarTextoBase(consulta);
  const mencionaEstatuto = q.includes("estatuto");
  const mencionaLicencias =
    q.includes("licencia") ||
    q.includes("licencias") ||
    KEYWORDS_LICENCIAS.some((k) => q.includes(k));

  if (mencionaEstatuto) {
    const art = getArticulo(datos, "estatuto", num);
    if (art) return buildRespuestaDesdeArticulo(art, datos);
    return `No encontré el **Artículo ${num}** dentro del **Estatuto Docente Provincial**.`;
  }

  if (mencionaLicencias) {
    const art = getArticulo(datos, "licencia", num);
    if (art) return buildRespuestaDesdeArticulo(art, datos);
    return `No encontré el **Artículo ${num}** dentro del **Régimen de Licencias**.`;
  }

  const artLic = getArticulo(datos, "licencia", num);
  const artEst = getArticulo(datos, "estatuto", num);

  if (artLic && artEst) {
    return (
      `Encontré un **Artículo ${num}** tanto en el **Régimen de Licencias** como en el **Estatuto Docente Provincial**.\n\n` +
      `Indicame cuál querés consultar:\n` +
      `• **Artículo ${num} del Régimen de Licencias**\n` +
      `• **Artículo ${num} del Estatuto Docente**`
    );
  }

  if (artLic) return buildRespuestaDesdeArticulo(artLic, datos);
  if (artEst) return buildRespuestaDesdeArticulo(artEst, datos);

  return `No encontré el **Artículo ${num}** en la base local cargada.`;
};

export const resolverConsultaGenericaLicencias = (
  consulta: string,
  datos: RegistroNormativa[]
): string | null => {
  const t = normalizarTextoBase(consulta);
  const tNorm = normalizarTextoBase(consulta).trim();

  console.log("========================================");
  console.log("[ChatbotLicencias] resolverConsultaGenericaLicencias");
  console.log("[ChatbotLicencias] consulta:", consulta);

  const baseLicencias = datos.filter((d) => d.origen === "licencia");

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
  console.log("[ChatbotLicencias] total soloLicencias:", soloLicencias.length);

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
      return buildRespuestaDesdeArticulo(anexoII, datos);
    }
  }

  let numArticulo: number | null = null;

  const patronesArticulo = [
    /\bart[íi]?culos?\s+(\d+)\b/,
    /\barts?\.?\s*(\d+)\b/,
    /^\s*(\d{1,3})\s*$/,
  ];

  for (const patron of patronesArticulo) {
    const match = tNorm.match(patron);
    if (match?.[1]) {
      const n = parseInt(match[1], 10);
      if (!Number.isNaN(n)) {
        numArticulo = n;
        break;
      }
    }
  }

  if (numArticulo !== null) {
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
      return buildRespuestaDesdeArticulo(art, datos);
    }
  }

  if (esConsultaAmbiguaConyuge(consulta)) {
    return buildRespuestaAmbiguaConyuge();
  }

  const matchLicencia = t.match(/licencia\s+(por|para)\s+(.+)/);
  if (matchLicencia) {
    const fraseClave = matchLicencia[2].trim();
    const resultadosPorFrase = buscarInteligente(
      fraseClave,
      soloLicenciasSinAnexo
    );

    if (resultadosPorFrase.length > 0) {
      const mejor = resultadosPorFrase[0];
      const confiable = esResultadoConfiableParaConsulta(fraseClave, mejor);

      if (confiable) {
        return buildRespuestaDesdeArticulo(mejor, datos);
      }
    }
  }

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
    const mejor = resultados[0];
    const confiable = esResultadoConfiableParaConsulta(consulta, mejor);

    console.log("[ChatbotLicencias] validación fallback Fuse:", {
      articulo:
        mejor.articulo ||
        (mejor as any).numero ||
        mejor.titulo ||
        (mejor as any).titulo_articulo,
      confiable,
    });

    if (confiable) {
      return buildRespuestaDesdeArticulo(mejor, datos);
    }
  }

  console.log("[ChatbotLicencias] sin coincidencias relevantes");
  return null;
};

export const resolverConsultaGenericaEstatuto = (
  consulta: string,
  datos: RegistroNormativa[]
): string | null => {
  const soloEstatuto = datos.filter((d) => d.origen === "estatuto");
  const resultados = buscarInteligente(consulta, soloEstatuto);

  if (
    resultados.length > 0 &&
    esResultadoConfiableParaConsulta(consulta, resultados[0])
  ) {
    return buildRespuestaDesdeArticulo(resultados[0], datos);
  }

  return null;
};

export const buscarInteligente = (
  consulta: string | Expression,
  datos: RegistroNormativa[]
): RegistroNormativa[] => {
  if (!consulta || !datos || !datos.length) return [];

  const consultaTexto =
    typeof consulta === "string" ? consulta : JSON.stringify(consulta);

  const consultaNorm = normalizarTextoBase(consultaTexto).trim();
  const keywords = extraerKeywords(consultaTexto);

  const datosNormalizados = datos.map((item: RegistroNormativa) => {
    const contenido = normalizarContenido(item);
    const etiquetaOriginal =
      item.pregunta ||
      item.titulo_articulo ||
      item.titulo ||
      (item.articulo ? `Artículo ${item.articulo}` : "");

    const pregunta = etiquetaOriginal;

    const textoBusqueda = normalizarTextoBase(
      `${pregunta} ${contenido || ""}`
    );

    return { ...item, contenido, pregunta, textoBusqueda };
  });

  if (consultaNorm.length >= 4) {
    const exactos = datosNormalizados.filter((item) =>
      item.textoBusqueda.includes(consultaNorm)
    );

    if (exactos.length > 0) {
      const exactosConfiables = exactos.filter((item) =>
        esCoincidenciaLocalConfiable(item)
      );

      if (exactosConfiables.length > 0) {
        const mejorExacto = exactosConfiables.sort((a, b) => {
          const aTiene = tieneArticulo(a) ? 1 : 0;
          const bTiene = tieneArticulo(b) ? 1 : 0;
          return bTiene - aTiene;
        })[0];

        return [mejorExacto as RegistroNormativa];
      }
    }
  }

  const fuse = new Fuse(datosNormalizados as any[], {
    keys: ["pregunta", "contenido"],
    threshold: 0.22,
    minMatchCharLength: 4,
    includeScore: true,
    ignoreLocation: true,
  });

  const resultados = fuse.search(consulta as any);
  if (!resultados.length) return [];

  const evaluados = resultados
    .map((res) => {
      const item = res.item as RegistroNormativa & { textoBusqueda: string };

      let coincidencias = 0;
      for (const kw of keywords) {
        if (item.textoBusqueda.includes(kw)) coincidencias++;
      }

      const ratioKeywords =
        keywords.length > 0 ? coincidencias / keywords.length : 0;

      return {
        item,
        coincidencias,
        ratioKeywords,
        tieneArt: tieneArticulo(item),
        fuseScore: typeof res.score === "number" ? res.score : 1,
      };
    })
    .filter((r) => {
      if (!esCoincidenciaLocalConfiable(r.item)) return false;

      if (!keywords.length) {
        return r.fuseScore <= 0.12;
      }

      if (r.coincidencias === 0) return false;

      return r.ratioKeywords >= 0.5 || r.fuseScore <= 0.08;
    });

  if (!evaluados.length) {
    console.log(
      "[ChatbotLicencias] buscarInteligente -> sin coincidencias suficientemente fuertes"
    );
    return [];
  }

  evaluados.sort((a, b) => {
    if (b.ratioKeywords !== a.ratioKeywords) {
      return b.ratioKeywords - a.ratioKeywords;
    }
    if (b.coincidencias !== a.coincidencias) {
      return b.coincidencias - a.coincidencias;
    }
    if (a.tieneArt !== b.tieneArt) {
      return b.tieneArt ? 1 : -1;
    }
    return a.fuseScore - b.fuseScore;
  });

  return [evaluados[0].item as RegistroNormativa];
};

const resolverConsultaLocalLicenciasInterna = (
  consulta: string,
  datos: RegistroNormativa[]
): string | null => {
  const consultaLimpia = consulta?.trim();
  if (!consultaLimpia || !Array.isArray(datos) || !datos.length) return null;

  if (esConsultaAmbiguaConyuge(consultaLimpia)) {
    return buildRespuestaAmbiguaConyuge();
  }

  const especial = resolverConsultaEspecial(consultaLimpia, datos);
  if (especial) {
    console.log("[ChatbotLicencias] respuesta local -> especial");
    return especial;
  }

  const porResumen = resolverConsultaPorResumenLicencias(consultaLimpia, datos);
  if (porResumen) {
    console.log("[ChatbotLicencias] respuesta local -> resumen de licencia");
    return porResumen;
  }

  const temaLicencia = resolverTemaLicencias(consultaLimpia);

  if (temaLicencia?.tipo === "articulo_exacto") {
    const art = getArticulo(datos, "licencia", temaLicencia.articulo);
    if (art) {
      console.log("[ChatbotLicencias] respuesta local -> artículo exacto", {
        articulo: temaLicencia.articulo,
      });
      return buildRespuestaDesdeArticulo(art, datos);
    }
  }

  if (temaLicencia?.tipo === "articulos_multiples") {
    const arts = getArticulos(datos, "licencia", temaLicencia.articulos);
    const intro = `Tu consulta se relaciona con los **Artículos ${temaLicencia.articulos.join(
      ", "
    )}** del **Régimen de Licencias**.`;
    const respuesta = buildRespuestaDesdeArticulos(
      "licencia",
      arts,
      intro,
      datos
    );
    if (respuesta) {
      console.log("[ChatbotLicencias] respuesta local -> múltiples artículos", {
        articulos: temaLicencia.articulos,
      });
      return respuesta;
    }
  }

  if (temaLicencia?.tipo === "backend_licencias") {
    console.log("[ChatbotLicencias] tema amplio de licencias -> derivar a IA");
    return null;
  }

  const generica = resolverConsultaGenericaLicencias(consultaLimpia, datos);
  if (generica) {
    console.log("[ChatbotLicencias] respuesta local -> genérica");
    return generica;
  }

  console.log("[ChatbotLicencias] sin respuesta local, derivar a IA");
  return null;
};

const resolverConsultaLocalEstatutoInterna = (
  consulta: string,
  datos: RegistroNormativa[]
): string | null => {
  const consultaLimpia = consulta?.trim();
  if (!consultaLimpia || !Array.isArray(datos) || !datos.length) return null;

  const tema = resolverTemaEstatuto(consultaLimpia);

  if (tema?.tipo === "articulo_exacto") {
    const art = getArticulo(datos, "estatuto", tema.articulo);
    if (art) {
      return buildRespuestaDesdeArticulo(art, datos);
    }
  }

  if (tema?.tipo === "articulos_multiples") {
    const arts = getArticulos(datos, "estatuto", tema.articulos);
    const intro = `Tu consulta se relaciona con los **Artículos ${tema.articulos.join(
      ", "
    )}** del **Estatuto Docente Provincial**.`;
    const respuesta = buildRespuestaDesdeArticulos(
      "estatuto",
      arts,
      intro,
      datos
    );
    if (respuesta) {
      return respuesta;
    }
  }

  return resolverConsultaGenericaEstatuto(consultaLimpia, datos);
};

export const resolverConsultaLocalNormativa = (
  consulta: string,
  datos: RegistroNormativa[]
): string | null => {
  const consultaLimpia = consulta?.trim();
  if (!consultaLimpia || !Array.isArray(datos) || !datos.length) return null;

  const porArticulo = resolverConsultaPorArticuloGlobal(consultaLimpia, datos);
  if (porArticulo) {
    return porArticulo;
  }

  const dominio = detectarDominioBackend(consultaLimpia);

  if (dominio === "licencias") {
    return resolverConsultaLocalLicenciasInterna(consultaLimpia, datos);
  }

  if (dominio === "estatuto") {
    return resolverConsultaLocalEstatutoInterna(consultaLimpia, datos);
  }

  return null;
};

export const resolverConsultaLocalLicencias = (
  consulta: string,
  datos: RegistroNormativa[]
): string | null => {
  return resolverConsultaLocalLicenciasInterna(consulta, datos);
};

export const tieneRespuestaLocalLicencias = (
  consulta: string,
  datos: RegistroNormativa[]
): boolean => {
  return resolverConsultaLocalLicenciasInterna(consulta, datos) !== null;
};
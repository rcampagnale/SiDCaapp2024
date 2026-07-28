type PersonaFuente = Record<string, any> | null | undefined;

const limpiar = (value: any) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const esValorInvalido = (value: any) => {
  const normalizado = limpiar(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return [
    "",
    "sin apellido",
    "sin nombre",
    "s/apellido",
    "s/nombre",
    "sin datos",
    "no informado",
    "no informa",
  ].includes(normalizado);
};

const separarApellidoNombre = (value: any) => {
  const texto = limpiar(value);
  const coma = texto.indexOf(",");

  if (coma <= 0 || coma >= texto.length - 1) return null;

  const apellido = limpiar(texto.slice(0, coma));
  const nombre = limpiar(texto.slice(coma + 1));

  if (esValorInvalido(apellido) || esValorInvalido(nombre)) return null;
  return { apellido, nombre };
};

const primerValorValido = (values: any[]) => {
  const encontrado = values.map(limpiar).find((value) => !esValorInvalido(value));
  return encontrado || "";
};

export const normalizarNombrePersona = (fuente: PersonaFuente) => {
  const data = fuente || {};

  let apellido = primerValorValido([
    data.apellido,
    data.Apellido,
    data.apellidos,
    data.lastName,
  ]);
  let nombre = primerValorValido([
    data.nombre,
    data.Nombre,
    data.nombres,
    data.firstName,
  ]);

  const candidatosCompletos = [
    data.apellidoNombre,
    data.apellidoYNombre,
    data.nombreCompleto,
    data.NombreCompleto,
    data.displayName,
    data.fullName,
    nombre,
    apellido,
  ];

  const combinadoSeparado = candidatosCompletos
    .map(separarApellidoNombre)
    .find(Boolean);

  if ((!apellido || !nombre) && combinadoSeparado) {
    apellido = combinadoSeparado.apellido;
    nombre = combinadoSeparado.nombre;
  }

  // Evita repetir el apellido cuando `nombre` ya contiene "Apellido, Nombre".
  const nombreSeparado = separarApellidoNombre(nombre);
  if (nombreSeparado) {
    apellido = apellido || nombreSeparado.apellido;
    nombre = nombreSeparado.nombre;
  }

  const nombreCompleto =
    apellido && nombre ? `${apellido}, ${nombre}` : nombre || apellido || "Afiliado/a";

  return { apellido, nombre, nombreCompleto };
};

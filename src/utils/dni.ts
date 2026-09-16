/**
 * Devuelve el DNI en su forma canónica: únicamente dígitos, hasta 9.
 * Mantener esta función pequeña permite que los flujos que necesiten
 * comparar identidad usen exactamente la misma representación.
 */
export const normalizarDni = (valor: unknown): string =>
  String(valor ?? "").replace(/\D/g, "").slice(0, 9);

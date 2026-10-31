
const FACTORES_ANTIGUEDAD = {
  menos1: 1.0,
  '1a2': 1.1,
  mas2: 1.25
};

/**
 * cuota = Math.round(valor * tasaAnual / 12 * factorAntiguedad)
 */
export function calcularCuota(valorEquipo, tasaAnual, antiguedad) {
  const factor = FACTORES_ANTIGUEDAD[antiguedad] ?? 1;
  return Math.round(valorEquipo * tasaAnual / 12 * factor);
}

/**
 * Formatea un número como moneda ARS sin decimales.
 */
export function formatearMoneda(numero) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(numero);
}
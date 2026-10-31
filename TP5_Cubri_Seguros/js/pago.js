
/**
 * Simula el pago. Tarda 1.5 s y rechaza solo la tarjeta de prueba
 * 4000 0000 0000 0002.
 */
export function simularPago(numero) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const limpio = numero.replace(/\s/g, '');
      resolve(
        limpio === '4000000000000002'
          ? { ok: false, motivo: 'Tarjeta rechazada' }
          : { ok: true }
      );
    }, 1500);
  });
}

let contadorPoliza = 123; 

/**
 * Genera un número de póliza con formato POL-AAAA-NNNNNN.
 */
export function generarPoliza() {
  const anio = new Date().getFullYear();
  const nro = String(contadorPoliza).padStart(6, '0');
  contadorPoliza++;
  return `POL-${anio}-${nro}`;
}

// ---------- EQUIPO ----------
export function validarMarca(valor) {
  return valor ? null : 'Elegí una marca';
}

export function validarModelo(valor) {
  if (!valor || valor.trim().length < 2 || valor.trim().length > 40) {
    return 'Ingresá el modelo del equipo';
  }
  return null;
}

export function validarValor(valor) {
  const n = Number(String(valor).replace(/\D/g, ''));
  if (isNaN(n) || n < 100000 || n > 2500000) {
    return 'El valor debe estar entre $100.000 y $2.500.000';
  }
  return null;
}

export function validarAntiguedad(valor) {
  return ['menos1', '1a2', 'mas2'].includes(valor) ? null : 'Indicá la antigüedad';
}

// ---------- TITULAR ----------
export function validarNombre(valor) {
  if (!valor || valor.trim().length < 2) return 'Ingresá tu nombre';
  
  if (/\d/.test(valor)) return 'El nombre no puede contener números';
  return null;
}

export function validarApellido(valor) {
  if (!valor || valor.trim().length < 2) return 'Ingresá tu apellido';
  if (/\d/.test(valor)) return 'El apellido no puede contener números';
  return null;
}

export function validarDNI(valor) {
  const limpio = String(valor).replace(/\D/g, '');
  if (!/^\d{7,8}$/.test(limpio)) return 'El DNI debe tener 7 u 8 números';
  return null;
}

export function validarNacimiento(valor) {
  if (!valor) return 'Ingresá tu fecha de nacimiento';
  const hoy = new Date();
  const fecha = new Date(valor);
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const m = hoy.getMonth() - fecha.getMonth();
  
  if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
    edad--;
  }
  
  return edad >= 18 ? null : 'Tenés que ser mayor de edad';
}

export function validarEmail(valor) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return 'Ingresá un email válido';
  return null;
}

export function validarCelular(valor) {
  const limpio = String(valor).replace(/[\s\-()]/g, '');
  if (!/^\d{10}$/.test(limpio)) return 'Ej.: 11 5555-1234';
  return null;
}

export function validarTerminos(valor) {
  return valor ? null : 'Tenés que aceptar los términos';
}

// ---------- PAGO ----------
export function validarTarjeta(valor) {
  const limpio = String(valor).replace(/\s/g, '');
  if (!/^\d{16}$/.test(limpio)) return 'Número de tarjeta inválido';
  return null;
}

export function validarVencimiento(valor) {
  const m = String(valor).match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!m) return 'Vencimiento inválido';

  const mes = Number(m[1]);
  const anio = Number('20' + m[2]);
  const hoy = new Date();
  
  const venc = new Date(anio, mes - 1, 1);
  venc.setMonth(venc.getMonth() + 1);
  venc.setDate(0);

  return venc >= hoy ? null : 'Vencimiento inválido';
}

export function validarCVV(valor) {
  return /^\d{3}$/.test(valor) ? null : 'CVV inválido';
}

export function validarTitularTarjeta(valor) {
  return valor && valor.trim().length >= 2 ? null : 'Ingresá el nombre del titular';
}
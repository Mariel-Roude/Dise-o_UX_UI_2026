import { solicitud, setPaso, cargarSolicitud, limpiarSolicitudStorage, guardarSolicitud } from './estado.js';
import { render, renderPlanes, renderExito, cargarPlanes, renderResumen } from './render.js';
import {
  validarMarca, validarModelo, validarValor, validarAntiguedad,
  validarNombre, validarApellido, validarDNI, validarNacimiento,
  validarEmail, validarCelular, validarTerminos,
  validarTarjeta, validarVencimiento, validarCVV, validarTitularTarjeta
} from './validaciones.js';
import { formatearMoneda } from './cotizador.js';
import { simularPago, generarPoliza } from './pago.js';

document.addEventListener('DOMContentLoaded', async () => {
  cargarSolicitud();
  await cargarPlanes();
  
  if (solicitud.paso === 2) {
    await renderPlanes();
  }
  
  await render();
  conectarEventosGlobales();
  conectarEventosPaso1();
  conectarEventosPaso2();
  conectarEventosPaso3();
  conectarEventosPaso4();
  conectarEventosExito();
  conectarEventosError();
});

function conectarEventosGlobales() {
  document.querySelectorAll('[data-volver]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setPaso(Number(btn.dataset.volver));
      render();
    });
  });

  document.getElementById('logo-home')?.addEventListener('click', (e) => {
    e.preventDefault(); 
    reiniciarSolicitud();
    setPaso(0);
    render();
  });

  document.getElementById('btn-empezar')?.addEventListener('click', () => { setPaso(1); render(); });
  document.getElementById('producto-celular')?.addEventListener('click', () => { setPaso(1); render(); });
}

function conectarEventosPaso1() {
  const form = document.getElementById('form-cotizar');
  if (!form) return;

  const marca = document.getElementById('marca');
  const marcaOtro = document.getElementById('marca-otro');
  const containerOtro = document.getElementById('marca-otro-container');
  const modelo = document.getElementById('modelo');
  const valor = document.getElementById('valor');
  const btnVerPlanes = document.getElementById('btn-ver-planes');

  const limpiarErrorVisual = (campo, idError) => {
    campo.classList.remove('border-[var(--error)]', 'ring-1', 'ring-[var(--error)]');
    const el = document.getElementById(idError);
    if (el) el.hidden = true;
  };

  const mostrarError = (campo, idError, msg) => {
    const el = document.getElementById(idError);
    if (!el) return;
    if (msg) {
      campo.classList.add('border-[var(--error)]', 'ring-1', 'ring-[var(--error)]');
      el.textContent = msg;
      el.hidden = false;
    } else {
      limpiarErrorVisual(campo, idError);
    }
  };

  const actualizarEstadoEquipo = () => {
    solicitud.equipo.marca = marca.value === 'Otro' ? marcaOtro.value.trim() : marca.value;
    solicitud.equipo.modelo = modelo.value.trim();
    solicitud.equipo.valor = Number(valor.value.replace(/\D/g, '')) || 0;
    solicitud.equipo.antiguedad = document.querySelector('input[name="antiguedad"]:checked')?.value || '';
    renderResumen();
    guardarSolicitud(); 
  };

  marca.addEventListener('change', () => {
    if (marca.value === 'Otro') {
      containerOtro.hidden = false;
      marcaOtro.focus();
    } else {
      containerOtro.hidden = true;
      marcaOtro.value = '';
      limpiarErrorVisual(marcaOtro, 'marca-otro-error');
    }
    actualizarEstadoEquipo();
    validarTodo();
  });

  marcaOtro.addEventListener('blur', () => {
    if (marca.value === 'Otro' && marcaOtro.value.trim().length < 2) {
      mostrarError(marcaOtro, 'marca-otro-error', 'Escribí la marca');
    } else {
      limpiarErrorVisual(marcaOtro, 'marca-otro-error');
    }
  });

  valor.addEventListener('input', (e) => {
    limpiarErrorVisual(valor, 'valor-error');
    let crudo = e.target.value.replace(/\D/g, ''); 
    if (crudo) {
      const numero = Number(crudo);
      e.target.value = formatearMoneda(numero);
    } else {
      e.target.value = ''; 
    }
    actualizarEstadoEquipo(); 
    validarTodo(); 
  });

  modelo.addEventListener('input', () => {
    limpiarErrorVisual(modelo, 'modelo-error');
    actualizarEstadoEquipo();
  });

  document.querySelectorAll('input[name="antiguedad"]').forEach((r) => {
    r.addEventListener('change', () => {
      actualizarEstadoEquipo();
    });
  });

  marca.addEventListener('blur', () => mostrarError(marca, 'marca-error', validarMarca(marca.value)));
  modelo.addEventListener('blur', () => mostrarError(modelo, 'modelo-error', validarModelo(modelo.value)));
  valor.addEventListener('blur', () => mostrarError(valor, 'valor-error', validarValor(valor.value)));

  const validarTodo = () => {
    const antiguedad = document.querySelector('input[name="antiguedad"]:checked')?.value || '';
    let isMarcaOtroValid = true;
    if (marca.value === 'Otro') {
      isMarcaOtroValid = marcaOtro.value.trim().length >= 2;
    }

    const valido = !validarMarca(marca.value) && isMarcaOtroValid && 
                   !validarModelo(modelo.value) && 
                   !validarValor(valor.value) && 
                   !validarAntiguedad(antiguedad);
    
    btnVerPlanes.disabled = !valido;
    btnVerPlanes.classList.toggle('bg-[var(--primary)]', valido);
    btnVerPlanes.classList.toggle('text-white', valido);
    
    return valido;
  };

  [marca, modelo, valor, marcaOtro].forEach((campo) => {
    campo.addEventListener('input', validarTodo);
    campo.addEventListener('change', validarTodo);
  });
  
  document.querySelectorAll('input[name="antiguedad"]').forEach((r) => r.addEventListener('change', validarTodo));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const antiguedad = document.querySelector('input[name="antiguedad"]:checked')?.value || '';
    
    let errorMarcaOtro = null;
    if (marca.value === 'Otro' && marcaOtro.value.trim().length < 2) {
      errorMarcaOtro = 'Escribí la marca';
    }

    const errores = {
      marca: validarMarca(marca.value),
      modelo: validarModelo(modelo.value),
      valor: validarValor(valor.value),
      antiguedad: validarAntiguedad(antiguedad)
    };

    let primerError = null;
    if (errores.marca) { mostrarError(marca, 'marca-error', errores.marca); primerError = primerError || marca; }
    if (errorMarcaOtro) { mostrarError(marcaOtro, 'marca-otro-error', errorMarcaOtro); primerError = primerError || marcaOtro; }
    if (errores.modelo) { mostrarError(modelo, 'modelo-error', errores.modelo); primerError = primerError || modelo; }
    if (errores.valor) { mostrarError(valor, 'valor-error', errores.valor); primerError = primerError || valor; }
    if (errores.antiguedad) {
      const el = document.getElementById('antiguedad-error');
      el.textContent = errores.antiguedad; el.hidden = false;
      primerError = primerError || document.querySelector('input[name="antiguedad"]');
    } else {
      document.getElementById('antiguedad-error').hidden = true;
    }

    if (primerError) { primerError.focus(); return; }

    actualizarEstadoEquipo();
    limpiarErrorVisual(marca, 'marca-error');
    limpiarErrorVisual(marcaOtro, 'marca-otro-error');
    limpiarErrorVisual(modelo, 'modelo-error');
    limpiarErrorVisual(valor, 'valor-error');

    setPaso(2);
    await renderPlanes();
    await render();
  });
}

function conectarEventosPaso2() {
  document.getElementById('btn-continuar-plan')?.addEventListener('click', async () => { setPaso(3); await render(); });
  document.getElementById('btn-continuar-plan-desktop')?.addEventListener('click', async () => { setPaso(3); await render(); });
}

function conectarEventosPaso3() {
  const form = document.getElementById('form-datos');
  if (!form) return;

  const msgFaltanDatos = document.getElementById('msg-faltan-datos'); 
  let isDirty = false; 

  const campos = [
    { c: document.getElementById('nombre'), id: 'nombre-error', fn: validarNombre },
    { c: document.getElementById('apellido'), id: 'apellido-error', fn: validarApellido },
    { c: document.getElementById('dni'), id: 'dni-error', fn: validarDNI },
    { c: document.getElementById('nacimiento'), id: 'nacimiento-error', fn: validarNacimiento },
    { c: document.getElementById('email'), id: 'email-error', fn: validarEmail },
    { c: document.getElementById('celular'), id: 'celular-error', fn: validarCelular }
  ];
  const terminos = document.getElementById('terminos');
  const btnIrPago = document.getElementById('btn-ir-pago');

  const limpiarErrorVisual = (campo, idError) => {
    campo.classList.remove('border-[var(--error)]', 'ring-1', 'ring-[var(--error)]');
    const el = document.getElementById(idError);
    if (el) el.hidden = true;
  };

  const mostrarError = (campo, idError, msg) => {
    const el = document.getElementById(idError);
    if (!el) return;
    if (msg) {
      campo.classList.add('border-[var(--error)]', 'ring-1', 'ring-[var(--error)]');
      el.textContent = msg; el.hidden = false;
    } else {
      limpiarErrorVisual(campo, idError);
    }
  };

  const actualizarEstadoTitular = () => {
    solicitud.titular = {
      nombre: document.getElementById('nombre').value.trim(),
      apellido: document.getElementById('apellido').value.trim(),
      dni: document.getElementById('dni').value.trim(),
      nacimiento: document.getElementById('nacimiento').value,
      email: document.getElementById('email').value.trim(),
      celular: document.getElementById('celular').value.trim(),
      terminos: terminos.checked
    };
    guardarSolicitud();
  };

  function validarTodo() {
    const valido = !validarNombre(document.getElementById('nombre').value) &&
      !validarApellido(document.getElementById('apellido').value) &&
      !validarDNI(document.getElementById('dni').value) &&
      !validarNacimiento(document.getElementById('nacimiento').value) &&
      !validarEmail(document.getElementById('email').value) &&
      !validarCelular(document.getElementById('celular').value) &&
      !validarTerminos(terminos.checked);

    btnIrPago.disabled = !valido;
    btnIrPago.classList.toggle('bg-[var(--primary)]', valido);
    btnIrPago.classList.toggle('text-white', valido);

    if (msgFaltanDatos) {
      let hayErroresVisibles = false;
      campos.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el && !el.hidden) hayErroresVisibles = true;
      });
      if (!document.getElementById('terminos-error').hidden) hayErroresVisibles = true;

      if (!valido && hayErroresVisibles) {
        msgFaltanDatos.classList.remove('hidden');
      } else {
        msgFaltanDatos.classList.add('hidden');
      }
    }
    
    return valido;
  }

  campos.forEach(({ c, id, fn }) => {
    c.addEventListener('blur', () => {
      isDirty = true;
      mostrarError(c, id, fn(c.value));
      validarTodo();
    });
    c.addEventListener('input', () => {
      isDirty = true;
      limpiarErrorVisual(c, id);
      actualizarEstadoTitular(); 
      validarTodo();
    });
  });
  
  terminos.addEventListener('change', () => {
    isDirty = true;
    limpiarErrorVisual(terminos, 'terminos-error');
    actualizarEstadoTitular(); 
    validarTodo();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let primerError = null;

    campos.forEach(({ c, id, fn }) => {
      const err = fn(c.value);
      mostrarError(c, id, err);
      if (err && !primerError) primerError = c;
    });

    const errTerminos = validarTerminos(terminos.checked);
    const elTerminos = document.getElementById('terminos-error');
    if (errTerminos) {
      elTerminos.textContent = errTerminos; elTerminos.hidden = false;
      if (!primerError) primerError = terminos;
    } else { elTerminos.hidden = true; }

    if (primerError) { primerError.focus(); return; }

    actualizarEstadoTitular();
    campos.forEach(({ c, id }) => limpiarErrorVisual(c, id));

    setPaso(4);
    await render();
  });
}

function conectarEventosPaso4() {
  const form = document.getElementById('form-pago');
  if (!form) return;

  const tarjeta = document.getElementById('tarjeta');
  const vencimiento = document.getElementById('vencimiento');
  const cvv = document.getElementById('cvv');
  const titular = document.getElementById('titular-tarjeta');
  const btnPagar = document.getElementById('btn-pagar');

  const limpiarErrorVisual = (campo, idError) => {
    campo.classList.remove('border-[var(--error)]', 'ring-1', 'ring-[var(--error)]');
    const el = document.getElementById(idError);
    if (el) el.hidden = true;
  };

  const mostrarError = (campo, idError, msg) => {
    const el = document.getElementById(idError);
    if (!el) return;
    if (msg) {
      campo.classList.add('border-[var(--error)]', 'ring-1', 'ring-[var(--error)]');
      el.textContent = msg; el.hidden = false;
    } else {
      limpiarErrorVisual(campo, idError);
    }
  };

  const actualizarEstadoPago = () => {
    solicitud.pago.metodo = document.querySelector('input[name="metodo"]:checked')?.value || 'credito';
    solicitud.pago.tarjeta = tarjeta.value;
    solicitud.pago.vencimiento = vencimiento.value;
    solicitud.pago.cvv = cvv.value;
    solicitud.pago.titular = titular.value.trim();
    guardarSolicitud(); 
  };

  tarjeta.addEventListener('input', (e) => {
    limpiarErrorVisual(tarjeta, 'tarjeta-error');
    let val = e.target.value.replace(/\D/g, '');
    val = val.replace(/(.{4})/g, '$1 ').trim();
    e.target.value = val;
    actualizarEstadoPago();
  });

  vencimiento.addEventListener('input', (e) => {
    limpiarErrorVisual(vencimiento, 'vencimiento-error');
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
    e.target.value = val;
    actualizarEstadoPago();
  });

  cvv.addEventListener('input', () => {
    limpiarErrorVisual(cvv, 'cvv-error');
    actualizarEstadoPago();
  });
  
  titular.addEventListener('input', () => {
    limpiarErrorVisual(titular, 'titular-tarjeta-error');
    actualizarEstadoPago();
  });
  
  document.querySelectorAll('input[name="metodo"]').forEach(r => r.addEventListener('change', actualizarEstadoPago));

  tarjeta.addEventListener('blur', () => mostrarError(tarjeta, 'tarjeta-error', validarTarjeta(tarjeta.value)));
  vencimiento.addEventListener('blur', () => mostrarError(vencimiento, 'vencimiento-error', validarVencimiento(vencimiento.value)));
  cvv.addEventListener('blur', () => mostrarError(cvv, 'cvv-error', validarCVV(cvv.value)));
  titular.addEventListener('blur', () => mostrarError(titular, 'titular-tarjeta-error', validarTitularTarjeta(titular.value)));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let primerError = null;

    const valTarjeta = validarTarjeta(tarjeta.value);
    const valVenc = validarVencimiento(vencimiento.value);
    const valCvv = validarCVV(cvv.value);
    const valTitular = validarTitularTarjeta(titular.value);

    if (valTarjeta) { mostrarError(tarjeta, 'tarjeta-error', valTarjeta); primerError = primerError || tarjeta; }
    if (valVenc) { mostrarError(vencimiento, 'vencimiento-error', valVenc); primerError = primerError || vencimiento; }
    if (valCvv) { mostrarError(cvv, 'cvv-error', valCvv); primerError = primerError || cvv; }
    if (valTitular) { mostrarError(titular, 'titular-tarjeta-error', valTitular); primerError = primerError || titular; }

    if (primerError) { primerError.focus(); return; }

    actualizarEstadoPago();

    btnPagar.disabled = true;
    btnPagar.innerHTML = '<span class="animate-pulse">Procesando...</span>';

    const resultado = await simularPago(tarjeta.value);

    if (resultado.ok) {
      solicitud.poliza = generarPoliza();
      setPaso(5);
      renderExito();
      await render();
    } else {
      setPaso(6);
      await render();
    }

    if (resultado.ok) {
      btnPagar.disabled = false;
      btnPagar.innerHTML = 'Pagar y contratar';
    }
  });
}

function conectarEventosExito() {
  document.getElementById('btn-volver-inicio-exito')?.addEventListener('click', () => {
    reiniciarSolicitud();
    setPaso(0);
    render();
  });
  document.getElementById('btn-descargar-poliza')?.addEventListener('click', () => { alert('La póliza se enviará a tu email. (Simulación)'); });
}

function conectarEventosError() {
  document.getElementById('btn-reintentar-pago')?.addEventListener('click', async () => {
    setPaso(4);
    await render();
    const btnPagar = document.getElementById('btn-pagar');
    if (btnPagar) { btnPagar.disabled = false; btnPagar.innerHTML = 'Pagar y contratar'; }
  });

  document.getElementById('btn-cambiar-medio')?.addEventListener('click', async () => {
    setPaso(4);
    await render();
    solicitud.pago.tarjeta = ''; solicitud.pago.vencimiento = ''; solicitud.pago.cvv = ''; solicitud.pago.titular = '';
    document.getElementById('tarjeta').value = ''; document.getElementById('vencimiento').value = ''; document.getElementById('cvv').value = ''; document.getElementById('titular-tarjeta').value = '';
    const btnPagar = document.getElementById('btn-pagar');
    if (btnPagar) { btnPagar.disabled = false; btnPagar.innerHTML = 'Pagar y contratar'; }
  });
}

function reiniciarSolicitud() {
  solicitud.equipo = { marca: '', modelo: '', valor: 0, antiguedad: '' };
  solicitud.plan = 'plus';
  solicitud.titular = { nombre: '', apellido: '', dni: '', nacimiento: '', email: '', celular: '', terminos: false };
  solicitud.pago = { metodo: 'credito', tarjeta: '', vencimiento: '', cvv: '', titular: '' };
  solicitud.poliza = null;
  limpiarSolicitudStorage();
}
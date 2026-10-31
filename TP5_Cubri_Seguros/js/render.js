import { solicitud, guardarSolicitud } from './estado.js';
import { calcularCuota, formatearMoneda } from './cotizador.js';

let planesCache = null;

export async function cargarPlanes() {
  if (!planesCache) {
    const res = await fetch('data/planes.json');
    planesCache = await res.json();
  }
  return planesCache;
}

export async function render() {
  document.querySelectorAll('[data-paso]').forEach((sec) => {
    sec.hidden = Number(sec.dataset.paso) !== solicitud.paso;
  });

  renderStepperGlobal();
  await renderResumen();
  rellenarFormularios();
  
  guardarSolicitud(); 

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderStepperGlobal() {
  const cont = document.getElementById('stepper-global');
  if (!cont) return;

  const pasosCheckout = [1, 2, 3, 4];
  const actual = solicitud.paso;

  if (!pasosCheckout.includes(actual)) {
    cont.innerHTML = ''; 
    cont.classList.add('hidden');
    return;
  }
  cont.classList.remove('hidden');

  const etiquetas = ['Cotizar', 'Plan', 'Datos', 'Pago'];
  
  let html = '<div class="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white px-2 py-3 lg:px-6 lg:py-4 w-full min-w-0 overflow-hidden">';
  
  etiquetas.forEach((label, i) => {
    const n = i + 1;
    let estado = n < actual ? 'completo' : n === actual ? 'activo' : 'pendiente';
    
    let circleClass = "flex h-5 w-5 lg:h-6 lg:w-6 items-center justify-center rounded-full text-[10px] lg:text-xs font-bold shrink-0 ";
    let textClass = "text-[10px] lg:text-sm font-semibold whitespace-nowrap ";
    let icon = n;

    if (estado === 'completo') {
      circleClass += "bg-[var(--success)] text-white";
      textClass += "text-[var(--success)]";
      icon = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (estado === 'activo') {
      circleClass += "bg-[var(--primary)] text-white";
      textClass += "text-[var(--primary)]";
    } else {
      circleClass += "bg-gray-100 text-[var(--muted)]";
      textClass += "text-[var(--muted)]";
    }

    html += `
      <div class="flex items-center gap-1 lg:gap-2 shrink-0">
        <div class="${circleClass}">${icon}</div>
        <span class="${textClass}">${label}</span>
      </div>
    `;

    if (i < etiquetas.length - 1) {
      let lineColor = n < actual ? 'bg-[var(--success)]' : 'bg-gray-200';
      html += `<div class="mx-1 lg:mx-4 h-[1px] flex-1 min-w-[10px] ${lineColor}"></div>`;
    }
  });
  html += '</div>';
  cont.innerHTML = html;
}

export async function renderResumen() {
  const planes = await cargarPlanes();
  const plan = planes.find((p) => p.id === solicitud.plan);
  const { equipo, titular } = solicitud;

  const cuota = plan ? calcularCuota(equipo.valor, plan.tasaAnual, equipo.antiguedad) : 0;
  const textoEquipo = equipo.marca || equipo.modelo ? `${equipo.marca} ${equipo.modelo}`.trim() : '—';
  const textoTitular = `${titular.nombre} ${titular.apellido}`.trim() || '—';

  const htmlFooter = `
    <div class="mt-4 border-t border-[var(--border)] pt-3 text-[11px] text-[var(--muted)] flex items-center gap-1.5">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <span>Contratación 100% online · cancelá cuando quieras</span>
    </div>
  `;

  const r1 = document.getElementById('resumen-paso1');
  if (r1) {
    const estaIncompleto = !equipo.marca || !equipo.modelo || !equipo.valor;
    const msjIncompleto = estaIncompleto 
      ? '<p class="mt-4 text-xs text-[var(--muted)]">Completá los datos del equipo para ver el precio.</p>' 
      : '';

    r1.innerHTML = `
      <h3 class="mb-4 text-lg font-bold">Resumen</h3>
      <div class="space-y-2">
        <div class="flex justify-between"><span class="text-[var(--muted)]">Seguro</span><span class="font-semibold">Celular</span></div>
        <div class="flex justify-between"><span class="text-[var(--muted)]">Equipo</span><span class="font-semibold text-right ml-2 truncate">${textoEquipo}</span></div>
        <div class="flex justify-between"><span class="text-[var(--muted)]">Valor</span><span class="font-semibold">${equipo.valor ? formatearMoneda(equipo.valor) : '—'}</span></div>
      </div>
      ${msjIncompleto}
      ${htmlFooter}
    `;
  }

  const r2 = document.getElementById('resumen-paso2');
  if (r2) {
    r2.innerHTML = `
      <h3 class="mb-4 text-lg font-bold">Resumen</h3>
      <div class="space-y-2">
        <div class="flex justify-between"><span class="text-[var(--muted)]">Seguro</span><span class="font-semibold">Celular</span></div>
        <div class="flex justify-between"><span class="text-[var(--muted)]">Equipo</span><span class="font-semibold text-right ml-2 truncate">${textoEquipo}</span></div>
        <div class="flex justify-between"><span class="text-[var(--muted)]">Plan</span><span class="font-semibold">${plan ? plan.nombre : '—'}</span></div>
        <div class="mt-2 flex justify-between border-t border-[var(--border)] pt-3 text-base font-bold"><span>Total mensual</span><span>${formatearMoneda(cuota)}</span></div>
      </div>
      ${htmlFooter}
    `;
  }
  
  const totalMobile = document.getElementById('total-mobile-plan');
  if (totalMobile) totalMobile.textContent = `${formatearMoneda(cuota)}/mes`;

  const r3 = document.getElementById('resumen-paso3');
  if (r3) {
    r3.innerHTML = `
      <h3 class="mb-4 text-lg font-bold">Resumen</h3>
      <div class="space-y-2">
        <div class="flex justify-between"><span class="text-[var(--muted)]">Seguro</span><span class="font-semibold">Celular</span></div>
        <div class="flex justify-between"><span class="text-[var(--muted)]">Equipo</span><span class="font-semibold text-right ml-2 truncate">${textoEquipo}</span></div>
        <div class="flex justify-between"><span class="text-[var(--muted)]">Plan</span><span class="font-semibold">${plan ? plan.nombre : '—'}</span></div>
        <div class="mt-2 flex justify-between border-t border-[var(--border)] pt-3 text-base font-bold"><span>Total mensual</span><span>${formatearMoneda(cuota)}</span></div>
      </div>
      ${htmlFooter}
    `;
  }

  const r4 = document.getElementById('resumen-paso4');
  if (r4) {
    r4.innerHTML = `
      <h3 class="mb-4 text-lg font-bold">Resumen</h3>
      <div class="space-y-2">
        <div class="flex justify-between"><span class="text-[var(--muted)]">Seguro</span><span class="font-semibold">Celular</span></div>
        <div class="flex justify-between"><span class="text-[var(--muted)]">Equipo</span><span class="font-semibold text-right ml-2 truncate">${textoEquipo}</span></div>
        <div class="flex justify-between"><span class="text-[var(--muted)]">Plan</span><span class="font-semibold">${plan ? plan.nombre : '—'}</span></div>
        <div class="flex justify-between"><span class="text-[var(--muted)]">Titular</span><span class="font-semibold text-right ml-2 truncate">${textoTitular}</span></div>
        <div class="mt-2 flex justify-between border-t border-[var(--border)] pt-3 text-base font-bold"><span>Total mensual</span><span>${formatearMoneda(cuota)}</span></div>
      </div>
      ${htmlFooter}
    `;
  }
}

function rellenarFormularios() {
  const { equipo, titular, pago } = solicitud;

  const marca = document.getElementById('marca');
  const marcaOtro = document.getElementById('marca-otro');
  const containerOtro = document.getElementById('marca-otro-container');
  
  if (marca) {
    const opcionesEstandar = ['Samsung', 'Apple', 'Motorola', 'Xiaomi'];
    if (equipo.marca && !opcionesEstandar.includes(equipo.marca)) {
      marca.value = 'Otro';
      if (containerOtro) containerOtro.hidden = false;
      if (marcaOtro) marcaOtro.value = equipo.marca;
    } else {
      marca.value = equipo.marca;
      if (containerOtro) containerOtro.hidden = true;
      if (marcaOtro) marcaOtro.value = '';
    }
  }

  const modelo = document.getElementById('modelo'); if (modelo) modelo.value = equipo.modelo;
  const valor = document.getElementById('valor'); if (valor) valor.value = equipo.valor ? formatearMoneda(equipo.valor) : '';
  document.querySelectorAll('input[name="antiguedad"]').forEach((r) => (r.checked = r.value === equipo.antiguedad));

  const nombre = document.getElementById('nombre'); if (nombre) nombre.value = titular.nombre;
  const apellido = document.getElementById('apellido'); if (apellido) apellido.value = titular.apellido;
  const dni = document.getElementById('dni'); if (dni) dni.value = titular.dni;
  const nacimiento = document.getElementById('nacimiento'); if (nacimiento) nacimiento.value = titular.nacimiento;
  const email = document.getElementById('email'); if (email) email.value = titular.email;
  const celular = document.getElementById('celular'); if (celular) celular.value = titular.celular;
  const terminos = document.getElementById('terminos'); if (terminos) terminos.checked = titular.terminos;

  document.querySelectorAll('input[name="metodo"]').forEach((r) => (r.checked = r.value === pago.metodo));
  const tarjeta = document.getElementById('tarjeta'); if (tarjeta) tarjeta.value = pago.tarjeta;
  const vencimiento = document.getElementById('vencimiento'); if (vencimiento) vencimiento.value = pago.vencimiento;
  const cvv = document.getElementById('cvv'); if (cvv) cvv.value = pago.cvv;
  const titularTarjeta = document.getElementById('titular-tarjeta'); if (titularTarjeta) titularTarjeta.value = pago.titular;
}

export async function renderPlanes() {
  const cont = document.getElementById('lista-planes');
  if (!cont) return;

  const planes = await cargarPlanes();
  const { equipo } = solicitud;

  cont.innerHTML = planes.map((plan) => {
    const cuota = calcularCuota(equipo.valor, plan.tasaAnual, equipo.antiguedad);
    const activo = solicitud.plan === plan.id;

    const coberturasHTML = plan.coberturas.map(c => {
      const icon = c.incluye 
        ? `<svg class="text-[var(--success)] shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
        : `<svg class="text-gray-300 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      
      const textClass = c.incluye ? 'text-[var(--text)]' : 'text-[var(--muted)]';
      
      return `<li class="flex items-start gap-2 text-sm py-0.5">${icon} <span class="${textClass}">${c.texto}</span></li>`;
    }).join('');

    return `
      <label class="relative flex h-full cursor-pointer flex-col rounded-2xl border ${activo ? 'border-[var(--primary)] ring-1 ring-[var(--primary)] bg-[var(--primary-50)]' : 'border-[var(--border)] bg-white hover:border-gray-300'} p-4 lg:p-5 transition min-w-0">
        <input type="radio" name="plan" value="${plan.id}" class="sr-only" ${activo ? 'checked' : ''} />
        
        <div class="flex items-start justify-between mb-3 min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap lg:flex-nowrap min-w-0">
            <span class="font-bold text-[var(--text)] text-[15px] whitespace-nowrap">${plan.nombre}</span>
            ${plan.recomendado ? '<span class="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider whitespace-nowrap mt-1 lg:mt-0">Recomendado</span>' : ''}
          </div>
          <div class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${activo ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-gray-300'} ml-1 mt-1 lg:mt-0">
            ${activo ? '<div class="h-2 w-2 rounded-full bg-white"></div>' : ''}
          </div>
        </div>
        
        <div class="flex items-baseline gap-1 min-w-0">
          <span class="text-2xl lg:text-3xl font-extrabold text-[var(--text)] whitespace-nowrap">${formatearMoneda(cuota)}</span>
          <span class="text-xs lg:text-sm font-medium text-[var(--muted)]">/mes</span>
        </div>
        
        <ul class="mt-4 border-t border-gray-100 pt-4 flex-1">
          ${coberturasHTML}
        </ul>
      </label>
    `;
  }).join('');

  cont.querySelectorAll('input[name="plan"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      solicitud.plan = radio.value;
      renderPlanes();
      renderResumen();
      guardarSolicitud();
    });
  });
}

export function renderExito() {
  const { titular, equipo, plan, poliza } = solicitud;
  const planObj = planesCache?.find((p) => p.id === plan);

  document.getElementById('exito-nombre').textContent = titular.nombre;
  document.getElementById('exito-email').textContent = titular.email;
  document.getElementById('exito-poliza').textContent = poliza;
  document.getElementById('exito-plan').textContent = planObj ? planObj.nombre : plan;
  document.getElementById('exito-equipo').textContent = `${equipo.marca} ${equipo.modelo}`.trim();
  document.getElementById('exito-vigencia').textContent = new Date().toLocaleDateString('es-AR');
  document.getElementById('exito-cuota').textContent = formatearMoneda(calcularCuota(equipo.valor, planObj?.tasaAnual ?? 0, equipo.antiguedad));
}
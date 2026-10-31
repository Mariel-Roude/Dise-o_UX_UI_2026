
export const solicitud = {
  paso: 0,
  equipo: { marca: '', modelo: '', valor: 0, antiguedad: '' },
  plan: 'plus',
  titular: { nombre: '', apellido: '', dni: '', nacimiento: '', email: '', celular: '', terminos: false },
  pago: { metodo: 'credito', tarjeta: '', vencimiento: '', cvv: '', titular: '' },
  poliza: null
};

export function setPaso(n) {
  solicitud.paso = n;
}

const CLAVE_STORAGE = 'cubri_solicitud';

export function guardarSolicitud() {
  const copia = JSON.parse(JSON.stringify(solicitud));
  sessionStorage.setItem(CLAVE_STORAGE, JSON.stringify(copia));
}

export function cargarSolicitud() {
  const guardada = sessionStorage.getItem(CLAVE_STORAGE);
  if (guardada) {
    try {
      const parsed = JSON.parse(guardada);
      Object.assign(solicitud, parsed);
      

      if (solicitud.paso === 1) {

        solicitud.equipo = { marca: '', modelo: '', valor: 0, antiguedad: '' };
      } else if (solicitud.paso === 3 || solicitud.paso === 4) {
   
        solicitud.titular = { nombre: '', apellido: '', dni: '', nacimiento: '', email: '', celular: '', terminos: false };
        solicitud.pago = { metodo: 'credito', tarjeta: '', vencimiento: '', cvv: '', titular: '' };
      }
      
    } catch (e) {
      console.error("Error al leer el storage", e);
    }
  }
}

export function limpiarSolicitudStorage() {
  sessionStorage.removeItem(CLAVE_STORAGE);
}
# TP3 – HTML y CSS (Diseño UX-UI 2026)

Cada ejercicio está en su propia carpeta (`ejercicio-01` … `ejercicio-20`) con su `index.html` y su `styles.css`. Para verlos, abrir el `index.html` de cada carpeta en el navegador.

## Ejercicios resueltos

| Bloque | Ejercicios | Contenido |
|---|---|---|
| 1 – Básico | 01 a 07 | Estructura HTML, listas y enlaces, tabla, formulario, primeros estilos, selectores y box model |
| 2 – Intermedio | 08 a 14 | Flexbox (navbar y galería), Grid (layout), pseudo-clases/elementos, posicionamiento, formulario estilizado, variables CSS y modo oscuro |
| 3 – Medio/Avanzado | 15 a 20 | Media queries, animaciones, menú hamburguesa sin JS, mosaico con Grid, formulario multi-step, landing page integradora |

Los 20 ejercicios fueron resueltos.

## Decisiones de diseño

- **Ejercicio 1:** no lleva CSS a propósito; los estilos se agregan en el Ejercicio 5 sobre la misma página.
- **Ejercicio 2:** los enlaces de la lista no ordenada apuntan a páginas relacionadas con el mate (Wikipedia), para mantener coherencia temática con la receta.
- **Ejercicio 3:** la tabla usa columnas Día / Horario / Materia con `rowspan` en la columna "Día" (cada día tiene dos clases), ya que los horarios reales de cada día no coinciden entre sí y no se prestan a una grilla única de franjas horarias comunes.
- **Ejercicio 15:** enfoque *mobile first*. Se parte de una columna sin sidebar y se agregan reglas con `min-width` (768px y 1100px). Es más simple, carga menos CSS en celulares y evita deshacer estilos.
- **Ejercicio 14:** el modo oscuro solo redefine variables CSS y se activa con un checkbox y `:has()`, sin JavaScript.
- **Ejercicios 17 y 19:** funcionan solo con HTML/CSS (checkbox y radios ocultos, que siguen siendo accesibles por teclado). En el 19, el botón "Siguiente" se deshabilita mientras el paso 1 tenga campos inválidos.
- **Imágenes:** se usan archivos SVG locales (`placeholder.svg`, `hero.svg`) para que todo funcione sin conexión, siempre con atributo `alt`.
- **Accesibilidad:** `label` asociado a cada campo, `alt` en imágenes, foco visible, colores con buen contraste y `prefers-reduced-motion` en las animaciones.
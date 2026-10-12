# Coffea — Landing page

Trabajo práctico de Diseño UX-UI · 2026

Landing page estática desarrollada con HTML5 y CSS3 a partir del diseño de Figma.

## Cómo ejecutar en local

**Opción 1: VS Code + Live Server**

1. Abrir la carpeta del proyecto en Visual Studio Code.
2. Abrir `index.html`.
3. Hacer clic en **Go Live** (o elegir *Open with Live Server*).
4. Live Server abrirá la página en el navegador. Usá la dirección que muestra, normalmente `http://127.0.0.1:5500/`.

**Opción 2: Python**

Si tenés Python instalado, abrir una terminal en la carpeta del proyecto y ejecutar:

```bash
python -m http.server 8000
```

Después, abrir `http://localhost:8000/`. Esta dirección funciona mientras el servidor de Python esté ejecutándose. No hace falta usar Python si ya estás trabajando con Live Server.

Las tipografías se cargan desde Google Fonts y requieren conexión a internet.

## Estructura

- `index.html`: contenido de la landing page.
- `404.html`: página para rutas inexistentes.
- `netlify.toml`: configuración de publicación en Netlify.
- `css/`: tokens, estilos base, layout y componentes.
- `assets/img/`: imágenes de la página.
- `assets/icons/`: íconos.

## Convenciones

- HTML5 semántico y CSS3, sin JavaScript.
- Clases con nomenclatura BEM.
- Colores, tipografías, radios y espaciados centralizados en `css/tokens.css`.
- Estilos organizados por capas y componentes.

## Publicación

El proyecto está preparado para publicarse en Netlify desde un repositorio Git. Usar la raíz del proyecto (`.`) como directorio de publicación y dejar vacío el comando de build.

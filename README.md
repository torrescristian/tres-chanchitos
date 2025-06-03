# 🐷 Tres Chanchitos - Juego de Puzzle

Un divertido juego de puzzle tipo match-3 construido con React, TypeScript y PIXI.js.

## 🎮 Descripción del Juego

**Tres Chanchitos** es un emocionante juego de puzzle donde tu objetivo es conectar 5 o más bloques del mismo tipo para ganar puntos. Inspirado en los clásicos juegos match-3, pero con un twist único.

### Características:
- 🎯 **Mecánica Simple**: Haz clic en un bloque y luego en otro adyacente para intercambiarlos
- 🔗 **Conexiones**: Conecta 5 o más bloques del mismo tipo para eliminarlos
- 🎨 **Gráficos Coloridos**: Personajes adorables con animaciones fluidas
- 🔊 **Efectos de Sonido**: Audio inmersivo para una mejor experiencia
- 📱 **Responsive**: Funciona perfecto en desktop y móvil

## 🛠️ Tecnologías Utilizadas

- **React 18** - Framework frontend
- **TypeScript** - Tipado estático
- **PIXI.js** - Renderizado 2D de alto rendimiento
- **Tailwind CSS** - Estilos y diseño responsive
- **Vite** - Build tool y dev server
- **Howler.js** - Manejo de audio
- **Tween.js** - Animaciones suaves

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (versión 16 o superior)
- Yarn o npm

### Pasos:

1. **Clona el repositorio**
   ```bash
   git clone [tu-repositorio]
   cd game-projects
   ```

2. **Instala las dependencias**
   ```bash
   yarn install
   # o
   npm install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   yarn dev
   # o
   npm run dev
   ```

4. **Abre tu navegador**
   Ve a `http://localhost:5173` para jugar

## 🎲 Cómo Jugar

1. **Selecciona un bloque**: Haz clic en cualquier bloque del tablero
2. **Intercambia**: Haz clic en un bloque adyacente (arriba, abajo, izquierda o derecha)
3. **Forma grupos**: Trata de crear grupos de 5 o más bloques del mismo tipo
4. **Gana puntos**: Los grupos se eliminarán automáticamente y ganarás puntos
5. **¡Sigue jugando**: El tablero se rellenará con nuevos bloques

## 🏗️ Estructura del Proyecto

```
src/
├── modules/
│   ├── common/           # Componentes y utilidades compartidas
│   ├── landing/          # Página principal del juego
│   └── tres-chanchitos/  # Lógica del juego
│       ├── components/
│       │   ├── molecules/ # Componente Block
│       │   └── organisms/ # Componente Match3
public/                   # Recursos estáticos (spritesheets, sonidos)
```

## 🔧 Scripts Disponibles

- `yarn dev` - Inicia el servidor de desarrollo
- `yarn build` - Construye la aplicación para producción
- `yarn preview` - Previsualiza la build de producción
- `yarn lint` - Ejecuta el linter de código

## 📦 Build para Producción

```bash
yarn build
```

Los archivos optimizados se generarán en la carpeta `dist/`.

## 🎨 Personalización

El juego es fácilmente personalizable:

- **Personajes**: Modifica los sprites en `/public/spritesheet.json`
- **Tamaño del tablero**: Cambia `MATCH_SIZE` en `src/modules/common/libs/consts.ts`
- **Estilos**: Ajusta los colores y diseño en `GameLandingPage.tsx`
- **Sonidos**: Reemplaza los archivos de audio en `/public/sound/`

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar el juego:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Añade nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**¡Diviértete jugando Tres Chanchitos! 🐷🎮**

# FINZI — Aprende Finanzas Jugando 🌰

**Finzi** es una aplicación diseñada para convertir la educación financiera en una aventura interactiva y gamificada. Orientada a jóvenes, la app busca construir hábitos financieros sólidos a través de misiones, minijuegos y un sistema de progresión recompensado.

## 🚀 Características Principales

- **🎮 Gamificación Total:** Aprende conceptos financieros mientras te diviertes con mecánicas de juego.
- **🗺️ Mapa de Aventuras:** Desbloquea niveles a medida que avanzas en tu conocimiento.
- **🎯 Minijuegos Dinámicos:** Retos de Verdadero/Falso, completar frases y más para reforzar el aprendizaje.
- **🌰 Sistema de Bellotas:** Gana recompensas, sube de rango y desbloquea logros exclusivos.
- **📈 Ruta de Aprendizaje:**
    1. **Nivel 1: Bellota** - Fundamentos del dinero y ahorro.
    2. **Nivel 2: Arbusto** - Presupuesto y gastos inteligentes.
    3. **Nivel 3: Árbol** - Inversiones básicas e interés compuesto.
    4. **Nivel 4: Árbol Financiero** - Libertad financiera y planificación avanzada.

## 🛠️ Tecnologías Utilizadas

- **Vite + React + TypeScript**: la landing es un solo componente (`src/Landing.tsx`) con su CSS (`src/landing.css`).
- **Fredoka** (misma tipografía de la app) servida desde `public/fonts`.
- Imágenes optimizadas en `public/landing` (`.webp`). Los PNG originales están en `assets-originales/` y no se publican.

## 💻 Desarrollo local

```bash
npm install
npm run dev
```

Los botones "Entrar a Finzi", "Empezar mi aventura" y "Vamos a crecer" llevan a la versión web del juego.
Su URL se define en la variable `VITE_APP_URL` (ver `.env.example`). En desarrollo, si no existe, apunta a `http://localhost:8092`.

## 📱 Participa en el Focus Group

Estamos construyendo la mejor experiencia de educación financiera y tu opinión cuenta. 
1. Abre la cámara de tu celular.
2. Escanea el código QR en la sección de Focus Group.
3. Comparte tu experiencia y gana premios exclusivos.

---
© 2026 Finzi · Educación Financiera Gamificada

## 🚀 Despliegue Automático (CI/CD)

Vercel despliega en cada `git push` a `main` (`vercel.json` ya indica `npm run build` y la carpeta `dist`).

**Antes del primer deploy:** en Vercel > Settings > Environment Variables agrega `VITE_APP_URL` con la URL de la versión web de Finzi. Sin ella el build falla a propósito, para no publicar un botón "Jugar" que no lleva a ningún lado.

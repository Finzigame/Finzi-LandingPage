// URL de la version web de Finzi (el juego). Se define en VITE_APP_URL, ver .env.example.
// En desarrollo, sin .env, apunta al export local de la app (finzi-web-prod en .claude/launch.json).
export const APP_URL: string =
  import.meta.env.VITE_APP_URL ?? "http://localhost:8092";

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Sin esta URL el boton "Jugar" no lleva a ningun lado: mejor fallar el build que publicarlo roto.
  if (command === "build" && !env.VITE_APP_URL) {
    throw new Error(
      "Falta VITE_APP_URL (URL de la version web de Finzi). Ver .env.example",
    );
  }
  return { plugins: [react()] };
});

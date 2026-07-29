import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Caminho Seguro — Rede de Proteção Infantil",
    short_name: "Caminho Seguro",
    description:
      "Plataforma que conecta famílias, escolas, transportes e comunidade para ampliar a proteção infantil.",

    start_url: "/",
    scope: "/",

    display: "standalone",

    background_color: "#f8fafc",
    theme_color: "#0d4164",

    lang: "pt-BR",

    categories: ["education", "utilities", "social"],

    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

import type { MetadataRoute } from "next";

const siteUrl = "https://caminho-seguro.rcg-tech.com.br";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/responsavel",
        "/escola",
        "/transporte",
        "/rede",
        "/login",
        "/ajuda/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

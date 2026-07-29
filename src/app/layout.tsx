import { ViewTransition } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppNavigation } from "@/components/shared/app-navigation";
import { getCurrentUser } from "@/lib/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://caminho-seguro.rcg-tech.com.br";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Caminho Seguro",
      description:
        "Rede comunitária de proteção infantil conectando famílias, escolas, transportes e comunidade.",
      inLanguage: "pt-BR",
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Caminho Seguro",
      url: siteUrl,
      logo: `${siteUrl}/CaminhoSeguroLogo.png`,
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "Caminho Seguro",
      applicationCategory: "SafetyApplication",
      operatingSystem: "Web",
      url: siteUrl,
      description:
        "Plataforma que conecta responsáveis, escolas, transportes e comunidade para fortalecer a proteção infantil por meio de QR Code, alertas e pontos seguros.",
      image: `${siteUrl}/opengraph-image`,
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Caminho Seguro | Rede de Proteção Infantil",
    template: "%s | Caminho Seguro",
  },

  description:
    "Plataforma de proteção infantil que conecta responsáveis, escolas, transportes, órgãos públicos e comunidade por meio de alertas, QR Code e pontos seguros.",

  keywords: [
    "proteção infantil",
    "segurança infantil",
    "rede comunitária",
    "Caminho Seguro",
    "QR Code",
    "Bluetooth",
    "pontos seguros",
    "alertas de proteção",
    "trajeto escolar",
  ],

  authors: [{ name: "Equipe Caminho Seguro" }],
  creator: "Equipe Caminho Seguro",
  publisher: "Caminho Seguro",

  applicationName: "Caminho Seguro",

  verification: {
    google: "rpaW80VbIlLIUHKUd3FKKg5x4UxeVCulWDc9TZOzDVE",
  },

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Caminho Seguro",
    title: "Caminho Seguro | Rede de Proteção Infantil",
    description:
      "Uma rede comunitária que conecta responsáveis, escolas, transportes, órgãos públicos e comunidade para ampliar a segurança infantil.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Caminho Seguro | Rede de Proteção Infantil",
    description:
      "Uma rede comunitária que conecta responsáveis, escolas e comunidade para ampliar a segurança infantil.",
  },

  robots: {
    index: true,
    follow: true,
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0d4164",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentUser();

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />

        <AppNavigation session={session} />

        <div className="h-32 md:h-0" aria-hidden="true" />

        <ViewTransition name="main-content">{children}</ViewTransition>
      </body>
    </html>
  );
}

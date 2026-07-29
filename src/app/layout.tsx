import { ViewTransition } from "react";
import type { Metadata } from "next";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentUser();

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppNavigation session={session} />
        <div className="h-32 md:h-0" aria-hidden="true" />
        <ViewTransition name="main-content">{children}</ViewTransition>
      </body>
    </html>
  );
}

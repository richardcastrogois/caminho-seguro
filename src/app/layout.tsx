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

export const metadata: Metadata = {
  title: {
    default: "Caminho Seguro",
    template: "%s | Caminho Seguro",
  },
  description:
    "Rede comunitaria de protecao infantil que conecta familias, escolas, transportes, orgaos publicos e comunidade.",
  keywords: [
    "protecao infantil",
    "Bluetooth",
    "QR Code",
    "rede comunitaria",
    "eventos de protecao",
  ],
  authors: [{ name: "Equipe Caminho Seguro" }],
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
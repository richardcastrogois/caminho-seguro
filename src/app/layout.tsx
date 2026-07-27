import { ViewTransition } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppNavigation } from "@/components/shared/app-navigation";
import { getDemoSession } from "@/lib/demo-auth";
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
    "Rede comunitária de proteção infantil que conecta famílias, escolas, transportes, órgãos públicos e comunidade.",
  keywords: [
    "proteção infantil",
    "Bluetooth",
    "QR Code",
    "rede comunitária",
    "eventos de proteção",
  ],
  authors: [
    {
      name: "Equipe Caminho Seguro",
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getDemoSession();

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppNavigation session={session} />
        <div className="h-[128px] md:h-[92px]" aria-hidden="true" />
        <ViewTransition name="main-content">{children}</ViewTransition>
      </body>
    </html>
  );
}

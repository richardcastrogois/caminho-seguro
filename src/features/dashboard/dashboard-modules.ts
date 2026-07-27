import {
  Building2,
  BusFront,
  HeartHandshake,
  QrCode,
  Route,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { DashboardModule } from "@/types/dashboard";

export const dashboardModules: DashboardModule[] = [
  {
    title: "Demo guiada",
    description:
      "Siga o roteiro principal do pitch: escola, responsável, QR público e tratamento do alerta.",
    href: "/demo",
    icon: Route,
    badge: "Roteiro",
    accent: "green",
    status: "ready",
  },
  {
    title: "Responsável",
    description:
      "Acompanhe chegadas, saídas, embarques, histórico e alertas relacionados à criança.",
    href: "/responsavel",
    icon: Users,
    badge: "Família",
    accent: "blue",
    status: "ready",
  },
  {
    title: "Escola",
    description:
      "Visualize crianças esperadas, detectadas, horários e alertas da instituição.",
    href: "/escola",
    icon: Building2,
    badge: "Instituição",
    accent: "green",
    status: "ready",
  },
  {
    title: "Pedido de ajuda",
    description:
      "Simule a leitura pública do QR de uma criança que pediu ajuda ou foi encontrada.",
    href: "/ajuda/demo",
    icon: QrCode,
    badge: "Acesso público",
    accent: "blue",
    status: "ready",
  },
  {
    title: "Transporte",
    description:
      "Registrará embarques e desembarques automáticos ou assistidos durante o trajeto.",
    href: "/transporte",
    icon: BusFront,
    badge: "Etapa 2",
    accent: "orange",
    status: "soon",
  },
  {
    title: "Rede de proteção",
    description:
      "Mostrará órgãos públicos, UBS, CRAS, ONGs, pontos parceiros e alertas autorizados.",
    href: "/rede",
    icon: ShieldCheck,
    badge: "Etapa 2",
    accent: "purple",
    status: "soon",
  },
  {
    title: "Administração",
    description:
      "Centralizará cadastro de crianças, responsáveis, instituições e identificadores protegidos.",
    href: "/admin",
    icon: HeartHandshake,
    badge: "Etapa 2",
    accent: "green",
    status: "soon",
  },
];

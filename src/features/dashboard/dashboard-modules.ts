import {
  Building2,
  BusFront,
  HeartHandshake,
  QrCode,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { DashboardModule } from "@/types/dashboard";

export const dashboardModules: DashboardModule[] = [
  {
    title: "Responsável",
    description:
      "Acompanhe chegadas, saídas, embarques, histórico e alertas relacionados à criança.",
    href: "/responsavel",
    icon: Users,
    badge: "Família",
    accent: "blue",
  },
  {
    title: "Escola",
    description:
      "Visualize crianças esperadas, detectadas, horários e alertas da instituição.",
    href: "/escola",
    icon: Building2,
    badge: "Instituição",
    accent: "green",
  },
  {
    title: "Transporte",
    description:
      "Registre embarques e desembarques automáticos ou manuais durante o trajeto.",
    href: "/transporte",
    icon: BusFront,
    badge: "Mobilidade",
    accent: "orange",
  },
  {
    title: "Rede de proteção",
    description:
      "Painel de órgãos públicos, UBS, CRAS, ONGs e estabelecimentos parceiros.",
    href: "/rede",
    icon: ShieldCheck,
    badge: "Gestão",
    accent: "purple",
  },
  {
    title: "Pedido de ajuda",
    description:
      "Simule a leitura pública do QR de uma criança que pediu ajuda ou foi encontrada.",
    href: "/ajuda/demo",
    icon: QrCode,
    badge: "Acesso público",
    accent: "blue",
  },
  {
    title: "Administração",
    description:
      "Cadastre crianças, responsáveis, instituições e identificadores protegidos.",
    href: "/admin",
    icon: HeartHandshake,
    badge: "Operação",
    accent: "green",
  },
];

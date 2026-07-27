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
      "Registre embarques e desembarques assistidos durante o trajeto, sem rastrear a rota.",
    href: "/transporte",
    icon: BusFront,
    badge: "Transporte",
    accent: "orange",
    status: "ready",
  },
  {
    title: "Rede de proteção",
    description: "Visualize órgãos, UBS, CRAS, parceiros e alertas autorizados da rede.",
    href: "/rede",
    icon: ShieldCheck,
    badge: "Coordenação",
    accent: "purple",
    status: "ready",
  },
  {
    title: "Administração",
    description:
      "Consulte instituições e gerencie o ciclo de vida de identificadores protegidos da demonstração.",
    href: "/admin",
    icon: HeartHandshake,
    badge: "Gestão",
    accent: "green",
    status: "ready",
  },
];

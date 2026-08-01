import type { JourneyStage } from "./journey.types";

export type JourneyStageCopy = {
  eyebrow: string;
  title: string;
  lead: string;
};

export type JourneyPhoneNotification = {
  id: string;
  time: string;
  title: string;
  description: string;
};

export type JourneyPhoneStatus = {
  title: string;
  description: string;
  metrics: string[];
};

export const journeyStageCopy: Record<JourneyStage, JourneyStageCopy> = {
  intro: {
    eyebrow: "Jornada Protegida",
    title: "Da casa a escola, a rede registra apenas o que importa.",
    lead: "Role para acompanhar os checkpoints.",
  },
  "leaving-home": {
    eyebrow: "07:15",
    title: "Jornada iniciada.",
    lead: "A familia recebe o primeiro evento, sem GPS continuo.",
  },
  "community-checkpoint": {
    eyebrow: "07:21",
    title: "Ponto seguro confirmou a passagem.",
    lead: "A comunidade valida o momento sem acessar dados pessoais.",
  },
  boarding: {
    eyebrow: "07:28",
    title: "Embarque validado.",
    lead: "O transporte e identificado e o responsavel recebe a confirmacao.",
  },
  "bus-route": {
    eyebrow: "Rota alternativa",
    title: "Um caminho possivel ainda nao tem cobertura.",
    lead: "Maria nao passou por ali; a rede sinaliza o ponto para reforco.",
  },
  "school-arrival": {
    eyebrow: "07:46",
    title: "Chegada confirmada pela escola.",
    lead: "O ultimo evento encerra a jornada com seguranca.",
  },
  "camera-rise": {
    eyebrow: "Visao da rede",
    title: "Eventos isolados passam a formar uma rede de cuidado.",
    lead: "Casa, comunidade, transporte e escola aparecem conectados.",
  },
  "network-map": {
    eyebrow: "Jornada concluida",
    title: "A rede acompanhou o caminho sem vigiar a crianca.",
    lead: "Somente eventos necessarios foram compartilhados.",
  },
};

export const journeyPhoneNotifications: JourneyPhoneNotification[] = [
  {
    id: "started",
    time: "07:15",
    title: "Maria iniciou o trajeto.",
    description: "Trajeto iniciado.",
  },
  {
    id: "safe-point",
    time: "07:21",
    title: "Passagem confirmada no ponto seguro.",
    description: "Passagem confirmada.",
  },
  {
    id: "boarding",
    time: "07:28",
    title: "Embarque confirmado.",
    description: "Linha Escolar 04.",
  },
  {
    id: "arrival",
    time: "07:46",
    title: "Chegada confirmada pela escola.",
    description: "Jornada encerrada.",
  },
];

const visibleNotificationsByStage: Record<JourneyStage, string[]> = {
  intro: [],
  "leaving-home": ["started"],
  "community-checkpoint": ["started", "safe-point"],
  boarding: ["started", "safe-point", "boarding"],
  "bus-route": ["started", "safe-point", "boarding"],
  "school-arrival": ["started", "safe-point", "boarding", "arrival"],
  "camera-rise": ["started", "safe-point", "boarding", "arrival"],
  "network-map": ["started", "safe-point", "boarding", "arrival"],
};

export const phoneStatusByStage: Record<JourneyStage, JourneyPhoneStatus> = {
  intro: {
    title: "Rede pronta",
    description: "Aguardando o primeiro evento.",
    metrics: ["Sem GPS continuo", "Dados protegidos"],
  },
  "leaving-home": {
    title: "Trajeto iniciado",
    description: "Primeiro checkpoint confirmado.",
    metrics: ["07:15", "1 evento"],
  },
  "community-checkpoint": {
    title: "Ponto seguro validado",
    description: "Passagem confirmada pela comunidade.",
    metrics: ["07:21", "2 eventos"],
  },
  boarding: {
    title: "Embarque confirmado",
    description: "Linha Escolar 04 autorizada.",
    metrics: ["07:28", "Transporte identificado"],
  },
  "bus-route": {
    title: "Rota principal confirmada",
    description: "Uma alternativa pede reforco.",
    metrics: ["2 checkpoints", "1 atencao"],
  },
  "school-arrival": {
    title: "Chegada confirmada",
    description: "A escola encerrou a jornada.",
    metrics: ["07:46", "Jornada encerrada"],
  },
  "camera-rise": {
    title: "Rede em contexto",
    description: "Os pontos aparecem conectados.",
    metrics: ["4 eventos", "1 atencao"],
  },
  "network-map": {
    title: "Jornada concluida",
    description: "Todos os eventos foram registrados.",
    metrics: ["4 confirmacoes", "Rede conectada"],
  },
};

export function getVisiblePhoneNotifications(stage: JourneyStage) {
  const ids = new Set(visibleNotificationsByStage[stage]);
  return journeyPhoneNotifications.filter((notification) => ids.has(notification.id));
}

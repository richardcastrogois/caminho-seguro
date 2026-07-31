import type {
  GuardianNotification,
  JourneyAsset,
  JourneyCheckpoint,
  JourneyScene,
} from "./journey.types";

const assetBase = "/illustrations/protected-journey/optimized";

export const journeyAssets: Record<string, JourneyAsset> = {
  home: {
    id: "home",
    src: `${assetBase}/home.svg`,
    alt: "Casa onde a jornada protegida comeca.",
  },
  child: {
    id: "child",
    src: `${assetBase}/child-walking.svg`,
    alt: "Crianca caminhando no trajeto protegido.",
  },
  communityStore: {
    id: "community-store",
    src: `${assetBase}/community-store.svg`,
    alt: "Comercio comunitario usado como ponto seguro.",
  },
  busStop: {
    id: "bus-stop",
    src: `${assetBase}/bus-stop.svg`,
    alt: "Parada de transporte escolar.",
  },
  schoolBus: {
    id: "school-bus",
    src: `${assetBase}/school-bus.svg`,
    alt: "Onibus escolar no trajeto.",
  },
  school: {
    id: "school",
    src: `${assetBase}/school.svg`,
    alt: "Escola no destino final do trajeto.",
  },
  neighborhood: {
    id: "neighborhood",
    src: `${assetBase}/neighborhood.svg`,
    alt: "Mapa do bairro com pontos da rede de protecao.",
  },
};

export const journeyCheckpoints: JourneyCheckpoint[] = [
  {
    id: "home-start",
    label: "Trajeto iniciado",
    shortLabel: "Inicio",
    time: "07:15",
    state: "validated",
    stage: "leaving-home",
  },
  {
    id: "safe-point",
    label: "Ponto Seguro Avenida Brasil",
    shortLabel: "Ponto Seguro Avenida Brasil",
    time: "07:21",
    state: "validated",
    stage: "community-checkpoint",
  },
  {
    id: "boarding",
    label: "Embarque confirmado",
    shortLabel: "Embarque",
    time: "07:28",
    state: "validating",
    stage: "boarding",
  },
  {
    id: "attention-zone",
    label: "Area sem cobertura direta",
    shortLabel: "Atencao",
    state: "attention",
    stage: "bus-route",
  },
  {
    id: "school-arrival",
    label: "Chegada a escola",
    shortLabel: "Chegada",
    time: "07:46",
    state: "idle",
    stage: "school-arrival",
  },
];

export const guardianTimeline: GuardianNotification[] = [
  {
    id: "started",
    time: "07:15",
    title: "Trajeto iniciado",
    description: "Saida registrada sem expor localizacao continua.",
    state: "validated",
  },
  {
    id: "safe-point",
    time: "07:21",
    title: "Ponto seguro validado",
    description: "Rede comunitaria confirmou uma passagem importante.",
    state: "validated",
  },
  {
    id: "boarding",
    time: "07:28",
    title: "Embarque confirmado",
    description: "Transporte registrou o evento de embarque.",
    state: "validating",
  },
  {
    id: "arrival",
    time: "07:46",
    title: "Chegada a escola",
    description: "Escola recebe a confirmacao final do trajeto.",
    state: "idle",
  },
];

export const journeyScenes: JourneyScene[] = [
  {
    id: "home-zone",
    stage: "leaving-home",
    title: "Casa",
    description: "A jornada comeca com um evento, nao com vigilancia continua.",
  },
  {
    id: "community-zone",
    stage: "community-checkpoint",
    title: "Ponto seguro",
    description: "Comercio e comunidade ajudam a confirmar passagens relevantes.",
  },
  {
    id: "bus-stop-zone",
    stage: "boarding",
    title: "Parada",
    description: "O embarque vira uma notificacao objetiva para o responsavel.",
  },
  {
    id: "school-zone",
    stage: "school-arrival",
    title: "Escola",
    description: "A chegada encerra a jornada com contexto suficiente para agir.",
  },
];

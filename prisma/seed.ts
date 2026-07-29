import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  AlertSeverity,
  AlertStatus,
  AlertType,
  ChildStatus,
  EventSeverity,
  EventSource,
  EventType,
  GuardianRelationship,
  IdentifierStatus,
  IdentifierType,
  InstitutionMemberRole,
  InstitutionType,
  PrismaClient,
  UserRole,
  UserStatus,
} from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

dotenv.config({
  path: ".env.local",
});

const connectionString =
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_DATABASE_URL;

if (!connectionString) {
  throw new Error("A conexão PostgreSQL não foi encontrada para executar o seed.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Iniciando dados de demonstracao do Caminho Seguro...");
  const demoPasswordHash = await bcrypt.hash("123456", 12);

  const guardianUser = await prisma.user.upsert({
    where: {
      email: "ana.responsavel@caminhoseguro.demo",
    },
    update: {
      name: "Ana Souza",
      phone: "+55 19 99999-1001",
      passwordHash: demoPasswordHash,
      role: UserRole.GUARDIAN,
      status: UserStatus.ACTIVE,
    },
    create: {
      name: "Ana Souza",
      email: "ana.responsavel@caminhoseguro.demo",
      phone: "+55 19 99999-1001",
      passwordHash: demoPasswordHash,
      role: UserRole.GUARDIAN,
      status: UserStatus.ACTIVE,
    },
  });

  const guardian = await prisma.guardian.upsert({
    where: {
      userId: guardianUser.id,
    },
    update: {},
    create: {
      userId: guardianUser.id,
    },
  });

  await prisma.notificationPreference.upsert({
    where: {
      guardianId: guardian.id,
    },
    update: {
      dashboard: true,
      email: true,
      browserPush: true,
      telegram: false,
    },
    create: {
      guardianId: guardian.id,
      dashboard: true,
      email: true,
      browserPush: true,
      telegram: false,
    },
  });

  const child = await prisma.child.upsert({
    where: {
      publicId: "crianca-demo-maria",
    },
    update: {
      firstName: "Maria",
      lastName: "Souza",
      status: ChildStatus.ACTIVE,
      emergencyNote: "Entrar em contato com a responsável principal.",
    },
    create: {
      publicId: "crianca-demo-maria",
      firstName: "Maria",
      lastName: "Souza",
      birthDate: new Date("2016-04-12T12:00:00.000Z"),
      status: ChildStatus.ACTIVE,
      emergencyNote: "Entrar em contato com a responsável principal.",
    },
  });

  await prisma.childGuardian.upsert({
    where: {
      childId_guardianId: {
        childId: child.id,
        guardianId: guardian.id,
      },
    },
    update: {
      relationship: GuardianRelationship.MOTHER,
      isPrimary: true,
      canReceiveAlerts: true,
    },
    create: {
      childId: child.id,
      guardianId: guardian.id,
      relationship: GuardianRelationship.MOTHER,
      isPrimary: true,
      canReceiveAlerts: true,
    },
  });

  const school = await prisma.institution.upsert({
    where: {
      publicId: "instituicao-demo-escola",
    },
    update: {
      name: "Escola Municipal Caminhos do Saber",
      type: InstitutionType.SCHOOL,
      active: true,
    },
    create: {
      publicId: "instituicao-demo-escola",
      name: "Escola Municipal Caminhos do Saber",
      type: InstitutionType.SCHOOL,
      email: "escola@caminhoseguro.demo",
      phone: "+55 19 3333-1001",
      address: "Rua da Educação, 100 - Campinas, SP",
      latitude: -22.9056,
      longitude: -47.0608,
      active: true,
    },
  });

  const transport = await prisma.institution.upsert({
    where: {
      publicId: "instituicao-demo-transporte",
    },
    update: {
      name: "Transporte Escolar Rota Segura",
      type: InstitutionType.TRANSPORT,
      active: true,
    },
    create: {
      publicId: "instituicao-demo-transporte",
      name: "Transporte Escolar Rota Segura",
      type: InstitutionType.TRANSPORT,
      email: "transporte@caminhoseguro.demo",
      phone: "+55 19 3333-2001",
      active: true,
    },
  });

  await prisma.institution.upsert({
    where: {
      publicId: "instituicao-demo-cras",
    },
    update: {
      name: "CRAS Jardim Esperança",
      type: InstitutionType.CRAS,
      active: true,
    },
    create: {
      publicId: "instituicao-demo-cras",
      name: "CRAS Jardim Esperança",
      type: InstitutionType.CRAS,
      phone: "+55 19 3333-3001",
      address: "Avenida da Comunidade, 250 - Campinas, SP",
      latitude: -22.907,
      longitude: -47.064,
      active: true,
    },
  });

  await prisma.institution.upsert({
    where: {
      publicId: "instituicao-demo-parceiro",
    },
    update: {
      name: "Farmácia Proteção Parceira",
      type: InstitutionType.PARTNER_BUSINESS,
      active: true,
    },
    create: {
      publicId: "instituicao-demo-parceiro",
      name: "Farmácia Proteção Parceira",
      type: InstitutionType.PARTNER_BUSINESS,
      phone: "+55 19 3333-4001",
      address: "Avenida Principal, 420 - Campinas, SP",
      latitude: -22.903,
      longitude: -47.058,
      active: true,
    },
  });

  const schoolUser = await prisma.user.upsert({
    where: {
      email: "operador.escola@caminhoseguro.demo",
    },
    update: {
      name: "Carlos Lima",
      role: UserRole.INSTITUTION_MEMBER,
      status: UserStatus.ACTIVE,
      passwordHash: demoPasswordHash,
    },
    create: {
      name: "Carlos Lima",
      email: "operador.escola@caminhoseguro.demo",
      passwordHash: demoPasswordHash,
      role: UserRole.INSTITUTION_MEMBER,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.institutionMember.upsert({
    where: {
      userId_institutionId: {
        userId: schoolUser.id,
        institutionId: school.id,
      },
    },
    update: {
      role: InstitutionMemberRole.OPERATOR,
      active: true,
    },
    create: {
      userId: schoolUser.id,
      institutionId: school.id,
      role: InstitutionMemberRole.OPERATOR,
      active: true,
    },
  });

  const transportUser = await prisma.user.upsert({
    where: {
      email: "operador.transporte@caminhoseguro.demo",
    },
    update: {
      name: "Roberto Santos",
      role: UserRole.TRANSPORT_MEMBER,
      status: UserStatus.ACTIVE,
      passwordHash: demoPasswordHash,
    },
    create: {
      name: "Roberto Santos",
      email: "operador.transporte@caminhoseguro.demo",
      passwordHash: demoPasswordHash,
      role: UserRole.TRANSPORT_MEMBER,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.institutionMember.upsert({
    where: {
      userId_institutionId: {
        userId: transportUser.id,
        institutionId: transport.id,
      },
    },
    update: {
      role: InstitutionMemberRole.MONITOR,
      active: true,
    },
    create: {
      userId: transportUser.id,
      institutionId: transport.id,
      role: InstitutionMemberRole.MONITOR,
      active: true,
    },
  });

  await prisma.user.upsert({
    where: {
      email: "rede.protecao@caminhoseguro.demo",
    },
    update: {
      name: "Rede de Protecao",
      role: UserRole.PUBLIC_AGENT,
      status: UserStatus.ACTIVE,
      passwordHash: demoPasswordHash,
    },
    create: {
      name: "Rede de Protecao",
      email: "rede.protecao@caminhoseguro.demo",
      passwordHash: demoPasswordHash,
      role: UserRole.PUBLIC_AGENT,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: {
      email: "admin@caminhoseguro.demo",
    },
    update: {
      name: "Administracao Caminho Seguro",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      passwordHash: demoPasswordHash,
    },
    create: {
      name: "Administracao Caminho Seguro",
      email: "admin@caminhoseguro.demo",
      passwordHash: demoPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  await prisma.childInstitution.upsert({
    where: {
      childId_institutionId: {
        childId: child.id,
        institutionId: school.id,
      },
    },
    update: {
      referenceCode: "4A-2026-MARIA",
      active: true,
    },
    create: {
      childId: child.id,
      institutionId: school.id,
      referenceCode: "4A-2026-MARIA",
      active: true,
    },
  });

  await prisma.childInstitution.upsert({
    where: {
      childId_institutionId: {
        childId: child.id,
        institutionId: transport.id,
      },
    },
    update: {
      referenceCode: "ROTA-01-MARIA",
      active: true,
    },
    create: {
      childId: child.id,
      institutionId: transport.id,
      referenceCode: "ROTA-01-MARIA",
      active: true,
    },
  });

  const qrIdentifier = await prisma.childIdentifier.upsert({
    where: {
      publicToken: "qr-demo-maria-caminho-seguro",
    },
    update: {
      status: IdentifierStatus.ACTIVE,
      label: "Pulseira principal - QR",
    },
    create: {
      publicToken: "qr-demo-maria-caminho-seguro",
      type: IdentifierType.QR_CODE,
      status: IdentifierStatus.ACTIVE,
      childId: child.id,
      label: "Pulseira principal - QR",
    },
  });

  const bleIdentifier = await prisma.childIdentifier.upsert({
    where: {
      publicToken: "ble-demo-maria-caminho-seguro",
    },
    update: {
      status: IdentifierStatus.ACTIVE,
      label: "Tag Bluetooth da mochila",
    },
    create: {
      publicToken: "ble-demo-maria-caminho-seguro",
      type: IdentifierType.BLE,
      status: IdentifierStatus.ACTIVE,
      childId: child.id,
      label: "Tag Bluetooth da mochila",
    },
  });

  const schoolGateway = await prisma.gatewayIdentifier.upsert({
    where: {
      publicToken: "gateway-demo-portao-escola",
    },
    update: {
      name: "Leitor BLE - Portão principal",
      status: IdentifierStatus.ACTIVE,
    },
    create: {
      publicToken: "gateway-demo-portao-escola",
      type: IdentifierType.BLE,
      status: IdentifierStatus.ACTIVE,
      institutionId: school.id,
      name: "Leitor BLE - Portão principal",
      lastSeenAt: new Date(),
    },
  });

  const transportRoute = await prisma.transportRoute.upsert({
    where: {
      id: "rota-demo-01",
    },
    update: {
      name: "Rota Jardim Esperança",
      vehiclePlate: "CSV-2026",
      driverName: "Roberto Santos",
      active: true,
    },
    create: {
      id: "rota-demo-01",
      institutionId: transport.id,
      name: "Rota Jardim Esperança",
      vehiclePlate: "CSV-2026",
      driverName: "Roberto Santos",
      active: true,
    },
  });

  const today = new Date();
  today.setHours(7, 2, 0, 0);

  const arrivalTime = new Date();
  arrivalTime.setHours(7, 28, 0, 0);

  const existingBoarding = await prisma.protectionEvent.findUnique({
    where: { publicId: "evento-demo-embarque-maria" },
  });

  if (!existingBoarding) {
    const { eventsService: es } = await import("../src/features/events/events.service");
    const boardingResult = await es.createEvent({
      publicId: "evento-demo-embarque-maria",
      childId: child.id,
      identifierId: bleIdentifier.id,
      institutionId: transport.id,
      transportRouteId: transportRoute.id,
      type: EventType.BUS_BOARDING,
      source: EventSource.BLE_GATEWAY,
      severity: EventSeverity.INFORMATIONAL,
      locationLabel: "Ponto comunitário Jardim Esperança",
      occurredAt: today,
      metadata: { demonstration: true, signalStrength: -54 },
    });
    console.log(
      `Embarque: blockchain ${boardingResult.blockchain?.status} (tx: ${boardingResult.blockchain?.transactionHash ?? "nenhuma"})`,
    );
  } else {
    console.log("Evento de embarque já existe, pulando.");
  }

  const existingArrival = await prisma.protectionEvent.findUnique({
    where: { publicId: "evento-demo-chegada-escola-maria" },
  });

  if (!existingArrival) {
    const { eventsService: es } = await import("../src/features/events/events.service");
    const arrivalResult = await es.createEvent({
      publicId: "evento-demo-chegada-escola-maria",
      childId: child.id,
      identifierId: bleIdentifier.id,
      gatewayId: schoolGateway.id,
      institutionId: school.id,
      type: EventType.SCHOOL_ARRIVAL,
      source: EventSource.BLE_GATEWAY,
      severity: EventSeverity.INFORMATIONAL,
      latitude: -22.9056,
      longitude: -47.0608,
      locationLabel: "Portão principal da escola",
      occurredAt: arrivalTime,
      metadata: {
        demonstration: true,
        detectionDurationSeconds: 8,
        signalStrength: -47,
      },
    });
    console.log(
      `Chegada: blockchain ${arrivalResult.blockchain?.status} (tx: ${arrivalResult.blockchain?.transactionHash ?? "nenhuma"})`,
    );
  } else {
    console.log("Evento de chegada já existe, pulando.");
  }

  const alert = await prisma.alert.upsert({
    where: {
      publicId: "alerta-demo-caminho-seguro",
    },
    update: {
      status: AlertStatus.RESOLVED,
    },
    create: {
      publicId: "alerta-demo-caminho-seguro",
      childId: child.id,
      institutionId: school.id,
      type: AlertType.SYSTEM,
      severity: AlertSeverity.LOW,
      status: AlertStatus.RESOLVED,
      title: "Ambiente de demonstração ativo",
      message: "Os dados fictícios do Caminho Seguro foram configurados corretamente.",
      resolvedAt: new Date(),
      resolutionNotes: "Alerta criado exclusivamente para demonstração.",
    },
  });

  console.log("Dados criados com sucesso.");
  console.log(`Criança: ${child.firstName} ${child.lastName}`);
  console.log(`Responsável: ${guardianUser.name}`);
  console.log(`Escola: ${school.name}`);
  console.log(`QR: ${qrIdentifier.publicToken}`);
  console.log(`Alerta de demonstração: ${alert.title}`);
}

main()
  .catch((error: unknown) => {
    console.error("Erro ao executar o seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

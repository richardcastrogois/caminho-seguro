-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'GUARDIAN', 'INSTITUTION_MEMBER', 'TRANSPORT_MEMBER', 'PUBLIC_AGENT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING');

-- CreateEnum
CREATE TYPE "GuardianRelationship" AS ENUM ('MOTHER', 'FATHER', 'GRANDMOTHER', 'GRANDFATHER', 'SIBLING', 'LEGAL_GUARDIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('SCHOOL', 'TRANSPORT', 'PROTECTION_AGENCY', 'UBS', 'CRAS', 'NGO', 'PARTNER_BUSINESS');

-- CreateEnum
CREATE TYPE "InstitutionMemberRole" AS ENUM ('ADMIN', 'OPERATOR', 'DRIVER', 'MONITOR', 'HEALTH_AGENT', 'SOCIAL_WORKER', 'PROTECTION_AGENT');

-- CreateEnum
CREATE TYPE "ChildStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "IdentifierType" AS ENUM ('QR_CODE', 'BLE', 'NFC');

-- CreateEnum
CREATE TYPE "IdentifierStatus" AS ENUM ('ACTIVE', 'REVOKED', 'LOST', 'EXPIRED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('SCHOOL_ARRIVAL', 'SCHOOL_EXIT', 'BUS_BOARDING', 'DISEMBARKING_BUS', 'HELP_REQUEST', 'CHILD_FOUND', 'CHILD_AT_RISK', 'MANUAL_CHECK_IN');

-- CreateEnum
CREATE TYPE "EventSource" AS ENUM ('BLE_GATEWAY', 'QR_PUBLIC_SCAN', 'QR_INSTITUTION_SCAN', 'NFC_SCAN', 'MANUAL', 'SYSTEM');

-- CreateEnum
CREATE TYPE "EventSeverity" AS ENUM ('INFORMATIONAL', 'ATTENTION', 'CRITICAL');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('RECEIVED', 'VALIDATED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('HELP_REQUEST', 'CHILD_FOUND', 'CHILD_AT_RISK', 'EXPECTED_EVENT_MISSING', 'IDENTIFIER_PROBLEM', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('DASHBOARD', 'EMAIL', 'BROWSER_PUSH', 'TELEGRAM');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ');

-- CreateEnum
CREATE TYPE "BlockchainStatus" AS ENUM ('PENDING', 'SUBMITTED', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW_SENSITIVE_DATA', 'ACKNOWLEDGE_ALERT', 'RESOLVE_ALERT', 'REVOKE_IDENTIFIER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guardian" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "status" "ChildStatus" NOT NULL DEFAULT 'ACTIVE',
    "medicalNotes" TEXT,
    "emergencyNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildGuardian" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "relationship" "GuardianRelationship" NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "canReceiveAlerts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildGuardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InstitutionType" NOT NULL,
    "document" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "role" "InstitutionMemberRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildInstitution" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "referenceCode" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildInstitution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildIdentifier" (
    "id" TEXT NOT NULL,
    "publicToken" TEXT NOT NULL,
    "type" "IdentifierType" NOT NULL,
    "status" "IdentifierStatus" NOT NULL DEFAULT 'ACTIVE',
    "childId" TEXT NOT NULL,
    "label" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildIdentifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GatewayIdentifier" (
    "id" TEXT NOT NULL,
    "publicToken" TEXT NOT NULL,
    "type" "IdentifierType" NOT NULL,
    "status" "IdentifierStatus" NOT NULL DEFAULT 'ACTIVE',
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GatewayIdentifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportRoute" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vehiclePlate" TEXT,
    "driverName" TEXT,
    "expectedDepartureTime" TIMESTAMP(3),
    "expectedArrivalTime" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProtectionEvent" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "identifierId" TEXT,
    "gatewayId" TEXT,
    "institutionId" TEXT,
    "transportRouteId" TEXT,
    "createdByUserId" TEXT,
    "type" "EventType" NOT NULL,
    "source" "EventSource" NOT NULL,
    "severity" "EventSeverity" NOT NULL DEFAULT 'INFORMATIONAL',
    "status" "EventStatus" NOT NULL DEFAULT 'RECEIVED',
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "locationLabel" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProtectionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "eventId" TEXT,
    "institutionId" TEXT,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "acknowledgedByUserId" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedByUserId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alertId" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "dashboard" BOOLEAN NOT NULL DEFAULT true,
    "email" BOOLEAN NOT NULL DEFAULT true,
    "browserPush" BOOLEAN NOT NULL DEFAULT true,
    "telegram" BOOLEAN NOT NULL DEFAULT false,
    "telegramChatId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockchainRecord" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "network" TEXT NOT NULL DEFAULT 'solana-devnet',
    "status" "BlockchainStatus" NOT NULL DEFAULT 'PENDING',
    "eventHash" TEXT NOT NULL,
    "transactionHash" TEXT,
    "slot" BIGINT,
    "programVersion" TEXT NOT NULL DEFAULT '1',
    "submittedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlockchainRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_userId_key" ON "Guardian"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Child_publicId_key" ON "Child"("publicId");

-- CreateIndex
CREATE INDEX "Child_status_idx" ON "Child"("status");

-- CreateIndex
CREATE INDEX "Child_lastName_firstName_idx" ON "Child"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "ChildGuardian_guardianId_idx" ON "ChildGuardian"("guardianId");

-- CreateIndex
CREATE UNIQUE INDEX "ChildGuardian_childId_guardianId_key" ON "ChildGuardian"("childId", "guardianId");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_publicId_key" ON "Institution"("publicId");

-- CreateIndex
CREATE INDEX "Institution_type_idx" ON "Institution"("type");

-- CreateIndex
CREATE INDEX "Institution_active_idx" ON "Institution"("active");

-- CreateIndex
CREATE INDEX "InstitutionMember_institutionId_idx" ON "InstitutionMember"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionMember_userId_institutionId_key" ON "InstitutionMember"("userId", "institutionId");

-- CreateIndex
CREATE INDEX "ChildInstitution_institutionId_active_idx" ON "ChildInstitution"("institutionId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "ChildInstitution_childId_institutionId_key" ON "ChildInstitution"("childId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "ChildIdentifier_publicToken_key" ON "ChildIdentifier"("publicToken");

-- CreateIndex
CREATE INDEX "ChildIdentifier_childId_status_idx" ON "ChildIdentifier"("childId", "status");

-- CreateIndex
CREATE INDEX "ChildIdentifier_type_status_idx" ON "ChildIdentifier"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "GatewayIdentifier_publicToken_key" ON "GatewayIdentifier"("publicToken");

-- CreateIndex
CREATE INDEX "GatewayIdentifier_institutionId_status_idx" ON "GatewayIdentifier"("institutionId", "status");

-- CreateIndex
CREATE INDEX "TransportRoute_institutionId_active_idx" ON "TransportRoute"("institutionId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "ProtectionEvent_publicId_key" ON "ProtectionEvent"("publicId");

-- CreateIndex
CREATE INDEX "ProtectionEvent_childId_occurredAt_idx" ON "ProtectionEvent"("childId", "occurredAt");

-- CreateIndex
CREATE INDEX "ProtectionEvent_institutionId_occurredAt_idx" ON "ProtectionEvent"("institutionId", "occurredAt");

-- CreateIndex
CREATE INDEX "ProtectionEvent_type_occurredAt_idx" ON "ProtectionEvent"("type", "occurredAt");

-- CreateIndex
CREATE INDEX "ProtectionEvent_severity_status_idx" ON "ProtectionEvent"("severity", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_publicId_key" ON "Alert"("publicId");

-- CreateIndex
CREATE INDEX "Alert_childId_status_idx" ON "Alert"("childId", "status");

-- CreateIndex
CREATE INDEX "Alert_institutionId_status_idx" ON "Alert"("institutionId", "status");

-- CreateIndex
CREATE INDEX "Alert_severity_status_idx" ON "Alert"("severity", "status");

-- CreateIndex
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");

-- CreateIndex
CREATE INDEX "Notification_alertId_idx" ON "Notification"("alertId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_guardianId_key" ON "NotificationPreference"("guardianId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainRecord_eventId_key" ON "BlockchainRecord"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainRecord_eventHash_key" ON "BlockchainRecord"("eventHash");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainRecord_transactionHash_key" ON "BlockchainRecord"("transactionHash");

-- CreateIndex
CREATE INDEX "BlockchainRecord_status_idx" ON "BlockchainRecord"("status");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildGuardian" ADD CONSTRAINT "ChildGuardian_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildGuardian" ADD CONSTRAINT "ChildGuardian_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionMember" ADD CONSTRAINT "InstitutionMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionMember" ADD CONSTRAINT "InstitutionMember_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildInstitution" ADD CONSTRAINT "ChildInstitution_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildInstitution" ADD CONSTRAINT "ChildInstitution_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildIdentifier" ADD CONSTRAINT "ChildIdentifier_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GatewayIdentifier" ADD CONSTRAINT "GatewayIdentifier_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportRoute" ADD CONSTRAINT "TransportRoute_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProtectionEvent" ADD CONSTRAINT "ProtectionEvent_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProtectionEvent" ADD CONSTRAINT "ProtectionEvent_identifierId_fkey" FOREIGN KEY ("identifierId") REFERENCES "ChildIdentifier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProtectionEvent" ADD CONSTRAINT "ProtectionEvent_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "GatewayIdentifier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProtectionEvent" ADD CONSTRAINT "ProtectionEvent_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProtectionEvent" ADD CONSTRAINT "ProtectionEvent_transportRouteId_fkey" FOREIGN KEY ("transportRouteId") REFERENCES "TransportRoute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProtectionEvent" ADD CONSTRAINT "ProtectionEvent_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ProtectionEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_acknowledgedByUserId_fkey" FOREIGN KEY ("acknowledgedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockchainRecord" ADD CONSTRAINT "BlockchainRecord_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ProtectionEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

import type {
  EventSeverity,
  EventSource,
  EventType,
} from "@/generated/prisma/client";

export type CreateEventInput = {
  childId: string;
  type: EventType;
  source: EventSource;
  publicId?: string;
  occurredAt?: Date;
  identifierId?: string;
  gatewayId?: string;
  institutionId?: string;
  transportRouteId?: string;
  createdByUserId?: string;
  severity?: EventSeverity;
  latitude?: number;
  longitude?: number;
  locationLabel?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
};

export type CreateEventResult = {
  event: {
    id: string;
    publicId: string;
    type: string;
    source: string;
    severity: string;
    status: string;
    occurredAt: string;
    child: { publicId: string };
  };
  blockchain: {
    eventHash: string;
    transactionHash: string | null;
    slot: string | null;
    status: string;
  } | null;
};

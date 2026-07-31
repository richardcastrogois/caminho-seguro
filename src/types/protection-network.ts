export type ProtectionNetworkData = {
  institutions: Array<{
    publicId: string;
    name: string;
    type: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    active: boolean;
  }>;
  alerts: Array<{
    publicId: string;
    title: string;
    message: string;
    severity: string;
    status: string;
    createdAt: string;
    acknowledgedAt: string | null;
    resolvedAt: string | null;
    institutionName: string | null;
    latitude: number | null;
    longitude: number | null;
    locationLabel: string | null;
  }>;
  recentEvents: Array<{
    publicId: string;
    type: string;
    severity: string;
    occurredAt: string;
    institutionName: string | null;
    latitude: number | null;
    longitude: number | null;
    locationLabel: string | null;
  }>;
  severityCounts: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  responseTime: {
    averageMinutes: number | null;
    actedCount: number;
  };
  eventsByType: Array<{ type: string; count: number }>;
  eventsByInstitution: Array<{ name: string; count: number }>;
};

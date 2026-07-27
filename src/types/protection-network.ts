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
};

export type AdminDashboardData = {
  child: {
    publicId: string;
    fullName: string;
    guardianName: string | null;
    identifiers: Array<{
      publicToken: string;
      type: "QR_CODE" | "BLE" | "NFC";
      status: string;
      label: string | null;
      issuedAt: string;
      lastSeenAt: string | null;
    }>;
  } | null;
  children: Array<{
    publicId: string;
    fullName: string;
    guardianName: string | null;
    institutionName: string | null;
    identifiers: number;
  }>;
  institutions: Array<{
    publicId: string;
    name: string;
    type: string;
    active: boolean;
  }>;
  analytics: {
    events24h: number;
    events7d: number;
    eventsByDay: Array<{ date: string; count: number }>;
    eventsByType: Array<{ type: string; count: number }>;
    eventsBySource: Array<{ source: string; count: number }>;
  };
  blockchainHealth: {
    byStatus: Array<{ status: string; count: number }>;
    wallet: {
      configured: boolean;
      publicKey: string | null;
      balanceSOL: number | null;
      low: boolean;
    };
  };
  openAlerts: number;
};

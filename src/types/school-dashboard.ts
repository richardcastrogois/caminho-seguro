export type SchoolChildStatus = {
  publicId: string;
  firstName: string;
  lastName: string;
  referenceCode: string | null;
  identifierLabel: string | null;
  detected: boolean;
  arrivalTime: string | null;
  arrivalEventPublicId: string | null;
};

export type SchoolRecentEvent = {
  publicId: string;
  type: string;
  source: string;
  status: string;
  severity: string;
  occurredAt: string;
  childName: string;
  locationLabel: string | null;
  blockchainStatus: string | null;
};

export type SchoolAlertItem = {
  publicId: string;
  title: string;
  message: string;
  severity: string;
  status: string;
  createdAt: string;
};

export type SchoolDashboardData = {
  institution: {
    publicId: string;
    name: string;
    address: string | null;
  };
  gateway: {
    publicToken: string;
    name: string;
    status: string;
    lastSeenAt: string | null;
  } | null;
  summary: {
    expectedChildren: number;
    detectedChildren: number;
    pendingChildren: number;
    activeAlerts: number;
  };
  children: SchoolChildStatus[];
  recentEvents: SchoolRecentEvent[];
  alerts: SchoolAlertItem[];
};

export type TransportChild = {
  publicId: string;
  fullName: string;
  referenceCode: string | null;
  identifierLabel: string | null;
  lastEventType: "BUS_BOARDING" | "DISEMBARKING_BUS" | null;
  lastEventAt: string | null;
};

export type TransportDashboardData = {
  institution: {
    name: string;
  };
  route: {
    name: string;
    vehiclePlate: string | null;
    driverName: string | null;
  } | null;
  children: TransportChild[];
  recentEvents: Array<{
    publicId: string;
    type: "BUS_BOARDING" | "DISEMBARKING_BUS";
    occurredAt: string;
    childName: string;
    locationLabel: string | null;
  }>;
};

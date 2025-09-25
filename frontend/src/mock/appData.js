export const tourists = [
  {
    id: 'T-1001',
    name: 'Aarav Sharma',
    lastPing: '2025-09-25T12:20:00Z',
    status: 'safe',
    battery: 78,
    location: { lat: 28.6139, lng: 77.209 },
    lastKnownArea: 'Connaught Place, Delhi'
  },
  {
    id: 'T-1002',
    name: 'Meera Patel',
    lastPing: '2025-09-25T12:18:00Z',
    status: 'warning',
    battery: 42,
    location: { lat: 28.5355, lng: 77.391 },
    lastKnownArea: 'Sector 18, Noida'
  },
  {
    id: 'T-1003',
    name: 'Rahul Verma',
    lastPing: '2025-09-25T12:15:00Z',
    status: 'sos',
    battery: 33,
    location: { lat: 28.7041, lng: 77.1025 },
    lastKnownArea: 'Karol Bagh, Delhi'
  },
  {
    id: 'T-1004',
    name: 'Saanvi Iyer',
    lastPing: '2025-09-25T12:10:00Z',
    status: 'safe',
    battery: 91,
    location: { lat: 28.4595, lng: 77.0266 },
    lastKnownArea: 'Cyberhub, Gurugram'
  }
];

export const alerts = [
  {
    id: 'SOS-912',
    touristId: 'T-1003',
    touristName: 'Rahul Verma',
    priority: 'critical',
    timestamp: '2025-09-25T12:14:10Z',
    location: { lat: 28.7041, lng: 77.1025 },
    description: 'SOS triggered near Karol Bagh metro station',
    status: 'dispatching',
    assignedUnit: 'Unit 42'
  },
  {
    id: 'WARN-204',
    touristId: 'T-1002',
    touristName: 'Meera Patel',
    priority: 'high',
    timestamp: '2025-09-25T12:17:00Z',
    location: { lat: 28.5355, lng: 77.391 },
    description: 'Entering geo-fenced watch zone after dark',
    status: 'monitoring',
    assignedUnit: null
  },
  {
    id: 'INFO-701',
    touristId: 'T-1001',
    touristName: 'Aarav Sharma',
    priority: 'info',
    timestamp: '2025-09-25T12:05:00Z',
    location: { lat: 28.6139, lng: 77.209 },
    description: 'Checkpoint check-in recorded at Connaught Place',
    status: 'acknowledged',
    assignedUnit: 'Desk'
  }
];

export const responseUnits = [
  {
    id: 'Unit 42',
    type: 'Rapid Response',
    status: 'en-route',
    etaMinutes: 5,
    lastKnownLocation: 'Karol Bagh'
  },
  {
    id: 'Unit 17',
    type: 'Local Patrol',
    status: 'available',
    etaMinutes: 12,
    lastKnownLocation: 'Connaught Place'
  },
  {
    id: 'Unit 08',
    type: 'Medical Support',
    status: 'standby',
    etaMinutes: 15,
    lastKnownLocation: 'AIIMS Delhi'
  }
];

export const itineraries = {
  'T-1001': [
    { id: 'LEG-01', location: 'Connaught Place, Delhi', coords: [28.6304, 77.2177], eta: '2025-09-25T10:00:00Z', status: 'completed' },
    { id: 'LEG-02', location: 'India Gate', coords: [28.6129, 77.2295], eta: '2025-09-25T14:00:00Z', status: 'scheduled' },
    { id: 'LEG-03', location: 'Qutub Minar', coords: [28.5245, 77.1855], eta: '2025-09-26T09:30:00Z', status: 'planned' }
  ],
  'T-1002': [
    { id: 'LEG-04', location: 'Akshardham Temple', coords: [28.6127, 77.2773], eta: '2025-09-25T11:30:00Z', status: 'completed' },
    { id: 'LEG-05', location: 'Dilli Haat, INA', coords: [28.5687, 77.2090], eta: '2025-09-25T16:45:00Z', status: 'scheduled' }
  ],
  'T-1003': [
    { id: 'LEG-06', location: 'Karol Bagh Market', coords: [28.6514, 77.1904], eta: '2025-09-25T12:00:00Z', status: 'delayed' }
  ],
  'T-1004': [
    { id: 'LEG-07', location: 'Cyberhub, Gurugram', coords: [28.4946, 77.0896], eta: '2025-09-25T12:30:00Z', status: 'completed' },
    { id: 'LEG-08', location: 'Kingdom of Dreams', coords: [28.4692, 77.0680], eta: '2025-09-25T19:00:00Z', status: 'planned' }
  ]
};

export const emergencyContacts = {
  'T-1001': [
    { id: 'EC-01', name: 'Rohit Sharma', relation: 'Brother', phone: '+91-9876543211', reachable: true },
    { id: 'EC-02', name: 'Delhi Tourism Helpline', relation: 'Helpline', phone: '1363', reachable: true }
  ],
  'T-1002': [
    { id: 'EC-03', name: 'Ananya Patel', relation: 'Sister', phone: '+91-9823456789', reachable: false }
  ],
  'T-1003': [
    { id: 'EC-04', name: 'Police Control Room', relation: 'Emergency', phone: '100', reachable: true }
  ],
  'T-1004': [
    { id: 'EC-05', name: 'Aditya Iyer', relation: 'Parent', phone: '+91-9811122233', reachable: true }
  ]
};

export const watchZones = [
  {
    id: 'Z-DEL-001',
    name: 'Chandni Chowk Area',
    position: [28.6129, 77.2295],
    radius: 500,
    baseRisk: 'medium',
    descriptionDay: 'Moderate pickpocketing risk during peak hours',
    descriptionNight: 'High risk after dark due to low patrol density',
    incidents: 12
  },
  {
    id: 'Z-NOI-018',
    name: 'Noida Sector 18',
    position: [28.5355, 77.391],
    radius: 800,
    baseRisk: 'medium',
    descriptionDay: 'Commercial district with opportunistic theft reports',
    descriptionNight: 'Stay alert - reduced lighting in alleys',
    incidents: 7
  },
  {
    id: 'Z-DEL-007',
    name: 'Karol Bagh Market',
    position: [28.6514, 77.1904],
    radius: 650,
    baseRisk: 'high',
    descriptionDay: 'Crowded market - beware of scams',
    descriptionNight: 'High priority surveillance zone after 9 PM',
    incidents: 15
  }
];

export const policeStations = [
  {
    id: 'PS-CP',
    position: [28.6289, 77.2065],
    name: 'CP Police Station',
    contact: '100',
    available: true,
    responseTime: '3-5 min'
  },
  {
    id: 'PS-RF',
    position: [28.6562, 77.241],
    name: 'Red Fort Police',
    contact: '100',
    available: true,
    responseTime: '5-7 min'
  },
  {
    id: 'PS-NOIDA',
    position: [28.5704, 77.3212],
    name: 'Noida Command Unit',
    contact: '101',
    available: false,
    responseTime: '10-12 min'
  }
];

export const recentIncidents = [
  { id: 'INC-01', lat: 28.6149, lng: 77.209, type: 'theft', time: '2 hours ago' },
  { id: 'INC-02', lat: 28.62, lng: 77.21, type: 'harassment', time: '5 hours ago' },
  { id: 'INC-03', lat: 28.54, lng: 77.39, type: 'scam', time: '1 day ago' }
];

export const travellerTips = [
  'Always keep your phone charged above 20% for emergencies',
  'Share your live location with trusted contacts when traveling',
  'Avoid displaying expensive items in crowded areas'
];

export const anomalyFeed = [
  {
    id: 'ANOM-001',
    touristId: 'T-1003',
    type: 'route-deviation',
    severity: 'critical',
    detectedAt: '2025-09-25T12:16:30Z',
    description: 'Tourist deviated 1.2km from planned route near Karol Bagh.',
    coords: [28.6514, 77.1904]
  },
  {
    id: 'ANOM-002',
    touristId: 'T-1002',
    type: 'prolonged-inactivity',
    severity: 'high',
    detectedAt: '2025-09-25T11:58:05Z',
    description: 'No movement detected for 35 minutes inside watch zone.',
    coords: [28.5355, 77.3910]
  },
  {
    id: 'ANOM-003',
    touristId: 'T-1001',
    type: 'signal-loss',
    severity: 'medium',
    detectedAt: '2025-09-25T09:45:00Z',
    description: 'GPS signal dropped for 4 minutes between Connaught Place and India Gate.',
    coords: [28.6210, 77.2190]
  }
];

export const wearableTelemetry = {
  'T-1001': { deviceId: 'WB-DEL-001', battery: 72, heartRate: 88, connected: true, lastSync: '2025-09-25T12:19:40Z' },
  'T-1002': { deviceId: 'WB-DEL-002', battery: 54, heartRate: 104, connected: true, lastSync: '2025-09-25T12:18:10Z' },
  'T-1003': { deviceId: 'WB-DEL-003', battery: 29, heartRate: 118, connected: false, lastSync: '2025-09-25T11:52:00Z' },
  'T-1004': { deviceId: 'WB-GGN-004', battery: 87, heartRate: 76, connected: true, lastSync: '2025-09-25T12:09:55Z' }
};

export const safetyScoreHistory = {
  'T-1001': [88, 90, 86, 84, 87, 85],
  'T-1002': [72, 70, 68, 66, 65, 64],
  'T-1003': [55, 52, 49, 45, 43, 40],
  'T-1004': [92, 93, 91, 90, 89, 90]
};

export const heatmapClusters = [
  { id: 'CL-01', lat: 28.6135, lng: 77.2090, intensity: 0.8 },
  { id: 'CL-02', lat: 28.6120, lng: 77.2295, intensity: 0.6 },
  { id: 'CL-03', lat: 28.5355, lng: 77.3910, intensity: 0.55 },
  { id: 'CL-04', lat: 28.4595, lng: 77.0266, intensity: 0.4 }
];

export const eFirQueue = [
  {
    id: 'EFIR-2025-0912',
    alertId: 'SOS-912',
    touristId: 'T-1003',
    status: 'draft',
    createdAt: '2025-09-25T12:16:45Z',
    officer: 'Inspector Kavita Sharma'
  }
];

export const getAuthorityStats = () => {
  const activeAlerts = alerts.filter(alert => alert.priority !== 'info').length;
  const sosCount = alerts.filter(alert => alert.priority === 'critical').length;
  const monitoredTourists = tourists.filter(tourist => tourist.status !== 'safe').length;
  const totalTourists = tourists.length;

  return {
    activeAlerts,
    sosCount,
    monitoredTourists,
    totalTourists
  };
};

export const getTravellerStats = () => {
  const safePlaces = watchZones.filter(zone => zone.baseRisk !== 'high').length;
  const alertsSent = alerts.length;
  const activeWarnings = alerts.filter(alert => alert.priority !== 'info').length;
  const avgBattery = Math.round(
    tourists.reduce((acc, tourist) => acc + tourist.battery, 0) / tourists.length
  );

  return {
    safePlaces,
    alertsSent,
    activeWarnings,
    avgBattery
  };
};

export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const getItineraryForTourist = (touristId) => itineraries[touristId] || [];

export const getEmergencyContacts = (touristId) => emergencyContacts[touristId] || [];

export const getSafetyTrend = (touristId) => safetyScoreHistory[touristId] || [];

export const getAnomaliesForTourist = (touristId) => anomalyFeed.filter(anomaly => anomaly.touristId === touristId);

export const getWearableStatus = (touristId) => wearableTelemetry[touristId] || null;

export const getHeatmapData = () => heatmapClusters;

export const createEFirDraft = (alertId) => {
  const alert = alerts.find(item => item.id === alertId);
  if (!alert) return null;

  return {
    id: `EFIR-${alertId}`,
    alertId,
    touristId: alert.touristId,
    createdAt: new Date().toISOString(),
    status: 'draft',
    officer: 'Duty Officer',
    description: alert.description,
    location: alert.location
  };
};

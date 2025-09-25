// services/mockApi.js
// Centralized mock data source simulating backend endpoints for SafarSathi frontend

import dayjs from 'dayjs';

const wait = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

const baseProfile = {
  id: 'tourist-9101',
  blockchainID: 'BC-79F4A12D94EA',
  name: 'Aarav Sharma',
  nationality: 'Indian',
  email: 'aarav.sharma@example.com',
  phone: '+91 98200 12345',
  avatar: 'https://avatars.dicebear.com/api/avataaars/aarav-sharma.svg',
  passportNumber: 'M1234567',
  aadhaar: '2345 6789 0123',
  tripStart: dayjs().subtract(2, 'day').toISOString(),
  tripEnd: dayjs().add(5, 'day').toISOString(),
  emergencyOptIn: true,
  preferences: {
    shareLiveLocation: true,
    allowGeoFenceAlerts: true,
    allowIoTTracking: false,
    preferredLanguage: 'en'
  }
};

const itinerary = [
  {
    id: 'leg-1',
    day: dayjs().format('YYYY-MM-DD'),
    title: 'Kamakhya Temple Visit',
    city: 'Guwahati',
    time: '09:30 AM',
    status: 'completed',
    notes: 'Completed with guide. Check-in verified via blockchain ID.'
  },
  {
    id: 'leg-2',
    day: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    title: 'Kaziranga National Park Safari',
    city: 'Golaghat',
    time: '06:00 AM',
    status: 'scheduled',
    notes: 'Geo-fence monitoring enabled. Rangers notified.'
  },
  {
    id: 'leg-3',
    day: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    title: 'Majuli Island Ferry',
    city: 'Jorhat',
    time: '11:00 AM',
    status: 'scheduled',
    notes: 'High-risk zone flag: ensure life jackets.'
  }
];

const emergencyContacts = [
  {
    id: 'em-1',
    name: 'Local Control Room',
    type: 'police',
    phone: '112',
    description: '24/7 Police Response',
    priority: 'critical'
  },
  {
    id: 'em-2',
    name: 'Tourism Helpline',
    type: 'tourism',
    phone: '1800-209-9055',
    description: 'Assam Tourism Department helpline',
    priority: 'high'
  },
  {
    id: 'em-3',
    name: 'Family - Priya Sharma',
    type: 'family',
    phone: '+91 99876 54321',
    description: 'Emergency contact (sister)',
    priority: 'medium'
  }
];

const anomalyEvents = [
  {
    id: 'an-1',
    type: 'route_deviation',
    timestamp: dayjs().subtract(3, 'hour').toISOString(),
    severity: 'medium',
    details: 'Left planned route by 1.2km near Kaziranga buffer zone',
    resolved: true,
    resolutionNotes: 'Tourist returned to safe path after helpline call'
  },
  {
    id: 'an-2',
    type: 'inactivity',
    timestamp: dayjs().subtract(90, 'minute').toISOString(),
    severity: 'high',
    details: 'No movement detected for 45 minutes in red zone',
    resolved: false,
    resolutionNotes: null
  }
];

const geoFenceZones = [
  {
    id: 'zone-az01',
    name: 'Restricted Wildlife Area',
    level: 'critical',
    radius: 750,
    center: { lat: 26.5775, lng: 93.1711 },
    reason: 'Tiger habitat, entry with ranger only'
  },
  {
    id: 'zone-az02',
    name: 'Evening Caution Zone',
    level: 'warning',
    radius: 1200,
    center: { lat: 26.2006, lng: 92.9376 },
    reason: 'Low lighting after 8 PM, stay vigilant'
  }
];

const iotDevices = [
  {
    id: 'iot-1',
    type: 'smart-band',
    battery: 68,
    lastSignal: dayjs().subtract(10, 'minute').toISOString(),
    signalStrength: 'good',
    heartRate: 86
  },
  {
    id: 'iot-2',
    type: 'gps-tag',
    battery: 92,
    lastSignal: dayjs().subtract(2, 'minute').toISOString(),
    signalStrength: 'excellent',
    temperature: 32
  }
];

const blockchainLogs = [
  {
    id: 'log-1',
    action: 'DIGITAL_ID_VERIFIED',
    actor: 'Assam Tourism',
    timestamp: dayjs().subtract(6, 'hour').toISOString(),
    metadata: 'Hotel Check-in - Taj Guwahati'
  },
  {
    id: 'log-2',
    action: 'GEOFENCE_ALERT_ACK',
    actor: 'Control Room 3',
    timestamp: dayjs().subtract(90, 'minute').toISOString(),
    metadata: 'Kaziranga buffer zone breach'
  }
];

export const fetchTouristProfile = async () => {
  await wait();
  return JSON.parse(JSON.stringify(baseProfile));
};

export const fetchItinerary = async () => {
  await wait();
  return JSON.parse(JSON.stringify(itinerary));
};

export const fetchEmergencyContacts = async () => {
  await wait();
  return JSON.parse(JSON.stringify(emergencyContacts));
};

export const fetchAnomalies = async () => {
  await wait();
  return JSON.parse(JSON.stringify(anomalyEvents));
};

export const fetchGeoFenceZones = async () => {
  await wait();
  return JSON.parse(JSON.stringify(geoFenceZones));
};

export const fetchIoTDevices = async () => {
  await wait();
  return JSON.parse(JSON.stringify(iotDevices));
};

export const fetchBlockchainLogs = async () => {
  await wait();
  return JSON.parse(JSON.stringify(blockchainLogs));
};

export const updatePreferences = async (partialPrefs) => {
  await wait(300);
  Object.assign(baseProfile.preferences, partialPrefs);
  return JSON.parse(JSON.stringify(baseProfile.preferences));
};

export const generateDigitalIdPayload = async () => {
  await wait(250);
  return {
    ...baseProfile,
    issuedAt: dayjs().subtract(2, 'day').toISOString(),
    expiresAt: baseProfile.tripEnd,
    safetyScore: 87,
    lastKnownLocation: {
      lat: 26.2006,
      lng: 92.9376,
      label: 'Guwahati City Center'
    }
  };
};

export const generateEFIRDraft = async ({ touristId, reason, location }) => {
  await wait(500);
  return {
    firNumber: `E-FIR-${Math.floor(Math.random() * 9999)}`,
    touristId,
    filedAt: new Date().toISOString(),
    reason,
    location,
    status: 'draft',
    downloadUrl: '#'
  };
};

export const acknowledgeAnomaly = async (anomalyId) => {
  await wait(300);
  const anomaly = anomalyEvents.find(event => event.id === anomalyId);
  if (anomaly) {
    anomaly.resolved = true;
    anomaly.resolutionNotes = 'Marked resolved by tourist via app';
  }
  return JSON.parse(JSON.stringify(anomaly));
};

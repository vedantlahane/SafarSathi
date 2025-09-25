// services/mockApi.js
// Centralized mock data source simulating backend endpoints for SafarSathi frontend

import dayjs from 'dayjs';

const wait = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

// baseProfile removed - now using dynamic data from backend

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
    name: 'Nearest Police Station',
    type: 'police',
    phone: '100',
    description: 'Local Police Emergency Helpline',
    priority: 'critical'
  },
  {
    id: 'em-2',
    name: 'Assam State Tourism Helpline',
    type: 'tourism',
    phone: '1800-209-9055',
    description: 'Assam Tourism Department 24x7 Support',
    priority: 'high'
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

// fetchTouristProfile removed - now using dynamic data from backend

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
  // For now, just return the updated preferences
  // In a real implementation, this would update the backend
  const defaultPrefs = {
    shareLiveLocation: true,
    allowGeoFenceAlerts: true,
    allowIoTTracking: false,
    preferredLanguage: 'en'
  };
  return JSON.parse(JSON.stringify({ ...defaultPrefs, ...partialPrefs }));
};

export const generateDigitalIdPayload = async () => {
  await wait(250);
  // Fallback data when no real profile is available
  return {
    id: 'tourist-fallback',
    blockchainID: 'BC-FALLBACK',
    name: 'Tourist',
    nationality: 'Unknown',
    email: 'tourist@safarsathi.com',
    phone: '+91 00000 00000',
    issuedAt: dayjs().subtract(2, 'day').toISOString(),
    expiresAt: dayjs().add(5, 'day').toISOString(),
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

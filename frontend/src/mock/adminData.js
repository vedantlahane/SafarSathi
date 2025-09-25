export const mockTourists = [
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

export const mockAlerts = [
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

export const mockUnits = [
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

/**
 * Returns aggregate stats derived from the mock dataset to power dashboard cards.
 */
export const getMockStats = () => {
  const activeAlerts = mockAlerts.filter(alert => alert.priority !== 'info').length;
  const sosCount = mockAlerts.filter(alert => alert.priority === 'critical').length;
  const monitoredTourists = mockTourists.filter(tourist => tourist.status !== 'safe').length;
  const totalTourists = mockTourists.length;

  return {
    activeAlerts,
    sosCount,
    monitoredTourists,
    totalTourists
  };
};

/**
 * Helper to format timestamps for display without relying on locale.
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

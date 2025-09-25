import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AlertsPanel from '../../components/admin/AlertsPanel';
import ActivityTimeline from '../../components/admin/ActivityTimeline';
import { alerts, tourists } from '../../mock/appData';

const AdminAlerts = () => {
  const [selectedAlert, setSelectedAlert] = useState(alerts[0]);

  return (
    <AdminLayout title="Alert Center" subtitle="Review and acknowledge all incoming SOS and geo-fence notifications.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AlertsPanel alerts={alerts} onSelectAlert={setSelectedAlert} />
        </div>
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[220px]">
            <h2 className="text-lg font-semibold text-white mb-3">Alert Details</h2>
            {selectedAlert ? (
              <div className="space-y-2 text-sm text-slate-200">
                <p className="text-base font-semibold text-white">{selectedAlert.description}</p>
                <p>Priority: <span className="font-semibold uppercase">{selectedAlert.priority}</span></p>
                <p>Tourist: {selectedAlert.touristName}</p>
                <p>Status: {selectedAlert.status}</p>
                <p>Assigned Unit: {selectedAlert.assignedUnit || 'Not assigned'}</p>
                <p>Coordinates: {selectedAlert.location.lat.toFixed(4)}, {selectedAlert.location.lng.toFixed(4)}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Select an alert to see full context.</p>
            )}
          </div>
          <ActivityTimeline alerts={alerts} tourists={tourists} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAlerts;

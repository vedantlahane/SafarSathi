import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AlertsPanel from '../../components/admin/AlertsPanel';
import ActivityTimeline from '../../components/admin/ActivityTimeline';
import EFIRGenerator from '../../components/admin/EFIRGenerator';
import apiService from '../../services/apiService';
import { formatDateTime } from '../../utils/time';

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [tourists, setTourists] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAdminDashboardState();
      setAlerts(data.alerts || []);
      setTourists(data.tourists || []);
      setSelectedAlert(prev => prev || data.alerts?.[0] || null);
    } catch (err) {
      console.error('Failed to load alerts center', err);
      setError(err.message || 'Unable to load alerts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, [loadData]);

  const focusTourist = useMemo(
    () => tourists.find(t => t.id === selectedAlert?.touristId) || null,
    [tourists, selectedAlert]
  );

  return (
    <AdminLayout title="Alert Center" subtitle="Review and acknowledge all incoming SOS and geo-fence notifications.">
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="rounded border border-red-300/40 px-3 py-1 text-xs uppercase tracking-wide">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AlertsPanel alerts={alerts} onSelectAlert={setSelectedAlert} />
        </div>
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[220px]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Alert Details</h2>
              <button onClick={loadData} className="text-xs text-teal-200 hover:text-teal-100">Refresh</button>
            </div>
            {loading && alerts.length === 0 ? (
              <p className="text-sm text-slate-400">Fetching alerts…</p>
            ) : selectedAlert ? (
              <div className="space-y-2 text-sm text-slate-200">
                <p className="text-base font-semibold text-white">{selectedAlert.description || selectedAlert.message}</p>
                <p>Priority: <span className="font-semibold uppercase">{selectedAlert.priority}</span></p>
                <p>Tourist: {selectedAlert.touristName || 'Unknown'}</p>
                <p>Status: {selectedAlert.status || 'NEW'}</p>
                <p>Timestamp: {formatDateTime(selectedAlert.timestamp)}</p>
                <p>Assigned Unit: {selectedAlert.assignedUnit || 'Not assigned'}</p>
                <p>Coordinates: {selectedAlert.lat?.toFixed?.(4) || '—'}, {selectedAlert.lng?.toFixed?.(4) || '—'}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Select an alert to see full context.</p>
            )}
          </div>
          <EFIRGenerator defaultTourist={focusTourist} />
          <ActivityTimeline alerts={alerts} tourists={tourists} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAlerts;

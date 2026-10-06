import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchIncidents } from '../services/api';

export const Incidents: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchIncidents({ severity: filterSeverity })
      .then(setIncidents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterSeverity]);

  return (
    <div className="p-space-xl space-y-space-xl font-mono">
      {/* Header */}
      <div className="bg-surface-container-lowest p-space-xl rounded-lg shadow-md border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[2rem]">crisis_alert</span>
            <h1 className="text-xl font-bold text-on-surface tracking-tight">Security Incident Management Queue</h1>
          </div>
          <p className="text-xs text-on-surface-variant font-sans mt-1">
            Aggregated, correlated threat campaigns requiring active Tier-2/Tier-3 analyst investigation and response.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1.5 rounded font-bold ${
              filterSeverity === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            All Incidents ({incidents.length})
          </button>
          <button
            onClick={() => setFilterSeverity('CRITICAL')}
            className={`px-3 py-1.5 rounded font-bold ${
              filterSeverity === 'CRITICAL' ? 'bg-error text-on-error' : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setFilterSeverity('HIGH')}
            className={`px-3 py-1.5 rounded font-bold ${
              filterSeverity === 'HIGH' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            High
          </button>
        </div>
      </div>

      {/* Incident Cards Queue */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">Loading active security incidents...</div>
        ) : incidents.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant">No active incidents found matching criteria.</div>
        ) : (
          incidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => navigate(`/incidents/${inc.incident_id}`)}
              className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 hover:border-primary cursor-pointer transition-all shadow-md space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-error">{inc.incident_id}</span>
                  <span className="text-base font-bold text-on-surface font-sans">{inc.title}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      inc.severity === 'CRITICAL' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-secondary'
                    }`}
                  >
                    {inc.severity}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-surface-container-high text-tertiary text-xs font-bold">
                    STATUS: {inc.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-on-surface-variant block text-[0.65rem] uppercase">Risk Score</span>
                    <span className="text-error font-bold text-sm">{inc.risk_score}/100</span>
                  </div>
                  <div className="text-right">
                    <span className="text-on-surface-variant block text-[0.65rem] uppercase">Confidence</span>
                    <span className="text-tertiary font-bold text-sm">{inc.confidence}%</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant font-sans leading-relaxed">{inc.description}</p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs border-t border-outline-variant/20">
                <div className="flex items-center gap-4 text-[0.75rem]">
                  <span className="text-primary font-bold">{inc.events_count || 5} Correlated Events</span>
                  <span className="text-outline">•</span>
                  <span className="text-secondary font-bold">{inc.alerts_count || 4} Rules Triggered</span>
                  <span className="text-outline">•</span>
                  <span className="text-on-surface-variant">Assigned: {inc.assigned_to}</span>
                </div>

                <button className="px-4 py-1.5 bg-primary-container text-on-primary-container font-bold rounded hover:bg-primary transition-colors text-xs flex items-center gap-2">
                  <span>INVESTIGATE WORKBENCH</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

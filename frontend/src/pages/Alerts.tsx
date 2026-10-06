import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAlerts } from '../services/api';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts({ severity: filterSeverity })
      .then(setAlerts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterSeverity]);

  const filteredAlerts = alerts.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      a.alert_id.toLowerCase().includes(q) ||
      a.title.toLowerCase().includes(q) ||
      (a.mitre_technique && a.mitre_technique.toLowerCase().includes(q)) ||
      a.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-space-xl space-y-space-xl">
      {/* Top Command HUD */}
      <div className="bg-surface-container-lowest p-space-xl rounded-lg shadow-md border border-outline-variant/30 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-md">
              <h1 className="font-semibold text-xl text-on-surface tracking-tight">Security Alerts Triage</h1>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-surface-container rounded font-mono text-xs text-tertiary">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                <span>PIPELINE: ACTIVE (42.8k EPS)</span>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Continuous real-time alert correlation, MITRE mapping, and autonomous rule-engine prioritization pipeline.
            </p>
          </div>
        </div>

        {/* Filter Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto font-mono text-xs pt-2">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1.5 rounded font-bold transition-all ${
              filterSeverity === 'all'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilterSeverity('CRITICAL')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${
              filterSeverity === 'CRITICAL'
                ? 'bg-error text-on-error font-bold'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-error"></span>
            <span>Critical</span>
          </button>
          <button
            onClick={() => setFilterSeverity('HIGH')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${
              filterSeverity === 'HIGH'
                ? 'bg-secondary text-on-secondary font-bold'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span>High</span>
          </button>
          <button
            onClick={() => setFilterSeverity('MEDIUM')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${
              filterSeverity === 'MEDIUM'
                ? 'bg-tertiary text-on-tertiary font-bold'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            <span>Medium</span>
          </button>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="bg-surface-container-low p-space-md rounded-lg flex flex-col md:flex-row items-center justify-between gap-space-md border border-outline-variant/30">
        <div className="relative w-full max-w-xl font-mono text-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[1.125rem]">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter alerts by ID, hash, IP, user, technique (e.g. T1059.001)..."
            className="w-full bg-surface-container rounded pl-9 pr-4 py-2 text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-high border border-outline-variant/30"
          />
        </div>
      </div>

      {/* Forensic Data Table */}
      <div className="bg-surface-container-lowest rounded-lg shadow-md border border-outline-variant/30 overflow-hidden font-mono text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/40 text-on-surface-variant font-bold text-[0.7rem] uppercase">
              <th className="p-3">Alert ID</th>
              <th className="p-3">Title &amp; Description</th>
              <th className="p-3">Severity</th>
              <th className="p-3">MITRE</th>
              <th className="p-3">Risk Score</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-on-surface-variant">
                  Loading telemetry alerts...
                </td>
              </tr>
            ) : filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-on-surface-variant">
                  No security alerts matched the specified criteria.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alt) => (
                <tr key={alt.id} className="hover:bg-surface-container-high/50 transition-colors">
                  <td className="p-3 font-bold text-primary">{alt.alert_id}</td>
                  <td className="p-3 font-sans">
                    <div className="font-semibold text-on-surface">{alt.title}</div>
                    <div className="text-[0.75rem] text-on-surface-variant line-clamp-1">{alt.description}</div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${
                        alt.severity === 'CRITICAL'
                          ? 'bg-error-container text-on-error-container border border-error/40'
                          : alt.severity === 'HIGH'
                          ? 'bg-surface-container-high text-secondary border border-secondary/40'
                          : 'bg-surface-container text-tertiary'
                      }`}
                    >
                      {alt.severity}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-tertiary">{alt.mitre_technique || 'N/A'}</td>
                  <td className="p-3 font-bold">{alt.risk_score}/100</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface text-[0.65rem]">
                      {alt.status}
                    </span>
                  </td>
                  <td className="p-3 text-on-surface-variant text-[0.7rem]">
                    {new Date(alt.created_at).toLocaleTimeString()}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => navigate(`/alerts/${alt.alert_id}`)}
                      className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-primary font-bold rounded text-[0.7rem] transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

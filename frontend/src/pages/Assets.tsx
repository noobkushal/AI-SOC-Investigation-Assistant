import React, { useEffect, useState } from 'react';
import { fetchAssets } from '../services/api';

export const Assets: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets()
      .then(setAssets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center font-mono text-on-surface-variant">Loading Enterprise Asset Inventory...</div>;
  }

  return (
    <div className="p-space-xl space-y-space-xl font-mono">
      {/* Top Banner */}
      <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 space-y-2">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[2.5rem]">dns</span>
          <div>
            <h1 className="text-xl font-bold text-on-surface tracking-tight">Enterprise Asset Inventory &amp; Host Risk Matrix</h1>
            <p className="text-xs text-on-surface-variant font-sans mt-0.5">
              Continuous endpoint, domain controller, and cloud instance posture monitoring.
            </p>
          </div>
        </div>
      </div>

      {/* Assets Data Table */}
      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 overflow-hidden shadow-md text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/40 text-on-surface-variant font-bold uppercase">
              <th className="p-3">Hostname</th>
              <th className="p-3">IP Address</th>
              <th className="p-3">Operating System</th>
              <th className="p-3">Owner / Department</th>
              <th className="p-3">Criticality</th>
              <th className="p-3">Risk Score</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {assets.map((ast) => (
              <tr key={ast.id} className="hover:bg-surface-container-high/50 transition-colors">
                <td className="p-3 font-bold text-primary">{ast.hostname}</td>
                <td className="p-3 text-tertiary">{ast.ip}</td>
                <td className="p-3 font-sans text-on-surface">{ast.operating_system}</td>
                <td className="p-3 font-sans text-on-surface-variant">{ast.owner}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${
                      ast.criticality === 'CRITICAL'
                        ? 'bg-error-container text-on-error-container border border-error/40'
                        : ast.criticality === 'HIGH'
                        ? 'bg-surface-container-high text-secondary'
                        : 'bg-surface-container text-tertiary'
                    }`}
                  >
                    {ast.criticality}
                  </span>
                </td>
                <td className="p-3 font-bold text-error">{ast.risk_score}/100</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${ast.status === 'ACTIVE' ? 'bg-tertiary-container/30 text-tertiary' : 'bg-error-container text-on-error-container'}`}>
                    {ast.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

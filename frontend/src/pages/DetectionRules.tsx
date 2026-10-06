import React, { useEffect, useState } from 'react';
import { fetchDetectionRules, toggleDetectionRule } from '../services/api';

export const DetectionRules: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetectionRules()
      .then(setRules)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (ruleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await toggleDetectionRule(ruleId);
      setRules((prev) => prev.map((r) => (r.rule_id === updated.rule_id ? updated : r)));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center font-mono text-on-surface-variant">Loading Sigma Detection Rules Engine...</div>;
  }

  return (
    <div className="p-space-xl space-y-space-xl font-mono">
      {/* Top Banner */}
      <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 space-y-2">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[2.5rem]">policy</span>
          <div>
            <h1 className="text-xl font-bold text-on-surface tracking-tight">Sigma Detection Rules Manager</h1>
            <p className="text-xs text-on-surface-variant font-sans mt-0.5">
              Deterministic, dynamic rule-based detection engine loaded from JSON definitions in <code className="text-tertiary font-mono">detection-rules/</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 overflow-hidden shadow-md text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/40 text-on-surface-variant font-bold uppercase">
              <th className="p-3">Rule ID</th>
              <th className="p-3">Rule Name &amp; Description</th>
              <th className="p-3">Severity</th>
              <th className="p-3">MITRE ID</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {rules.map((r) => (
              <tr
                key={r.id}
                onClick={() => setSelectedRule(r)}
                className="hover:bg-surface-container-high/50 cursor-pointer transition-colors"
              >
                <td className="p-3 font-bold text-primary">{r.rule_id}</td>
                <td className="p-3 font-sans">
                  <div className="font-semibold text-on-surface">{r.name}</div>
                  <div className="text-[0.75rem] text-on-surface-variant line-clamp-1">{r.description}</div>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${
                      r.severity === 'CRITICAL'
                        ? 'bg-error-container text-on-error-container'
                        : r.severity === 'HIGH'
                        ? 'bg-surface-container-high text-secondary'
                        : 'bg-surface-container text-tertiary'
                    }`}
                  >
                    {r.severity}
                  </span>
                </td>
                <td className="p-3 font-bold text-tertiary">{r.mitre_technique || 'N/A'}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${r.enabled ? 'bg-tertiary-container/30 text-tertiary' : 'bg-surface-container text-outline'}`}>
                    {r.enabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={(e) => handleToggle(r.rule_id, e)}
                    className={`px-3 py-1 rounded text-[0.7rem] font-bold transition-colors ${
                      r.enabled
                        ? 'bg-error-container text-on-error-container hover:bg-error hover:text-on-error'
                        : 'bg-tertiary-container text-on-tertiary-container hover:bg-tertiary'
                    }`}
                  >
                    {r.enabled ? 'DISABLE' : 'ENABLE'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Rule Definition Inspector Modal */}
      {selectedRule && (
        <div className="p-6 bg-surface-container-lowest rounded-lg border border-primary space-y-3 shadow-2xl">
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-primary">{selectedRule.rule_id}</span>
              <span className="text-base font-bold text-on-surface font-sans">{selectedRule.name}</span>
            </div>
            <button onClick={() => setSelectedRule(null)} className="text-on-surface-variant hover:text-on-surface">
              ✕ CLOSE
            </button>
          </div>
          <pre className="p-4 bg-surface-container-low rounded text-tertiary text-xs overflow-x-auto border border-outline-variant/20 font-mono">
            {JSON.stringify(selectedRule.rule_definition, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

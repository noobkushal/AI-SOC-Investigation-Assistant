import React, { useEffect, useState } from 'react';
import { fetchMitreMatrix } from '../services/api';

export const MitreAttack: React.FC = () => {
  const [matrix, setMatrix] = useState<any>(null);
  const [selectedTech, setSelectedTech] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMitreMatrix()
      .then(setMatrix)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center font-mono text-on-surface-variant">Loading MITRE ATT&amp;CK Matrix...</div>;
  }

  return (
    <div className="p-space-xl space-y-space-xl font-mono">
      {/* Top Banner */}
      <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 space-y-2">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[2.5rem]">schema</span>
          <div>
            <h1 className="text-xl font-bold text-on-surface tracking-tight">MITRE ATT&amp;CK Framework Matrix</h1>
            <p className="text-xs text-on-surface-variant font-sans mt-0.5">
              Enterprise tactics and technique coverage heatmap mapping observed adversary behavior across telemetry streams.
            </p>
          </div>
        </div>
      </div>

      {/* MITRE Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {Object.entries(matrix || {}).map(([tactic, techniques]: [string, any]) => (
          <div key={tactic} className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 overflow-hidden shadow-sm flex flex-col">
            <div className="bg-surface-container-low p-3 border-b border-outline-variant/30 text-center font-bold text-xs text-primary uppercase tracking-wider">
              {tactic}
            </div>

            <div className="p-2 space-y-2 flex-1">
              {techniques.map((tech: any) => (
                <div
                  key={tech.technique_id}
                  onClick={() => setSelectedTech(tech)}
                  className={`p-2.5 rounded border transition-all cursor-pointer text-xs space-y-1 ${
                    tech.active_alerts_count > 0
                      ? 'bg-error-container/30 border-error text-on-error-container shadow-md'
                      : 'bg-surface-container-low border-outline-variant/20 hover:border-primary text-on-surface-variant'
                  }`}
                >
                  <div className="flex justify-between items-center text-[0.65rem] font-bold">
                    <span className="text-tertiary">{tech.technique_id}</span>
                    {tech.active_alerts_count > 0 && (
                      <span className="px-1.5 py-0.2 bg-error text-on-error rounded font-bold">
                        {tech.active_alerts_count} ALERTS
                      </span>
                    )}
                  </div>
                  <div className="font-sans font-semibold text-[0.75rem] text-on-surface">{tech.name}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Technique Inspector Modal */}
      {selectedTech && (
        <div className="p-6 bg-surface-container-lowest rounded-lg border border-primary space-y-3 shadow-2xl">
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-tertiary">{selectedTech.technique_id}</span>
              <span className="text-base font-bold text-on-surface font-sans">{selectedTech.name}</span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-primary text-xs uppercase">{selectedTech.tactic}</span>
            </div>
            <button onClick={() => setSelectedTech(null)} className="text-on-surface-variant hover:text-on-surface">
              ✕ CLOSE
            </button>
          </div>
          <p className="text-xs text-on-surface font-sans leading-relaxed">{selectedTech.description}</p>
        </div>
      )}
    </div>
  );
};

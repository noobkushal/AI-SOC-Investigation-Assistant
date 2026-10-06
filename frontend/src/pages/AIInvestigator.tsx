import React, { useState } from 'react';
import { runAIInvestigation } from '../services/api';

export const AIInvestigator: React.FC = () => {
  const [incidentIdInput, setIncidentIdInput] = useState('INC-8042');
  const [investigationData, setInvestigationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      const res = await runAIInvestigation(incidentIdInput);
      setInvestigationData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-space-xl space-y-space-xl font-mono">
      <div className="bg-surface-container-lowest p-6 rounded-lg border border-secondary/40 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[2.5rem]">neurology</span>
          <div>
            <h1 className="text-xl font-bold text-on-surface tracking-tight">AI SOC Investigation Assistant</h1>
            <p className="text-xs text-on-surface-variant font-sans mt-0.5">
              Evidence-grounded autonomous threat investigation, attack vector hypothesis synthesis, and remediation guidance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="text"
            value={incidentIdInput}
            onChange={(e) => setIncidentIdInput(e.target.value)}
            placeholder="Enter Incident ID (e.g. INC-8042)"
            className="bg-surface-container-low border border-outline-variant rounded px-3 py-2 text-xs text-on-surface w-64 focus:outline-none focus:border-secondary"
          />
          <button
            onClick={handleRun}
            disabled={loading}
            className="px-5 py-2 bg-secondary-container hover:bg-secondary text-on-secondary-container font-bold rounded text-xs transition-colors shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">bolt</span>
            <span>{loading ? 'ANALYZING TELEMETRY...' : 'RUN AI INVESTIGATION'}</span>
          </button>
        </div>
      </div>

      {investigationData && (
        <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <span className="text-sm font-bold text-primary uppercase">Investigation Analysis Results</span>
            <span className="text-xs text-tertiary font-bold">Precision Score: {investigationData.confidence}%</span>
          </div>

          <div className="space-y-4 font-sans text-xs">
            <div>
              <h3 className="font-mono text-tertiary font-bold text-xs uppercase mb-1">Executive Summary</h3>
              <p className="p-3 bg-surface-container-low rounded border border-outline-variant/20 text-on-surface leading-relaxed">
                {investigationData.ai_summary}
              </p>
            </div>

            <div>
              <h3 className="font-mono text-secondary font-bold text-xs uppercase mb-2">Grounded Evidence Analysis</h3>
              <div className="space-y-1 font-mono">
                {(investigationData.findings?.evidence_analysis || []).map((ev: string, idx: number) => (
                  <div key={idx} className="p-2 bg-surface-container-low rounded text-on-surface-variant text-[0.75rem] border-l-2 border-primary">
                    {ev}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-mono text-error font-bold text-xs uppercase mb-1">Attack Vector Hypothesis</h3>
              <p className="p-3 bg-surface-container-low rounded border border-outline-variant/20 text-on-surface leading-relaxed font-mono">
                {investigationData.findings?.attack_hypothesis}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  const [rawLog, setRawLog] = useState(`{"EventID": 4625, "TimeCreated": "2026-10-06T14:02:11Z", "TargetUserName": "admin", "IpAddress": "192.168.1.50", "Computer": "WORKSTATION-01"}`);
  const [sourceHint, setSourceHint] = useState('windows');
  const [ingestStatus, setIngestStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulateIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/events/ingest', { raw_log: rawLog, source_hint: sourceHint });
      setIngestStatus(res.data);
    } catch (err: any) {
      setIngestStatus({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-space-xl space-y-space-xl font-mono text-xs">
      {/* Settings Header */}
      <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 space-y-2">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[2.5rem]">settings</span>
          <div>
            <h1 className="text-xl font-bold text-on-surface tracking-tight">System Settings &amp; Log Ingestion Simulator</h1>
            <p className="text-xs text-on-surface-variant font-sans mt-0.5">
              Configure SIEM integrations, AI provider model preferences, and simulate real-time security log ingestion.
            </p>
          </div>
        </div>
      </div>

      {/* Log Ingestion Simulator Panel */}
      <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 space-y-4 shadow-md">
        <h2 className="text-sm font-bold text-tertiary uppercase border-b border-outline-variant/30 pb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">terminal</span>
          <span>Live SIEM Log Ingestion Simulator</span>
        </h2>

        <form onSubmit={handleSimulateIngest} className="space-y-4">
          <div>
            <label className="block text-on-surface-variant mb-1 font-bold uppercase">Log Source Format</label>
            <select
              value={sourceHint}
              onChange={(e) => setSourceHint(e.target.value)}
              className="bg-surface-container-low border border-outline-variant rounded px-3 py-1.5 text-on-surface w-64 focus:outline-none focus:border-tertiary"
            >
              <option value="windows">Windows Security Logs (EventID 4624 / 4625 / 4720 / 4688)</option>
              <option value="linux">Linux Authentication Log (/var/log/auth.log)</option>
              <option value="web">Web Access Server Log (Nginx / Apache)</option>
            </select>
          </div>

          <div>
            <label className="block text-on-surface-variant mb-1 font-bold uppercase">Raw Telemetry Payload</label>
            <textarea
              rows={4}
              value={rawLog}
              onChange={(e) => setRawLog(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded p-3 text-tertiary font-mono text-xs focus:outline-none focus:border-tertiary"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-tertiary-container text-on-tertiary-container hover:bg-tertiary font-bold rounded transition-colors shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">send</span>
            <span>{loading ? 'INGESTING & EVALUATING RULES...' : 'INGEST LOG & TRIGGER DETECTION ENGINE'}</span>
          </button>
        </form>

        {ingestStatus && (
          <div className="p-4 bg-surface-container-low rounded border border-tertiary text-xs space-y-1">
            <span className="text-tertiary font-bold uppercase block">Ingestion Engine Pipeline Status:</span>
            <pre className="text-on-surface text-[0.7rem] overflow-x-auto">{JSON.stringify(ingestStatus, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

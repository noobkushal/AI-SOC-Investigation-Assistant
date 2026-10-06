import React, { useEffect, useState } from 'react';
import { fetchReports, generateReport } from '../services/api';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [incidentId, setIncidentId] = useState('INC-8042');
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports()
      .then(setReports)
      .catch(console.error);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await generateReport(incidentId, format);
      if (format === 'pdf' && res.download_url) {
        window.open(res.download_url, '_blank');
      }
      const updated = await fetchReports();
      setReports(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-space-xl space-y-space-xl font-mono">
      {/* Top Banner */}
      <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 space-y-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[2.5rem]">summarize</span>
          <div>
            <h1 className="text-xl font-bold text-on-surface tracking-tight">Executive &amp; Technical Incident Reports</h1>
            <p className="text-xs text-on-surface-variant font-sans mt-0.5">
              Export comprehensive incident reports including timeline evidence, MITRE ATT&amp;CK maps, AI recommendations, and analyst notes.
            </p>
          </div>
        </div>

        {/* Report Generator Form */}
        <form onSubmit={handleGenerate} className="flex flex-wrap items-center gap-4 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant uppercase font-bold">Target Incident:</span>
            <input
              type="text"
              value={incidentId}
              onChange={(e) => setIncidentId(e.target.value)}
              className="bg-surface-container-low border border-outline-variant rounded px-3 py-1.5 text-on-surface w-36 focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant uppercase font-bold">Format:</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="bg-surface-container-low border border-outline-variant rounded px-3 py-1.5 text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="pdf">PDF Document (.pdf)</option>
              <option value="json">JSON Telemetry (.json)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-primary-container text-on-primary-container hover:bg-primary font-bold rounded transition-colors shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            <span>{loading ? 'GENERATING REPORT...' : 'GENERATE & EXPORT REPORT'}</span>
          </button>
        </form>
      </div>

      {/* Generated Reports History */}
      <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-on-surface uppercase border-b border-outline-variant/30 pb-2">
          Generated Incident Reports History ({reports.length})
        </h2>

        <div className="space-y-3">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="p-4 bg-surface-container-low rounded border border-outline-variant/20 flex justify-between items-center"
            >
              <div className="space-y-1">
                <span className="font-bold text-primary">{rep.title}</span>
                <p className="text-on-surface-variant text-[0.75rem] font-sans line-clamp-1">{rep.executive_summary}</p>
                <span className="text-outline text-[0.65rem] block">{new Date(rep.created_at).toLocaleString()}</span>
              </div>

              {rep.details_json && rep.details_json.pdf_path && (
                <a
                  href={`/api/reports/download/${rep.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-tertiary-container text-on-tertiary-container hover:bg-tertiary font-bold rounded text-xs transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>DOWNLOAD PDF</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

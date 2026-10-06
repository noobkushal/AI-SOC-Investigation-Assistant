import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAlertDetail } from '../services/api';

export const AlertDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchAlertDetail(id)
        .then(setAlert)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center font-mono text-on-surface-variant">Fetching alert details...</div>;
  }

  if (!alert) {
    return (
      <div className="p-8 text-center font-mono text-error">
        Alert not found.{' '}
        <button onClick={() => navigate('/alerts')} className="underline">
          Return to Alerts
        </button>
      </div>
    );
  }

  return (
    <div className="p-space-xl space-y-space-xl font-mono">
      <div className="flex items-center justify-between bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-primary">{alert.alert_id}</span>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-error-container text-on-error-container">
              {alert.severity}
            </span>
          </div>
          <h1 className="text-lg font-bold text-on-surface font-sans mt-1">{alert.title}</h1>
        </div>
        <button
          onClick={() => navigate('/alerts')}
          className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded text-xs text-on-surface transition-colors"
        >
          ← Back to Triage Queue
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 space-y-4">
            <h2 className="text-sm font-bold text-primary uppercase border-b border-outline-variant/30 pb-2">
              Alert Description &amp; Rule Context
            </h2>
            <p className="text-xs text-on-surface font-sans leading-relaxed">{alert.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-4 border-t border-outline-variant/20">
              <div>
                <span className="text-on-surface-variant block uppercase text-[0.65rem]">Detection Rule</span>
                <span className="font-bold text-on-surface">{alert.detection_rule}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block uppercase text-[0.65rem]">MITRE Technique</span>
                <span className="font-bold text-tertiary">{alert.mitre_technique || 'N/A'}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block uppercase text-[0.65rem]">Event Count</span>
                <span className="font-bold text-on-surface">{alert.event_count}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block uppercase text-[0.65rem]">Risk Score</span>
                <span className="font-bold text-error">{alert.risk_score}/100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 space-y-4 text-xs">
            <h3 className="font-bold text-secondary uppercase border-b border-outline-variant/30 pb-2">Elevate Alert</h3>
            <p className="text-on-surface-variant font-sans text-[0.8rem]">
              Correlate this alert with existing active incident INC-8042 or escalate to new incident.
            </p>
            <button
              onClick={() => navigate('/incidents/INC-8042')}
              className="w-full py-2 bg-primary-container text-on-primary-container font-bold rounded hover:bg-primary transition-all text-xs"
            >
              ELEVATE TO INCIDENT WORKBENCH →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

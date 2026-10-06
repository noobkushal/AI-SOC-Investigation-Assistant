import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchIncidentDetail,
  fetchIncidentTimeline,
  fetchLatestInvestigation,
  runAIInvestigation,
  triggerResponseAction,
  generateReport
} from '../services/api';

export const IncidentInvestigation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const incidentId = id || 'INC-8042';

  const [incident, setIncident] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [investigation, setInvestigation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningAI, setRunningAI] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [downloadingReport, setDownloadingReport] = useState(false);

  const navigate = useNavigate();

  const loadAllData = () => {
    setLoading(true);
    Promise.all([
      fetchIncidentDetail(incidentId),
      fetchIncidentTimeline(incidentId),
      fetchLatestInvestigation(incidentId)
    ])
      .then(([incData, timeData, invData]) => {
        setIncident(incData);
        setTimeline(timeData);
        setInvestigation(invData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAllData();
  }, [incidentId]);

  const handleRunAI = async () => {
    setRunningAI(true);
    try {
      const res = await runAIInvestigation(incidentId);
      setInvestigation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setRunningAI(false);
    }
  };

  const handleSimulateAction = async (action: string, target: string) => {
    setSimulating(true);
    setActionMessage('');
    try {
      const res = await triggerResponseAction(incidentId, action, target);
      setActionMessage(`[SIMULATED RESPONSE] Successfully executed '${action}' for target '${target}' (Status: SIMULATED).`);
    } catch (err) {
      console.error(err);
      setActionMessage('Failed to execute simulated response action.');
    } finally {
      setSimulating(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloadingReport(true);
    try {
      const res = await generateReport(incidentId, 'pdf');
      if (res.download_url) {
        window.open(res.download_url, '_blank');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingReport(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center font-mono text-on-surface-variant">Loading Incident Forensic Workbench...</div>;
  }

  return (
    <div className="p-space-xl space-y-space-xl font-mono">
      {/* Top Banner & Quick Controls */}
      <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-error">{incident?.incident_id}</span>
              <span className="text-xl font-bold text-on-surface font-sans">{incident?.title}</span>
              <span className="px-3 py-1 rounded bg-error-container text-on-error-container font-bold text-xs">
                {incident?.severity}
              </span>
              <span className="px-3 py-1 rounded bg-surface-container-high text-tertiary font-bold text-xs">
                STATUS: {incident?.status}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-sans mt-2">{incident?.description}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleRunAI}
              disabled={runningAI}
              className="px-4 py-2 bg-secondary-container text-on-secondary-container hover:bg-secondary font-bold rounded text-xs transition-colors flex items-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-sm">neurology</span>
              <span>{runningAI ? 'RE-ANALYZING EVIDENCE...' : 'RE-RUN AI INVESTIGATOR'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloadingReport}
              className="px-4 py-2 bg-tertiary-container text-on-tertiary-container hover:bg-tertiary font-bold rounded text-xs transition-colors flex items-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>{downloadingReport ? 'GENERATING PDF...' : 'EXPORT PDF REPORT'}</span>
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="p-3 bg-tertiary-container/30 border border-tertiary text-tertiary rounded text-xs font-bold">
            {actionMessage}
          </div>
        )}
      </div>

      {/* Main Workbench 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* Left Column (~65%): Timeline & Evidence Graph */}
        <div className="lg:col-span-7 space-y-space-xl">
          {/* Transparent Risk Score Breakdown Box */}
          <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
              <span className="font-bold text-on-surface text-sm uppercase">Transparent Risk Assessment Score</span>
              <span className="text-2xl font-bold text-error">{investigation?.risk_assessment?.score || 87.0}/100</span>
            </div>
            <p className="text-xs text-on-surface-variant font-sans">{investigation?.risk_assessment?.formula}</p>
            <div className="space-y-1 text-xs">
              <span className="font-bold text-secondary uppercase text-[0.7rem] block">Risk Justification Factors:</span>
              {(investigation?.risk_assessment?.reasons || []).map((r: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-on-surface">
                  <span className="text-error font-bold">✓</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chronological Event Timeline */}
          <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">timeline</span>
                <span className="font-bold text-on-surface text-sm">Chronological Forensic Timeline ({timeline.length} Events)</span>
              </div>
              <span className="text-xs text-on-surface-variant">UTC Telemetry Sequence</span>
            </div>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/40 pl-6">
              {timeline.map((item, idx) => (
                <div key={item.id || idx} className="relative group">
                  <span
                    className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-surface ${
                      item.type === 'ALERT' ? 'bg-error' : 'bg-primary'
                    }`}
                  ></span>
                  <div className="p-3 bg-surface-container-low rounded border border-outline-variant/30 space-y-1">
                    <div className="flex justify-between items-center text-[0.7rem]">
                      <span className="text-tertiary font-bold">{new Date(item.timestamp).toLocaleTimeString()}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[0.65rem] font-bold ${
                          item.severity === 'CRITICAL' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-secondary'
                        }`}
                      >
                        {item.type}: {item.severity}
                      </span>
                    </div>
                    <div className="font-bold text-on-surface text-xs font-sans">{item.title}</div>
                    <p className="text-[0.75rem] text-on-surface-variant font-sans">{item.description}</p>
                    {item.raw_log && (
                      <pre className="mt-2 p-2 bg-surface-container-lowest rounded text-[0.65rem] text-tertiary overflow-x-auto border border-outline-variant/20 font-mono">
                        {item.raw_log}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (~35%): AI Investigation Assistant Synthesis & Simulated Controls */}
        <div className="lg:col-span-5 space-y-space-xl">
          {/* AI Evidence Grounding Box */}
          <div className="bg-surface-container-lowest p-6 rounded-lg border border-secondary/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[1.5rem]">neurology</span>
                <div>
                  <span className="font-bold text-secondary text-sm block">AI Copilot Analysis</span>
                  <span className="text-[0.65rem] text-on-surface-variant">Model Confidence: {investigation?.confidence || 94.2}%</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container text-[0.65rem] font-bold">
                EVIDENCE GROUNDED
              </span>
            </div>

            {/* Summary */}
            <div className="space-y-1">
              <span className="text-tertiary font-bold text-xs uppercase block">Incident Summary</span>
              <p className="text-xs text-on-surface font-sans leading-relaxed bg-surface-container-low p-3 rounded border border-outline-variant/20">
                {investigation?.ai_summary}
              </p>
            </div>

            {/* Grounded Evidence List */}
            <div className="space-y-2">
              <span className="text-secondary font-bold text-xs uppercase block">Observed Evidence Analysis</span>
              <div className="space-y-1.5 font-sans text-xs">
                {(investigation?.findings?.evidence_analysis || []).map((e: string, idx: number) => (
                  <div key={idx} className="p-2 bg-surface-container-low rounded border-l-2 border-primary text-on-surface-variant text-[0.75rem]">
                    {e}
                  </div>
                ))}
              </div>
            </div>

            {/* Attack Hypothesis */}
            <div className="space-y-1">
              <span className="text-error font-bold text-xs uppercase block">Attack Vector Hypothesis</span>
              <p className="text-xs text-on-surface-variant font-sans leading-relaxed bg-surface-container-low p-3 rounded border border-outline-variant/20">
                {investigation?.findings?.attack_hypothesis}
              </p>
            </div>

            {/* MITRE Techniques */}
            <div className="space-y-1">
              <span className="text-tertiary font-bold text-xs uppercase block">MITRE ATT&amp;CK Mapping</span>
              <div className="flex flex-wrap gap-1.5">
                {(investigation?.findings?.mitre_mapping || []).map((m: any, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-surface-container-high rounded text-tertiary text-xs font-mono font-bold">
                    [{m.technique_id}] {m.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Response Trigger Actions */}
            <div className="pt-4 border-t border-outline-variant/30 space-y-3">
              <span className="font-bold text-on-surface text-xs uppercase block">Simulated Response Automation</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleSimulateAction('isolate_endpoint', 'WORKSTATION-01')}
                  disabled={simulating}
                  className="p-2 bg-error-container text-on-error-container hover:bg-error hover:text-on-error font-bold rounded transition-colors text-left flex items-center justify-between"
                >
                  <span>ISOLATE HOST</span>
                  <span className="material-symbols-outlined text-sm">phonelink_erase</span>
                </button>

                <button
                  onClick={() => handleSimulateAction('disable_user', 'backdoor_admin')}
                  disabled={simulating}
                  className="p-2 bg-surface-container-high hover:bg-surface-bright text-secondary font-bold rounded transition-colors text-left flex items-center justify-between"
                >
                  <span>DISABLE USER</span>
                  <span className="material-symbols-outlined text-sm">person_off</span>
                </button>

                <button
                  onClick={() => handleSimulateAction('block_ip', '185.220.101.5')}
                  disabled={simulating}
                  className="p-2 bg-surface-container-high hover:bg-surface-bright text-tertiary font-bold rounded transition-colors text-left flex items-center justify-between"
                >
                  <span>BLOCK C2 IP</span>
                  <span className="material-symbols-outlined text-sm">block</span>
                </button>

                <button
                  onClick={() => handleSimulateAction('reset_credentials', 'admin')}
                  disabled={simulating}
                  className="p-2 bg-surface-container-high hover:bg-surface-bright text-primary font-bold rounded transition-colors text-left flex items-center justify-between"
                >
                  <span>RESET PASSWORDS</span>
                  <span className="material-symbols-outlined text-sm">key</span>
                </button>
              </div>

              <div className="text-center">
                <span className="text-[0.65rem] text-error font-bold tracking-widest uppercase">
                  ⚡ ALL ACTIONS ARE SIMULATED SAFELY IN PROTOTYPE MODE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

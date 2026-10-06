import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardSummary, fetchIncidents } from '../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchDashboardSummary(), fetchIncidents()])
      .then(([sumData, incData]) => {
        setSummary(sumData);
        setIncidents(incData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-on-surface-variant font-mono">
        Loading Security Operations Center Command HUD...
      </div>
    );
  }

  return (
    <div className="p-space-xl space-y-space-xl">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md bg-surface-container-lowest p-space-xl rounded-lg shadow-md border border-outline-variant/30">
        <div className="space-y-1">
          <div className="flex items-center gap-space-sm">
            <span className="font-bold text-2xl text-on-surface tracking-tight">Security Operations Center</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container-high text-tertiary uppercase tracking-wider flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span> LIVE HUD
            </span>
          </div>
          <p className="text-sm text-on-surface-variant">
            Monitor, investigate, and respond to security events in real-time across enterprise perimeters.
          </p>
        </div>

        {/* Live telemetry status pill */}
        <div className="flex items-center flex-wrap gap-3 bg-surface-container-low px-4 py-2 rounded-lg shadow-sm border border-outline-variant/30 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            <span>Load:</span>
            <span className="text-on-surface font-semibold">Optimal</span>
          </div>
          <span className="text-outline">|</span>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[0.875rem] text-primary">speed</span>
            <span>Ingestion:</span>
            <span className="text-primary font-bold">{summary?.ingestion_rate_eps?.toLocaleString() || '142,890'} EPS</span>
          </div>
          <span className="text-outline">|</span>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[0.875rem] text-secondary">sync</span>
            <span>Intel Sync:</span>
            <span className="text-secondary font-semibold">2m ago</span>
          </div>
        </div>
      </div>

      {/* Top Metric KPI Cards (6 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 font-mono">
        {/* Critical Alerts */}
        <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 hover:border-error transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-error"></div>
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-on-surface-variant uppercase font-bold tracking-wider">Critical Alerts</span>
            <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-error">{summary?.critical_alerts || 3}</span>
            <span className="text-[0.65rem] px-1.5 py-0.5 bg-error-container text-on-error-container rounded font-bold">+1 / 1h</span>
          </div>
          <p className="mt-2 text-[0.65rem] text-on-surface-variant font-sans">Autonomous isolation ready</p>
        </div>

        {/* High Severity */}
        <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 hover:border-secondary transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-secondary-container"></div>
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-on-surface-variant uppercase font-bold tracking-wider">High Severity</span>
            <span className="material-symbols-outlined text-secondary text-[1rem]">priority_high</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-secondary">{summary?.high_alerts || 12}</span>
            <span className="text-[0.65rem] px-1.5 py-0.5 bg-surface-container-high text-tertiary rounded font-semibold">-4 vs yday</span>
          </div>
          <p className="mt-2 text-[0.65rem] text-on-surface-variant font-sans">Correlated to 2 campaigns</p>
        </div>

        {/* Active Incidents */}
        <div
          onClick={() => navigate('/incidents')}
          className="bg-surface-container-lowest p-4 rounded-lg shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 cursor-pointer hover:border-primary transition-all"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary-container"></div>
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-on-surface-variant uppercase font-bold tracking-wider">Active Incidents</span>
            <span className="material-symbols-outlined text-primary text-[1rem]">crisis_alert</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-on-surface">{summary?.active_incidents || 7}</span>
            <span className="text-[0.65rem] text-on-surface-variant font-semibold">Severity ≥ Med</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[0.65rem]">
            <span className="text-error font-semibold">3 Invest.</span>
            <span className="text-outline">/</span>
            <span className="text-primary font-semibold">4 Triage</span>
          </div>
        </div>

        {/* Active Investigations */}
        <div
          onClick={() => navigate('/investigation')}
          className="bg-surface-container-lowest p-4 rounded-lg shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 cursor-pointer hover:border-tertiary transition-all"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-tertiary-container"></div>
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-on-surface-variant uppercase font-bold tracking-wider">Investigations</span>
            <span className="material-symbols-outlined text-tertiary text-[1rem]">shield_with_heart</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-tertiary">{summary?.investigations || 5}</span>
            <span className="text-[0.65rem] px-1.5 py-0.5 bg-surface-container-high text-on-surface-variant rounded">4 Analysts</span>
          </div>
          <p className="mt-2 text-[0.65rem] text-on-surface-variant font-sans">Tier-2/Tier-3 active desk</p>
        </div>

        {/* Assets at Risk */}
        <div
          onClick={() => navigate('/assets')}
          className="bg-surface-container-lowest p-4 rounded-lg shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 cursor-pointer hover:border-outline transition-all"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-outline"></div>
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-on-surface-variant uppercase font-bold tracking-wider">Assets at Risk</span>
            <span className="material-symbols-outlined text-on-surface-variant text-[1rem]">lan</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-on-surface">{summary?.assets_at_risk || 14}</span>
            <span className="text-[0.65rem] text-error font-bold">2 DC Tier</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[0.65rem] text-on-surface-variant">
            <span>9 Hosts</span>
            <span className="text-outline">•</span>
            <span>5 Cloud VMs</span>
          </div>
        </div>

        {/* MTTR */}
        <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 hover:border-tertiary transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-tertiary"></div>
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-on-surface-variant uppercase font-bold tracking-wider">MTTR (24h)</span>
            <span className="material-symbols-outlined text-tertiary text-[1rem]">timer</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-tertiary">{summary?.mttr_minutes || 18}m</span>
            <span className="text-[0.65rem] px-1.5 py-0.5 bg-tertiary-container/30 text-tertiary rounded font-bold">-14%</span>
          </div>
          <p className="mt-2 text-[0.65rem] text-on-surface-variant font-sans">SLA target: &lt; 25m</p>
        </div>
      </div>

      {/* Main Dashboard Body: 2 Columns (~65% / ~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* Left Column (~65%) */}
        <div className="lg:col-span-8 space-y-space-xl">
          {/* Multi-series Telemetry Chart Section */}
          <div className="bg-surface-container-lowest p-space-xl rounded-lg shadow-md border border-outline-variant/30 space-y-space-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-md">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg text-on-surface">Alert Ingestion &amp; Incident Telemetry</span>
                  <span className="font-mono text-[0.65rem] px-1.5 py-0.5 bg-surface-container-high text-tertiary rounded">10s REFRESH</span>
                </div>
                <p className="text-xs text-on-surface-variant">Correlation stream of flagged threat vectors across SIEM &amp; EDR logs.</p>
              </div>
              <div className="flex items-center bg-surface-container-low p-1 rounded font-mono text-xs">
                <button className="px-3 py-1 rounded bg-surface-container-high text-primary font-bold shadow-sm">24 Hours</button>
                <button className="px-3 py-1 rounded text-on-surface-variant hover:text-on-surface">7 Days</button>
                <button className="px-3 py-1 rounded text-on-surface-variant hover:text-on-surface">30 Days</button>
              </div>
            </div>

            {/* Chart */}
            <div className="h-64 w-full bg-surface-container-low rounded-lg p-2 border border-outline-variant/20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary?.telemetry_chart || []}>
                  <defs>
                    <linearGradient id="colorCrit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffb4ab" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ffb4ab" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d0bcff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#d0bcff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262a34" />
                  <XAxis dataKey="time" stroke="#8c909f" fontSize={11} />
                  <YAxis stroke="#8c909f" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#181b25', borderColor: '#424754', color: '#dfe2ef', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="critical" stroke="#ffb4ab" fillOpacity={1} fill="url(#colorCrit)" />
                  <Area type="monotone" dataKey="high" stroke="#d0bcff" fillOpacity={1} fill="url(#colorHigh)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Incident Workbench Stream */}
          <div className="bg-surface-container-lowest p-space-xl rounded-lg shadow-md border border-outline-variant/30 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-on-surface">
                <span className="material-symbols-outlined text-primary">crisis_alert</span>
                <span>Active Correlated Incidents ({incidents.length})</span>
              </div>
              <button onClick={() => navigate('/incidents')} className="text-xs font-mono text-primary hover:underline">
                View All Queue →
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => navigate(`/incidents/${inc.incident_id}`)}
                  className="p-4 bg-surface-container-low rounded-lg border border-outline-variant/30 hover:border-primary cursor-pointer transition-all flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-error font-bold">{inc.incident_id}</span>
                      <span className="text-on-surface font-semibold">{inc.title}</span>
                      <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container text-[0.65rem] font-bold">
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-[0.75rem] font-sans line-clamp-1">{inc.description}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-tertiary font-bold text-sm">Risk Score: {inc.risk_score}/100</div>
                    <span className="text-[0.65rem] text-on-surface-variant block">{inc.assigned_to}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (~35%): AI Copilot Live Synthesis Sidepanel */}
        <div className="lg:col-span-4 space-y-space-xl">
          <div className="bg-surface-container-lowest p-space-xl rounded-lg shadow-md border border-secondary/30 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">neurology</span>
                <span className="font-mono text-sm font-bold text-secondary">AI Autonomous Triage</span>
              </div>
              <span className="font-mono text-[0.65rem] px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded font-bold">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-surface-container-low rounded border border-secondary/20">
                <span className="text-tertiary font-mono font-bold block mb-1">INC-8042 Attack Vector Synthesis</span>
                <p className="text-on-surface-variant font-sans leading-relaxed text-[0.8rem]">
                  High-confidence multi-stage attack sequence identified on WORKSTATION-01. Adversary executed credential brute forcing targeting RDP, spawned obfuscated PowerShell with -EncodedCommand, created administrator account backdoor_admin, and established C2 beaconing to 185.220.101.5.
                </p>
              </div>

              <div className="p-3 bg-surface-container-low rounded border border-outline-variant/30 space-y-2">
                <span className="font-mono text-on-surface font-bold text-[0.75rem] uppercase block">Recommended Actions</span>
                <ul className="space-y-1 font-mono text-[0.7rem] text-on-surface-variant">
                  <li className="text-error font-semibold">• Isolate WORKSTATION-01 from network</li>
                  <li className="text-secondary font-semibold">• Disable user account backdoor_admin</li>
                  <li className="text-tertiary font-semibold">• Block IP 185.220.101.5 on perimeter firewall</li>
                </ul>
              </div>

              <button
                onClick={() => navigate('/incidents/INC-8042')}
                className="w-full py-2 bg-secondary-container hover:bg-secondary text-on-secondary-container font-bold rounded font-mono text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>OPEN INVESTIGATION WORKBENCH</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

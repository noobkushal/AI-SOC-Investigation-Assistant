import React from 'react';
import { NavLink } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Overview', path: '/', icon: 'grid_view' },
    { label: 'Alerts', path: '/alerts', icon: 'warning', badge: '14', badgeColor: 'bg-surface-container-high text-on-surface' },
    { label: 'Incidents', path: '/incidents', icon: 'crisis_alert', badge: '3', badgeColor: 'bg-error-container text-on-error-container font-bold' },
    { label: 'Investigation', path: '/investigation', icon: 'manage_search', pulse: true },
    { label: 'Threat Intelligence', path: '/threat-intelligence', icon: 'hub' },
    { label: 'MITRE ATT&CK', path: '/mitre-attack', icon: 'schema' },
    { label: 'Detection Rules', path: '/detection-rules', icon: 'policy' },
    { label: 'Assets', path: '/assets', icon: 'dns' },
    { label: 'Reports', path: '/reports', icon: 'summarize' },
    { label: 'Settings', path: '/settings', icon: 'settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-surface-container-lowest z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.4)] border-r border-outline-variant/30">
      <div className="flex flex-col">
        {/* Logo Header */}
        <div className="h-14 flex items-center gap-space-md px-space-xl bg-surface-container-low border-b border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-[1.75rem]">security</span>
          <div className="flex flex-col min-w-0">
            <span className="font-headline-md text-headline-md tracking-wider text-primary font-bold leading-none">SENTINEL</span>
            <span className="font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase leading-none mt-space-xs font-mono">AI SOC ASSISTANT</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="px-space-md py-space-sm">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-space-md py-2 rounded text-body-sm transition-colors ${
                    isActive
                      ? 'bg-surface-container-high text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`
                }
              >
                <div className="flex items-center gap-space-md">
                  <span className="material-symbols-outlined text-[1.125rem]">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`font-code-sm text-xs px-2 py-0.5 rounded font-mono ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
                {item.pulse && (
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer Copilot Triage Stats Widget */}
      <div className="p-space-md space-y-space-md border-t border-outline-variant/30">
        <div className="bg-surface-container-low rounded p-space-md shadow-[0_1px_8px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-sm text-xs uppercase text-secondary font-bold font-mono">AI Copilot Triage</span>
            <span className="font-code-sm text-xs text-tertiary font-mono">94.2%</span>
          </div>
          <p className="font-body-sm text-[0.75rem] text-on-surface-variant">Autonomous triage precision rate</p>
          <div className="mt-space-sm w-full bg-surface-container-highest rounded-full h-1">
            <div className="bg-secondary h-1 rounded-full w-[94.2%]"></div>
          </div>
        </div>
        <div className="bg-surface-container-low rounded p-space-md flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            <span className="font-body-sm text-xs text-on-surface-variant">Sensors Online</span>
          </div>
          <span className="font-code-sm text-xs text-on-surface font-semibold font-mono">48/48</span>
        </div>
      </div>
    </aside>
  );
};

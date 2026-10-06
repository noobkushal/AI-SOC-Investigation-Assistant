import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalSearch } from '../../services/api';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 1) {
      setIsSearching(true);
      try {
        const res = await globalSearch(val);
        setSearchResults(res);
      } catch (err) {
        console.error(err);
      }
    } else {
      setIsSearching(false);
      setSearchResults(null);
    }
  };

  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-surface-container-lowest/90 backdrop-blur-xl z-40 flex items-center justify-between px-space-xl shadow-[0_1px_8px_rgba(0,0,0,0.3)] border-b border-outline-variant/30">
      {/* Global Search Bar */}
      <div className="flex items-center gap-space-md flex-1 max-w-xl relative">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[1.125rem]">
            search
          </span>
          <input
            className="w-full bg-surface-container-low rounded pl-9 pr-12 py-1.5 font-mono text-xs text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-high transition-colors border border-outline-variant/30"
            placeholder="Search Incident ID, IP, Hash, Host, MITRE technique..."
            type="text"
            value={searchQuery}
            onChange={handleSearch}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[0.6875rem] px-1.5 py-0.5 bg-surface-container-highest rounded text-on-surface-variant">
            ⌘K
          </kbd>
        </div>

        {/* Global Search Dropdown Results */}
        {isSearching && searchResults && (
          <div className="absolute top-12 left-0 right-0 bg-surface-container-high border border-outline-variant rounded shadow-2xl p-4 z-50 max-h-96 overflow-y-auto font-mono text-xs">
            <div className="flex justify-between items-center mb-2 pb-1 border-b border-outline-variant text-primary font-bold">
              <span>CATEGORIZED RESULTS ({searchQuery})</span>
              <button onClick={() => setIsSearching(false)} className="text-on-surface-variant hover:text-on-surface">✕</button>
            </div>
            {searchResults.incidents?.length > 0 && (
              <div className="mb-3">
                <span className="text-secondary font-bold text-[0.7rem] uppercase block mb-1">Incidents</span>
                {searchResults.incidents.map((inc: any) => (
                  <div
                    key={inc.id}
                    onClick={() => { navigate(`/incidents/${inc.incident_id}`); setIsSearching(false); }}
                    className="p-1.5 rounded hover:bg-surface-bright cursor-pointer flex justify-between items-center"
                  >
                    <span>{inc.incident_id}: {inc.title}</span>
                    <span className="px-1.5 py-0.5 rounded bg-error-container text-on-error-container text-[0.65rem] font-bold">{inc.severity}</span>
                  </div>
                ))}
              </div>
            )}
            {searchResults.alerts?.length > 0 && (
              <div className="mb-3">
                <span className="text-tertiary font-bold text-[0.7rem] uppercase block mb-1">Alerts</span>
                {searchResults.alerts.map((alt: any) => (
                  <div
                    key={alt.id}
                    onClick={() => { navigate(`/alerts`); setIsSearching(false); }}
                    className="p-1.5 rounded hover:bg-surface-bright cursor-pointer flex justify-between items-center"
                  >
                    <span>{alt.alert_id}: {alt.title}</span>
                    <span className="px-1 py-0.5 rounded bg-surface-container text-tertiary text-[0.65rem]">{alt.severity}</span>
                  </div>
                ))}
              </div>
            )}
            {searchResults.indicators?.length > 0 && (
              <div className="mb-3">
                <span className="text-on-surface-variant font-bold text-[0.7rem] uppercase block mb-1">Threat Indicators</span>
                {searchResults.indicators.map((ind: any) => (
                  <div
                    key={ind.id}
                    onClick={() => { navigate(`/threat-intelligence`); setIsSearching(false); }}
                    className="p-1.5 rounded hover:bg-surface-bright cursor-pointer flex justify-between items-center"
                  >
                    <span>{ind.value} ({ind.type})</span>
                    <span className="text-error font-bold text-[0.65rem]">{ind.reputation}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Top Header Metrics & Badges */}
      <div className="flex items-center gap-space-md">
        <div className="flex items-center gap-1 px-3 py-1 rounded bg-surface-container-low text-on-surface-variant text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
          <span className="font-semibold">Last 24 Hours</span>
        </div>

        <div
          onClick={() => navigate('/incidents/INC-8042')}
          className="flex items-center gap-2 px-3 py-1 rounded bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors border border-error/30"
        >
          <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
          <span className="font-mono text-xs text-error font-semibold">INC-8042: Active Breach Triage</span>
        </div>

        <div className="hidden xl:flex items-center gap-1 font-mono text-xs text-on-surface-variant px-3 py-1 bg-surface-container-low rounded">
          <span className="text-tertiary font-bold">142k EPS</span>
          <span className="text-outline">|</span>
          <span>Normal</span>
        </div>

        <div className="hidden lg:flex items-center gap-1 px-3 py-1 rounded bg-surface-container-low text-secondary font-mono text-xs">
          <span className="material-symbols-outlined text-[1rem]">neurology</span>
          <span>v4.2 Active</span>
        </div>

        <button className="relative p-1 text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined text-[1.25rem]">notifications</span>
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-error text-on-error font-mono text-[0.625rem] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Analyst Profile */}
        <div className="flex items-center gap-2 pl-3 border-l border-outline-variant/30">
          <div className="w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold text-xs font-mono">
            AC
          </div>
          <div className="flex flex-col min-w-0 text-left">
            <div className="flex items-center gap-1">
              <span className="text-xs text-on-surface font-semibold truncate">Alex Chen</span>
              <span className="text-[0.6rem] px-1 py-0.2 bg-tertiary-container text-on-tertiary-container rounded uppercase font-bold font-mono">
                Active
              </span>
            </div>
            <span className="font-mono text-[0.65rem] text-on-surface-variant truncate">Tier 3 Lead</span>
          </div>
        </div>
      </div>
    </header>
  );
};

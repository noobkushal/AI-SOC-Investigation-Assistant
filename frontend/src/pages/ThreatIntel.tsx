import React, { useEffect, useState } from 'react';
import { lookupThreatIntel, fetchThreatIndicators } from '../services/api';

export const ThreatIntel: React.FC = () => {
  const [query, setQuery] = useState('185.220.101.5');
  const [result, setResult] = useState<any>(null);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchThreatIndicators()
      .then(setIndicators)
      .catch(console.error);
    handleLookup('185.220.101.5');
  }, []);

  const handleLookup = async (val?: string) => {
    const target = val || query;
    if (!target) return;
    setLoading(true);
    try {
      const data = await lookupThreatIntel(target);
      setResult(data);
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
          <span className="material-symbols-outlined text-tertiary text-[2.5rem]">hub</span>
          <div>
            <h1 className="text-xl font-bold text-on-surface tracking-tight">Threat Intelligence &amp; Indicator Enrichment</h1>
            <p className="text-xs text-on-surface-variant font-sans mt-0.5">
              Query external reputation feeds (VirusTotal, AlienVault OTX, AbuseIPDB) for IP addresses, domain names, URLs, and file hashes.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 pt-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter IPv4/IPv6, SHA256 Hash, or Domain (e.g. 185.220.101.5)..."
            className="w-full max-w-xl bg-surface-container-low border border-outline-variant rounded px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-tertiary"
          />
          <button
            onClick={() => handleLookup()}
            disabled={loading}
            className="px-5 py-2 bg-tertiary-container text-on-tertiary-container hover:bg-tertiary font-bold rounded text-xs transition-colors shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">search</span>
            <span>{loading ? 'ENRICHING...' : 'LOOKUP INDICATOR'}</span>
          </button>
        </div>
      </div>

      {/* Indicator Result Card */}
      {result && (
        <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-primary">{result.value}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-surface-container-high text-on-surface uppercase">{result.type}</span>
            </div>
            <span
              className={`px-3 py-1 rounded text-xs font-bold ${
                result.reputation === 'MALICIOUS'
                  ? 'bg-error-container text-on-error-container border border-error'
                  : result.reputation === 'SUSPICIOUS'
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              REPUTATION: {result.reputation}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-on-surface-variant block text-[0.65rem] uppercase">Threat Actor / Campaign</span>
              <span className="font-bold text-secondary text-sm">{result.threat_actor || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block text-[0.65rem] uppercase">Confidence Rating</span>
              <span className="font-bold text-tertiary text-sm">{result.confidence}%</span>
            </div>
            <div>
              <span className="text-on-surface-variant block text-[0.65rem] uppercase">Category</span>
              <span className="font-bold text-on-surface text-sm">{result.category || 'N/A'}</span>
            </div>
          </div>

          {result.sources && (
            <div className="pt-2 text-xs">
              <span className="text-on-surface-variant text-[0.65rem] uppercase block mb-1">Intelligence Sources</span>
              <div className="flex flex-wrap gap-2">
                {result.sources.map((src: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface text-[0.7rem]">
                    {src}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Indicator Inventory */}
      <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 space-y-4">
        <h2 className="text-sm font-bold text-on-surface uppercase border-b border-outline-variant/30 pb-2">
          Known Malicious &amp; Suspicious Indicators Database
        </h2>
        <div className="space-y-2 text-xs">
          {indicators.map((ind) => (
            <div
              key={ind.id}
              onClick={() => handleLookup(ind.value)}
              className="p-3 bg-surface-container-low rounded border border-outline-variant/20 hover:border-tertiary cursor-pointer transition-all flex justify-between items-center"
            >
              <div className="space-y-0.5">
                <span className="text-primary font-bold">{ind.value}</span>
                <span className="text-on-surface-variant text-[0.7rem] block">Type: {ind.type} | Threat Actor: {ind.threat_actor || 'Unassigned'}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${
                  ind.reputation === 'MALICIOUS' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-secondary'
                }`}
              >
                {ind.reputation}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

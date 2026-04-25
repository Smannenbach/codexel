import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

interface WaveStats {
  wave1: { total: number; high: number };
  wave2: { total: number; high: number };
  wave3: { total: number; high: number };
  total: number;
}

interface CatalogStats {
  stats: WaveStats;
  highPriorityCount: number;
  categoryBreakdown: Record<string, number>;
}

interface DeployEvent {
  type: string;
  wave?: number;
  total?: number;
  phase?: string;
  message?: string;
  done?: number;
  created?: number;
  failed?: number;
  deployed?: number;
  completed?: number;
  current?: string;
  results?: { domain: string; success: boolean; siteId?: number; error?: string }[];
  latest?: { domain: string; stagingUrl: string; status: string; dnsConfigured: boolean };
}

interface SiteStatus {
  id: number;
  domain: string;
  name: string;
  status: string;
  deployedUrl: string | null;
  lastDeployedAt: string | null;
  templateId: string | null;
  category: string;
  leadCount: number | null;
  seoScore: number | null;
}

const WAVE_COLORS = {
  1: { bg: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' },
  2: { bg: 'bg-purple-600', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800' },
  3: { bg: 'bg-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800' },
};

const STATUS_COLORS: Record<string, string> = {
  live: 'bg-green-100 text-green-800',
  deployed: 'bg-blue-100 text-blue-800',
  draft: 'bg-gray-100 text-gray-600',
  staging: 'bg-yellow-100 text-yellow-800',
};

export default function DeploymentPipeline() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<'waves' | 'status' | 'catalog'>('waves');
  const [catalogStats, setCatalogStats] = useState<CatalogStats | null>(null);
  const [deployingWave, setDeployingWave] = useState<number | null>(null);
  const [deployEvents, setDeployEvents] = useState<DeployEvent[]>([]);
  const [siteStatuses, setSiteStatuses] = useState<SiteStatus[]>([]);
  const [statusSummary, setStatusSummary] = useState<{ total: number; live: number; deployed: number; draft: number } | null>(null);
  const [priorityOnly, setPriorityOnly] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  // Load stats on mount
  useEffect(() => {
    fetch('/api/deploy/stats').then(r => r.json()).then(d => {
      if (d.success) setCatalogStats(d);
    }).catch(() => {});
  }, []);

  // Auto-scroll deploy log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [deployEvents.length]);

  // Load status tab
  useEffect(() => {
    if (tab === 'status') loadStatus();
  }, [tab]);

  const loadStatus = async () => {
    try {
      const res = await fetch('/api/deploy/status', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setSiteStatuses(data.sites);
        setStatusSummary(data.summary);
      }
    } catch { /* ignore */ }
  };

  const deployWave = async (wave: 1 | 2 | 3) => {
    setDeployingWave(wave);
    setDeployEvents([]);

    try {
      const res = await fetch(`/api/deploy/wave/${wave}?priorityOnly=${priorityOnly}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setDeployEvents(prev => [...prev, { type: 'error', message: err.error || `HTTP ${res.status}` }]);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6)) as DeployEvent;
              setDeployEvents(prev => [...prev, event]);
            } catch { /* ignore */ }
          }
        }
      }
    } finally {
      setDeployingWave(null);
      if (tab === 'status') loadStatus();
    }
  };

  const lastEvent = deployEvents[deployEvents.length - 1];
  const progressEvent = deployEvents.filter(e => e.type === 'factory_progress').pop();
  const completeEvent = deployEvents.find(e => e.type === 'complete');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🚀 Deployment Pipeline</h1>
            <p className="text-gray-500 mt-1">
              Deploy all 242 domains in 3 waves — DSCR first, then personal brand, then everything else
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/factory')}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              🏭 Factory
            </button>
            <button
              onClick={() => navigate('/sites')}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              ← Sites
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {catalogStats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Domains', value: catalogStats.stats.total, icon: '🌐' },
              { label: 'Wave 1 (DSCR)', value: catalogStats.stats.wave1.total, icon: '🏘️' },
              { label: 'Wave 2 (Brand)', value: catalogStats.stats.wave2.total, icon: '⭐' },
              { label: 'High Priority', value: catalogStats.highPriorityCount, icon: '🎯' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['waves', 'status', 'catalog'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${
                tab === t
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t === 'waves' ? '🌊 Deploy Waves' : t === 'status' ? '📊 Status' : '📋 Catalog'}
            </button>
          ))}
        </div>

        {/* ── Waves Tab ── */}
        {tab === 'waves' && (
          <div className="space-y-6">
            {/* Priority toggle */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">High Priority Only</p>
                <p className="text-sm text-gray-500">Deploy only high-priority domains first (faster)</p>
              </div>
              <button
                onClick={() => setPriorityOnly(!priorityOnly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  priorityOnly ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${priorityOnly ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Wave cards */}
            {([1, 2, 3] as const).map(wave => {
              const colors = WAVE_COLORS[wave];
              const stats = catalogStats?.stats[`wave${wave}` as keyof WaveStats] as { total: number; high: number } | undefined;
              const waveLabels = {
                1: { title: 'Wave 1 — DSCR & Real Estate', desc: '53 investor lending domains — highest revenue potential. State-specific DSCR, DSCR calculators, and brand domains.', icon: '🏘️' },
                2: { title: 'Wave 2 — Personal Brand & AI', desc: '27 Steve Mannenbach personal brand domains + core AI brands (LoanDaddy.ai, LoanGenius.ai, GoMortgage.ai).', icon: '⭐' },
                3: { title: 'Wave 3 — Full Catalog', desc: `${catalogStats?.stats.wave3.total || 162} remaining domains — mortgage rates, FHA/VA, hard money, AI tools, lead gen.`, icon: '🌐' },
              };

              const isDeploying = deployingWave === wave;
              const pCount = priorityOnly ? (stats?.high || 0) : (stats?.total || 0);

              return (
                <div key={wave} className={`bg-white rounded-xl border ${colors.border} shadow-sm overflow-hidden`}>
                  <div className={`${colors.light} px-6 py-4 border-b ${colors.border}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{waveLabels[wave].icon}</span>
                        <div>
                          <h3 className={`font-bold ${colors.text} text-lg`}>{waveLabels[wave].title}</h3>
                          <p className="text-sm text-gray-600 mt-0.5">{waveLabels[wave].desc}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${colors.text}`}>{stats?.total || '—'}</div>
                        <div className="text-xs text-gray-500">domains</div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>⚡ High priority: <strong>{stats?.high || '—'}</strong></span>
                      <span>📦 Will deploy: <strong>{pCount}</strong></span>
                    </div>
                    <button
                      onClick={() => deployWave(wave)}
                      disabled={!!deployingWave}
                      className={`px-6 py-2.5 ${colors.bg} text-white rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-40 flex items-center gap-2`}
                    >
                      {isDeploying ? (
                        <><span className="animate-spin">⚙️</span> Deploying Wave {wave}...</>
                      ) : (
                        `🚀 Deploy Wave ${wave}`
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Live deploy log */}
            {deployEvents.length > 0 && (
              <div className="bg-gray-900 rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-gray-800 text-gray-300 text-xs font-mono flex items-center gap-2">
                  <span className={deployingWave ? 'animate-pulse text-green-400' : 'text-gray-400'}>●</span>
                  Deployment Log
                  {completeEvent && <span className="ml-auto text-green-400">✅ Complete — {completeEvent.created} sites created, {completeEvent.deployed} deployed</span>}
                </div>
                <div ref={logRef} className="p-4 max-h-72 overflow-y-auto font-mono text-xs space-y-1">
                  {deployEvents.map((e, i) => {
                    if (e.type === 'start') return <p key={i} className="text-blue-400">▶ Starting Wave {e.wave} — {e.total} domains</p>;
                    if (e.type === 'phase') return <p key={i} className="text-yellow-400">⚡ {e.message}</p>;
                    if (e.type === 'factory_progress' && e.current) return <p key={i} className="text-gray-400">  ↳ Creating: {e.current} ({e.completed}/{e.total})</p>;
                    if (e.type === 'deploy_progress' && e.latest) {
                      const d = e.latest;
                      return <p key={i} className={d.status === 'live' ? 'text-green-400' : 'text-blue-400'}>
                        {d.status === 'live' ? '🟢' : '🔵'} {d.domain} → {d.stagingUrl}
                      </p>;
                    }
                    if (e.type === 'complete') return <p key={i} className="text-green-400">✅ Wave complete! Created: {e.created}, Deployed: {e.deployed}</p>;
                    if (e.type === 'error') return <p key={i} className="text-red-400">❌ {e.message}</p>;
                    return null;
                  })}
                  {deployingWave && <p className="text-gray-500 animate-pulse">▌</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Status Tab ── */}
        {tab === 'status' && (
          <div className="space-y-4">
            {statusSummary && (
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Sites', value: statusSummary.total, color: 'gray' },
                  { label: 'Live', value: statusSummary.live, color: 'green' },
                  { label: 'Deployed', value: statusSummary.deployed, color: 'blue' },
                  { label: 'Draft', value: statusSummary.draft, color: 'gray' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-4 text-center`}>
                    <div className={`text-2xl font-bold text-${color}-700`}>{value}</div>
                    <div className={`text-xs text-${color}-600`}>{label}</div>
                  </div>
                ))}
              </div>
            )}

            {siteStatuses.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-4xl mb-3">🌐</p>
                <p className="text-gray-500">No sites deployed yet. Run a deployment wave to get started.</p>
                <button onClick={() => setTab('waves')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                  Go to Waves →
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Domain', 'Status', 'Category', 'Template', 'Leads', 'SEO', 'URL'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {siteStatuses.map(site => (
                        <tr key={site.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs text-gray-900">{site.domain}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[site.status] || 'bg-gray-100 text-gray-600'}`}>
                              {site.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{site.category}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{site.templateId || '—'}</td>
                          <td className="px-4 py-3 text-gray-900 text-xs">{site.leadCount ?? 0}</td>
                          <td className="px-4 py-3 text-gray-900 text-xs">{site.seoScore ?? '—'}</td>
                          <td className="px-4 py-3">
                            {site.deployedUrl ? (
                              <a href={site.deployedUrl} target="_blank" rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs font-mono truncate block max-w-[200px]">
                                {site.deployedUrl.replace(/^https?:\/\//, '')}
                              </a>
                            ) : <span className="text-gray-400 text-xs">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Catalog Tab ── */}
        {tab === 'catalog' && catalogStats && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Domain Catalog — Category Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(catalogStats.categoryBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, count]) => (
                  <div key={cat} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">{cat.replace(/-/g, ' ')}</span>
                    <span className="text-sm font-bold text-gray-900 bg-white px-2 py-0.5 rounded border">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

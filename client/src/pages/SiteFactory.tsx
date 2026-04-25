import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import GlobalCommandPanel from '@/components/workspace/GlobalCommandPanel';

interface DomainAnalysis {
  domain: string;
  niche: string;
  state: string | null;
  stateCode: string | null;
  city: string | null;
  loanTypes: string[];
  suggestedTemplateId: string;
  suggestedKeywords: string[];
  brandName: string;
}

interface FactoryResult {
  domain: string;
  success: boolean;
  siteId?: number;
  pageCount?: number;
  analysis?: DomainAnalysis;
  error?: string;
}

interface BatchProgress {
  type?: string;
  total: number;
  completed: number;
  failed: number;
  current: string;
  results: FactoryResult[];
}

const NICHE_LABELS: Record<string, string> = {
  dscr: '🏘️ DSCR',
  refinance: '📉 Refinance',
  'hard-money': '🔨 Hard Money',
  bridge: '🌉 Bridge',
  purchase: '🏠 Purchase',
  general: '🏦 General',
};

const TEMPLATE_LABELS: Record<string, string> = {
  'dscr-landing': 'DSCR Landing',
  'mortgage-rate-checker': 'Rate Checker',
  'lead-capture': 'Lead Capture',
  'state-dscr': 'State DSCR',
};

export default function SiteFactory() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<'single' | 'bulk' | 'global'>('single');

  // Single domain state
  const [singleDomain, setSingleDomain] = useState('');
  const [singleLoading, setSingleLoading] = useState(false);
  const [singlePreview, setSinglePreview] = useState<DomainAnalysis | null>(null);
  const [singleResult, setSingleResult] = useState<FactoryResult | null>(null);
  const [singleError, setSingleError] = useState('');

  // Bulk state
  const [bulkText, setBulkText] = useState('');
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<BatchProgress | null>(null);
  const [bulkError, setBulkError] = useState('');
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.scrollTop = progressRef.current.scrollHeight;
    }
  }, [bulkProgress?.results.length]);

  // ── Analyze domain (preview) ────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!singleDomain.trim()) return;
    setSingleLoading(true);
    setSingleError('');
    setSinglePreview(null);
    setSingleResult(null);
    try {
      const res = await fetch('/api/factory/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: singleDomain }),
      });
      const data = await res.json();
      if (data.success) setSinglePreview(data.analysis);
      else setSingleError(data.error || 'Analysis failed');
    } catch {
      setSingleError('Network error');
    } finally {
      setSingleLoading(false);
    }
  };

  // ── Create single site ───────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!singleDomain.trim()) return;
    setSingleLoading(true);
    setSingleError('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/factory/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ domain: singleDomain, generateAIContent: true }),
      });
      const data = await res.json();
      if (data.success) setSingleResult(data.result);
      else setSingleError(data.error || 'Creation failed');
    } catch {
      setSingleError('Network error');
    } finally {
      setSingleLoading(false);
    }
  };

  // ── Bulk deploy via SSE ──────────────────────────────────────────────────────
  const handleBatch = async () => {
    if (!bulkText.trim()) return;
    setBulkRunning(true);
    setBulkError('');
    setBulkProgress(null);

    const token = localStorage.getItem('accessToken');

    try {
      const res = await fetch('/api/factory/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ domains: bulkText, generateAIContent: false }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setBulkError(err.error || `HTTP ${res.status}`);
        return;
      }

      // Read SSE stream
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
              const payload = JSON.parse(line.slice(6));
              setBulkProgress(prev => ({
                ...payload,
                results: payload.results ?? prev?.results ?? [],
              }));
            } catch { /* ignore malformed */ }
          }
        }
      }
    } catch (err) {
      setBulkError('Batch request failed');
    } finally {
      setBulkRunning(false);
    }
  };

  const domainCount = bulkText.split(/[\n,;]+/).filter(d => d.trim().includes('.')).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🏭 Site Factory</h1>
            <p className="text-gray-500 mt-1">
              Turn domain names into fully-configured mortgage sites in seconds
            </p>
          </div>
          <button
            onClick={() => navigate('/sites')}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            ← Back to Sites
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['single', 'bulk', 'global'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${
                tab === t
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t === 'single' ? '🌐 Single Domain' : t === 'bulk' ? '🚀 Bulk Deploy' : '⚡ Global AI'}
            </button>
          ))}
        </div>

        {/* ── Global AI Tab ── */}
        {tab === 'global' && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GlobalCommandPanel userId="1" />
          </div>
        )}

        {/* ── Single Domain Tab ── */}
        {tab === 'single' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Analyze & Create Site</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={singleDomain}
                  onChange={e => setSingleDomain(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                  placeholder="e.g. dscrloanstexas.com or arizonarefinance.net"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={singleLoading || !singleDomain.trim()}
                  className="px-5 py-2.5 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {singleLoading ? '⏳ Analyzing...' : '🔍 Analyze'}
                </button>
                <button
                  onClick={handleCreate}
                  disabled={singleLoading || !singleDomain.trim()}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {singleLoading ? '⏳ Creating...' : '✨ Create Site'}
                </button>
              </div>
              {singleError && (
                <p className="mt-3 text-sm text-red-600">⚠️ {singleError}</p>
              )}
            </div>

            {/* Analysis preview */}
            {singlePreview && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Domain Analysis</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Brand Name', value: singlePreview.brandName },
                    { label: 'Niche', value: NICHE_LABELS[singlePreview.niche] || singlePreview.niche },
                    { label: 'State', value: singlePreview.state || 'Nationwide' },
                    { label: 'Template', value: TEMPLATE_LABELS[singlePreview.suggestedTemplateId] || singlePreview.suggestedTemplateId },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className="font-semibold text-gray-900 text-sm">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Suggested Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {singlePreview.suggestedKeywords.map(kw => (
                      <span key={kw} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Loan Types</p>
                  <div className="flex flex-wrap gap-2">
                    {singlePreview.loanTypes.map(lt => (
                      <span key={lt} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                        {lt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Creation result */}
            {singleResult && (
              <div className={`rounded-xl border p-6 ${singleResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                {singleResult.success ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-green-800">
                        ✅ Site created! ID #{singleResult.siteId}
                      </p>
                      <p className="text-sm text-green-700 mt-1">{singleResult.domain}</p>
                    </div>
                    <button
                      onClick={() => navigate('/sites')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                    >
                      View Dashboard →
                    </button>
                  </div>
                ) : (
                  <p className="text-red-700">❌ {singleResult.error}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Bulk Deploy Tab ── */}
        {tab === 'bulk' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Bulk Domain Deploy</h2>
                <span className="text-xs text-gray-500">
                  {domainCount > 0 ? `${domainCount} domains detected` : 'Paste domains below'}
                </span>
              </div>
              <textarea
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                placeholder={`Paste your domains here — one per line, or comma-separated:\n\ndscrloanstexas.com\narizionarefinance.net\nfloridainvestorloans.com\ncaliforniadscr.com\n...`}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-gray-500">
                  ⚡ AI content generation is <strong>off by default</strong> for bulk speed.
                  Template copy is used — enable AI content per-site afterwards.
                </p>
                <button
                  onClick={handleBatch}
                  disabled={bulkRunning || domainCount === 0}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {bulkRunning ? (
                    <>
                      <span className="animate-spin">⚙️</span> Deploying...
                    </>
                  ) : (
                    `🚀 Deploy ${domainCount || ''} Sites`
                  )}
                </button>
              </div>
              {bulkError && <p className="mt-3 text-sm text-red-600">⚠️ {bulkError}</p>}
            </div>

            {/* Progress feed */}
            {bulkProgress && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                {/* Stats bar */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {[
                    { label: 'Total', value: bulkProgress.total, color: 'blue' },
                    { label: 'Completed', value: bulkProgress.completed, color: 'green' },
                    { label: 'Failed', value: bulkProgress.failed, color: 'red' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={`bg-${color}-50 rounded-lg p-3 text-center`}>
                      <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
                      <p className={`text-xs text-${color}-600`}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${bulkProgress.total > 0 ? ((bulkProgress.completed + bulkProgress.failed) / bulkProgress.total) * 100 : 0}%`,
                    }}
                  />
                </div>

                {bulkProgress.current && (
                  <p className="text-xs text-gray-500 mb-3 animate-pulse">
                    ⚙️ Processing: {bulkProgress.current}
                  </p>
                )}

                {/* Results log */}
                <div
                  ref={progressRef}
                  className="max-h-64 overflow-y-auto space-y-1"
                >
                  {bulkProgress.results.map((r, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs ${
                        r.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                      }`}
                    >
                      <span>{r.success ? '✅' : '❌'}</span>
                      <span className="font-mono flex-1">{r.domain}</span>
                      {r.analysis && (
                        <span className="text-gray-500">
                          {NICHE_LABELS[r.analysis.niche]} · {r.analysis.state || 'Nationwide'}
                        </span>
                      )}
                      {r.pageCount && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold">
                          {r.pageCount} PAGES
                        </span>
                      )}
                      {r.siteId && (
                        <div className="flex gap-2">
                          <span className="text-gray-400">#{r.siteId}</span>
                          <button 
                            onClick={() => navigate(`/ide/${r.siteId}`)}
                            className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] font-bold border transition-colors flex items-center gap-1"
                          >
                            <FileCode className="w-3 h-3" /> EDIT CODE
                          </button>
                        </div>
                      )}
                      {r.error && r.error !== 'already_exists' && (
                        <span className="text-red-600">{r.error}</span>
                      )}
                      {r.error === 'already_exists' && (
                        <span className="text-gray-400">already exists</span>
                      )}
                    </div>
                  ))}
                </div>

                {bulkProgress.type === 'complete' && (
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm font-semibold text-green-700">
                      🎉 Batch complete! {bulkProgress.completed} sites created.
                    </p>
                    <button
                      onClick={() => navigate('/sites')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                    >
                      View All Sites →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

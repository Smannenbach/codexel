import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';

interface BlitzResult {
  domain: string;
  score: number;
  keywordCount: number;
  geoPagesCount: number;
  aiSnippetsCount: number;
  schemaCount: number;
  summary: {
    primaryKeywords: string[];
    topGeoPages: string[];
    eeat: { author: string; license: string };
  };
}

interface BatchProgress {
  type: string;
  domain?: string;
  score?: number;
  geoPages?: number;
  done?: number;
  total?: number;
  avgScore?: number;
  error?: string;
}

const SCORE_COLOR = (s: number) =>
  s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-600' : 'text-red-500';

const SCORE_BG = (s: number) =>
  s >= 80 ? 'bg-green-100 text-green-800' : s >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-700';

export default function SEOBlitz() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<'single' | 'batch' | 'info'>('single');

  // Single domain
  const [singleDomain, setSingleDomain] = useState('');
  const [singleResult, setSingleResult] = useState<BlitzResult | null>(null);
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState('');

  // Batch
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchEvents, setBatchEvents] = useState<BatchProgress[]>([]);
  const [batchComplete, setBatchComplete] = useState<BatchProgress | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [batchEvents.length]);

  const runSingle = async () => {
    if (!singleDomain.trim()) return;
    setSingleLoading(true);
    setSingleError('');
    setSingleResult(null);
    try {
      const domain = singleDomain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
      const res = await fetch(`/api/seo-blitz/run/${encodeURIComponent(domain)}`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (data.success) setSingleResult(data);
      else setSingleError(data.error || 'Failed');
    } catch (e) {
      setSingleError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setSingleLoading(false);
    }
  };

  const runBatch = async () => {
    setBatchRunning(true);
    setBatchEvents([]);
    setBatchComplete(null);

    try {
      const res = await fetch('/api/seo-blitz/batch', {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });

      if (!res.ok) {
        setBatchEvents(prev => [...prev, { type: 'error', error: `HTTP ${res.status}` }]);
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
              const event = JSON.parse(line.slice(6)) as BatchProgress;
              if (event.type === 'complete') setBatchComplete(event);
              else setBatchEvents(prev => [...prev, event]);
            } catch { /* ignore */ }
          }
        }
      }
    } finally {
      setBatchRunning(false);
    }
  };

  const progressPercent = batchComplete
    ? 100
    : batchEvents.filter(e => e.type === 'progress').length > 0
      ? Math.round((batchEvents.filter(e => e.type === 'progress').length / (batchEvents.find(e => e.type === 'start')?.total || 1)) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🎯 SEO Blitz</h1>
            <p className="text-gray-500 mt-1">
              AI-powered keyword strategy, geo pages, schema markup & AI-search optimization for all 242 domains
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/deploy')} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100">
              🚀 Deploy
            </button>
            <button onClick={() => navigate('/sites')} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100">
              ← Sites
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Keywords/Site', value: '50+', icon: '🔑', sub: 'primary + long-tail' },
            { label: 'Geo Pages/Site', value: '8', icon: '📍', sub: 'city landing pages' },
            { label: 'Schema Types', value: '5', icon: '🏗️', sub: 'FAQ, HowTo, LocalBiz…' },
            { label: 'AI Search Signals', value: '✓', icon: '🤖', sub: 'Perplexity, GPT, Gemini' },
          ].map(({ label, value, icon, sub }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-xs font-medium text-gray-700">{label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['single', 'batch', 'info'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${
                tab === t ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t === 'single' ? '🔍 Single Domain' : t === 'batch' ? '⚡ Batch All Sites' : 'ℹ️ Strategy'}
            </button>
          ))}
        </div>

        {/* ── Single Domain Tab ── */}
        {tab === 'single' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Run SEO Blitz on a Domain</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={singleDomain}
                  onChange={e => setSingleDomain(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && runSingle()}
                  placeholder="e.g. arizonafinancing.com or dscrloans.com"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  onClick={runSingle}
                  disabled={singleLoading || !singleDomain.trim()}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-40 flex items-center gap-2"
                >
                  {singleLoading ? <><span className="animate-spin">⚙️</span> Analyzing…</> : '🎯 Run Blitz'}
                </button>
              </div>
              {singleError && <p className="mt-2 text-sm text-red-600">❌ {singleError}</p>}
            </div>

            {singleResult && (
              <div className="space-y-4">
                {/* Score banner */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{singleResult.domain}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">SEO Blitz complete — all signals generated</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${SCORE_COLOR(singleResult.score)}`}>{singleResult.score}</div>
                      <div className="text-xs text-gray-500 mt-1">SEO Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100">
                    {[
                      { label: 'Keywords Generated', value: singleResult.keywordCount },
                      { label: 'Geo Pages Built', value: singleResult.geoPagesCount },
                      { label: 'AI Answer Snippets', value: singleResult.aiSnippetsCount },
                      { label: 'Schema Types', value: singleResult.schemaCount },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{value}</div>
                        <div className="text-xs text-gray-500">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h4 className="font-medium text-gray-900 mb-3">🔑 Primary Keywords</h4>
                    <ul className="space-y-1.5">
                      {singleResult.summary.primaryKeywords.map(kw => (
                        <li key={kw} className="text-sm text-gray-700 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                          {kw}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h4 className="font-medium text-gray-900 mb-3">📍 Top Geo Pages</h4>
                    <ul className="space-y-1.5">
                      {singleResult.summary.topGeoPages.map(slug => (
                        <li key={slug} className="text-xs font-mono text-gray-600 flex items-center gap-2">
                          <span className="text-green-500">↗</span>
                          /{slug}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">E-E-A-T Author: <strong>{singleResult.summary.eeat.author}</strong></p>
                      <p className="text-xs text-gray-500 mt-0.5">{singleResult.summary.eeat.license}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Batch Tab ── */}
        {tab === 'batch' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-gray-900">Batch SEO Blitz — All Deployed Sites</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Generates keyword matrices, geo pages, schema markup, and AI-search signals for every site in your database.
                  </p>
                </div>
                <button
                  onClick={runBatch}
                  disabled={batchRunning}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-40 flex items-center gap-2 flex-shrink-0"
                >
                  {batchRunning ? <><span className="animate-spin">⚙️</span> Running…</> : '⚡ Blitz All Sites'}
                </button>
              </div>

              {/* Progress bar */}
              {(batchRunning || batchComplete) && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  {batchComplete && (
                    <p className="text-sm text-green-600 mt-2 font-medium">
                      ✅ Complete — {batchComplete.done} sites processed, avg score: {batchComplete.avgScore}/100
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Log */}
            {batchEvents.length > 0 && (
              <div className="bg-gray-900 rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-gray-800 text-gray-300 text-xs font-mono flex items-center gap-2">
                  <span className={batchRunning ? 'animate-pulse text-green-400' : 'text-gray-500'}>●</span>
                  Blitz Log
                </div>
                <div ref={logRef} className="p-4 max-h-80 overflow-y-auto font-mono text-xs space-y-1">
                  {batchEvents.map((e, i) => {
                    if (e.type === 'start') return <p key={i} className="text-blue-400">▶ Starting batch blitz on {e.total} sites</p>;
                    if (e.type === 'progress' && e.domain) {
                      const scoreStr = e.score != null ? String(e.score) : '?';
                      const color = e.score != null && e.score >= 80 ? 'text-green-400' : e.score != null && e.score >= 60 ? 'text-yellow-400' : 'text-gray-300';
                      return <p key={i} className={color}>✓ {e.domain} — score: {scoreStr}/100, geo pages: {e.geoPages} ({e.done}/{e.total})</p>;
                    }
                    if (e.type === 'error') return <p key={i} className="text-red-400">✗ {e.domain}: {e.error}</p>;
                    return null;
                  })}
                  {batchRunning && <p className="text-gray-500 animate-pulse">▌</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Info / Strategy Tab ── */}
        {tab === 'info' && (
          <div className="space-y-4">
            {[
              {
                title: '🔑 Keyword Strategy',
                items: [
                  '5 primary money keywords (with geo modifier)',
                  '20 secondary / supporting keywords',
                  '25 long-tail question keywords ("how to get a DSCR loan in Phoenix")',
                  '8 AI-search answer-box targets (Perplexity, ChatGPT, Gemini)',
                  '15 local geo-modified variants per state',
                ],
              },
              {
                title: '📍 GEO Content Pages',
                items: [
                  '8 city-specific landing pages generated per domain',
                  'Hyper-local copy referencing city + state market conditions',
                  'Per-city FAQ schema (4 questions each)',
                  'LocalBusiness schema with address + opening hours',
                  'Internal cross-links to related domains in same niche',
                ],
              },
              {
                title: '🏗️ Schema Markup',
                items: [
                  'FinancialService + OfferCatalog on homepage',
                  'FAQPage schema (5 questions from keyword matrix)',
                  'HowTo schema ("How to get a DSCR Loan in 5 Steps")',
                  'BreadcrumbList on all pages',
                  'Article schema with E-E-A-T author (NMLS #1831233)',
                ],
              },
              {
                title: '🤖 AI Search Optimization',
                items: [
                  'Answer-box ready paragraphs (40-60 words, direct answer first)',
                  'Citation-ready stat blocks from authoritative sources (CFPB, Freddie Mac, MBA)',
                  'E-E-A-T signals: licensed author, 12+ years experience, NMLS credentials',
                  'robots.txt allows GPTBot, PerplexityBot, ClaudeBot, Google-Extended',
                  'Conversational Q&A format for ChatGPT search pull-through',
                ],
              },
              {
                title: '🌐 Technical SEO',
                items: [
                  'XML sitemap with priority and changefreq per page type',
                  'robots.txt with AI crawler allowances',
                  'Internal link graph cross-linking 242 domains (topical cluster)',
                  'Core Web Vitals scores stored for front-end performance tuning',
                  'SSL + Cloudflare performance rules via deployer',
                ],
              },
            ].map(({ title, items }) => (
              <div key={title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
                <ul className="space-y-1.5">
                  {items.map(item => (
                    <li key={item} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

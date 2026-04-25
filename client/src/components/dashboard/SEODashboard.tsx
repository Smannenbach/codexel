import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Search, FileText, Globe, Zap, ChevronRight } from 'lucide-react';

interface KeywordCluster {
  primary: string;
  secondary: string[];
  longtail: string[];
  volume: 'high' | 'medium' | 'low';
  intent: string;
  difficulty: string;
}

interface SEOScore {
  overall: number;
  breakdown: Record<string, number>;
  recommendations: string[];
}

interface GEOContent {
  aiSearchSummary: string;
  featuredSnippetTarget: string;
  questionsAnswered: Array<{ question: string; answer: string }>;
}

interface Props {
  siteId: number;
  domain?: string;
}

const SCORE_COLOR = (s: number) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400';
const SCORE_BG = (s: number) => s >= 80 ? 'bg-green-500' : s >= 60 ? 'bg-yellow-500' : 'bg-red-500';

const INTENT_COLORS: Record<string, string> = {
  transactional: 'bg-green-500/20 text-green-400',
  commercial: 'bg-blue-500/20 text-blue-400',
  informational: 'bg-purple-500/20 text-purple-400',
  navigational: 'bg-gray-500/20 text-gray-400',
};

const VOL_COLORS: Record<string, string> = {
  high: 'bg-orange-500/20 text-orange-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-gray-500/20 text-gray-400',
};

export default function SEODashboard({ siteId, domain }: Props) {
  const [keywords, setKeywords] = useState<KeywordCluster[]>([]);
  const [score, setScore] = useState<SEOScore | null>(null);
  const [geo, setGeo] = useState<GEOContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'keywords' | 'score' | 'geo'>('keywords');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/seo/keywords?niche=dscr').then(r => r.json()),
      fetch('/api/seo/score', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: domain, hasSchema: false, contentLength: 0 }),
      }).then(r => r.json()),
      fetch('/api/seo/geo-hints', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'dscr loan', context: `Mortgage lending site ${domain ?? ''}` }),
      }).then(r => r.json()),
    ])
      .then(([kw, sc, geoData]) => {
        setKeywords(Array.isArray(kw) ? kw : []);
        setScore(sc);
        setGeo(geoData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [siteId]);

  const tabs = [
    { id: 'keywords' as const, label: 'Keywords', icon: <Search className="w-3.5 h-3.5" /> },
    { id: 'score' as const, label: 'SEO Score', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'geo' as const, label: 'AI Search (GEO)', icon: <Zap className="w-3.5 h-3.5" /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
        Loading SEO data…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Generate Meta Tags', icon: <FileText className="w-3 h-3" /> },
          { label: 'Build Schema', icon: <Globe className="w-3 h-3" /> },
          { label: 'Generate Sitemap', icon: <Globe className="w-3 h-3" /> },
          { label: 'Score This Page', icon: <TrendingUp className="w-3 h-3" /> },
        ].map(action => (
          <Button key={action.label} variant="outline" size="sm"
            className="border-gray-700 text-gray-300 hover:border-blue-500 hover:text-blue-400 text-xs h-7 gap-1.5">
            {action.icon}{action.label}
          </Button>
        ))}
      </div>

      <div className="flex gap-1 bg-gray-900 rounded-lg p-1 border border-gray-700">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex-1 justify-center
              ${activeTab === tab.id ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'keywords' && (
        <div className="space-y-3">
          {keywords.map((cluster, i) => (
            <Card key={i} className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold text-white">{cluster.primary}</CardTitle>
                  <div className="flex gap-1.5 shrink-0">
                    <Badge className={`${VOL_COLORS[cluster.volume]} text-xs border-0`}>{cluster.volume} vol</Badge>
                    <Badge className={`${INTENT_COLORS[cluster.intent] ?? 'bg-gray-700 text-gray-300'} text-xs border-0`}>{cluster.intent}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Secondary keywords</div>
                  <div className="flex flex-wrap gap-1">
                    {cluster.secondary.map(kw => (
                      <span key={kw} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">{kw}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Long-tail keywords</div>
                  <div className="space-y-0.5">
                    {cluster.longtail.slice(0, 5).map(kw => (
                      <div key={kw} className="flex items-center gap-1.5 text-xs text-gray-400">
                        <ChevronRight className="w-3 h-3 text-gray-600" />{kw}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'score' && score && (
        <div className="space-y-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6 text-center">
              <div className={`text-5xl font-bold mb-2 ${SCORE_COLOR(score.overall)}`}>{score.overall}</div>
              <div className="text-sm text-gray-400 mb-4">Overall SEO Score</div>
              <div className="space-y-2">
                {Object.entries(score.breakdown).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400 capitalize">{key}</span>
                      <span className={SCORE_COLOR(val)}>{val}/100</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${SCORE_BG(val)} transition-all`} style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-white">Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ul className="space-y-2">
                {score.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs flex items-center justify-center mt-0.5 shrink-0">{i + 1}</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'geo' && geo && (
        <div className="space-y-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" /> AI Search Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-sm text-gray-300 leading-relaxed">{geo.aiSearchSummary}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-white">Featured Snippet Target</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{geo.featuredSnippetTarget}</pre>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-white">People Also Ask (PAA)</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {geo.questionsAnswered.map((qa, i) => (
                <div key={i} className="border-l-2 border-blue-600 pl-3">
                  <div className="text-sm font-medium text-white mb-1">{qa.question}</div>
                  <div className="text-xs text-gray-400 leading-relaxed">{qa.answer}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

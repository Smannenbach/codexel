import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { X, Edit, Eye, Loader2 } from 'lucide-react';
import { TEMPLATE_REGISTRY } from '../templates';
import DSCRLanding from '../templates/DSCRLanding';
import MortgageRateChecker from '../templates/MortgageRateChecker';
import LeadCapture from '../templates/LeadCapture';
import StateDSCR from '../templates/StateDSCR';

const TEMPLATE_MAP: Record<string, React.ComponentType<any>> = {
  'dscr-landing': DSCRLanding,
  'mortgage-rate-checker': MortgageRateChecker,
  'lead-capture': LeadCapture,
  'state-dscr': StateDSCR,
};

export default function TemplatePreview() {
  const { templateId } = useParams<{ templateId: string }>();
  const [, navigate] = useLocation();
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const search = new URLSearchParams(window.location.search);
  const siteId = parseInt(search.get('siteId') ?? '0') || undefined;

  useEffect(() => {
    if (siteId) {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      fetch(`/api/sites/${siteId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then(res => res.json())
        .then(data => {
          if (!data.error) setSiteData(data);
        })
        .catch(err => console.error('Failed to fetch site:', err))
        .finally(() => setLoading(false));
    }
  }, [siteId]);

  const TemplateComponent = TEMPLATE_MAP[templateId ?? ''] ?? DSCRLanding;
  const meta = TEMPLATE_REGISTRY.find(t => t.id === templateId);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Preview bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-10 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Eye className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-300 font-medium">
            Preview Mode — <span className="text-white">{meta?.name ?? templateId}</span>
          </span>
          {siteId && (
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
              Site #{siteId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/sites')}
            className="flex items-center gap-1.5 px-3 py-1 text-xs text-blue-400 hover:text-blue-300 border border-blue-700 hover:border-blue-500 rounded transition-colors"
          >
            <Edit className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={() => window.close()}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-3 h-3" /> Close
          </button>
        </div>
      </div>

      {/* Template content — pushed below preview bar */}
      <div className="pt-10">
        {loading ? (
          <div className="h-[calc(100vh-40px)] flex flex-col items-center justify-center text-gray-500 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium">Loading site content...</p>
          </div>
        ) : (
          <TemplateComponent siteId={siteId} config={siteData?.config} />
        )}
      </div>
    </div>
  );
}

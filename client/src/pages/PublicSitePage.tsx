import { useEffect, useState } from 'react';
import { ArrowRight, Building2, ExternalLink, Mail, Phone } from 'lucide-react';
import { useParams } from 'wouter';
import SEOHead from '@/components/SEOHead';
import {
  TemplateDisclosureFooter,
  TemplateLeadPanel,
  TemplateTrustBar,
} from '@/components/templates/TemplateChrome';
import { getTemplateComponent } from '@/templates/template-map';
import {
  buildTemplateSiteContext,
  normalizeTemplateSite,
  type TemplatePageSummary,
  type TemplateSite,
} from '@/templates/template-config';
import MarketingLanding from './marketing-landing';
import NotFound from './not-found';

interface SeoPageSummary {
  slug: string;
  path: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl?: string;
  contentLength: number;
}

interface SeoInternalLink {
  sourcePath: string;
  targetPath: string;
  anchor: string;
}

interface PublicSiteRenderResponse {
  site: unknown;
  currentPage: SeoPageSummary;
  requestedPath: string;
  seo: {
    metaTags: {
      title: string;
      description: string;
      keywords: string;
      canonicalUrl?: string;
      robots: string;
    };
    socialMeta: {
      ogTitle: string;
      ogDescription: string;
      ogImage?: string;
    };
    structuredData: string[];
    internalLinks: SeoInternalLink[];
    pageMeta: SeoPageSummary[];
  };
}

interface PublicSitePageProps {
  fallbackToMarketing?: boolean;
}

function buildParagraphs(content?: string): string[] {
  if (!content) {
    return [];
  }

  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function findPageContent(site: TemplateSite | undefined, slug: string): TemplatePageSummary | undefined {
  return site?.config?.customContent?.pages?.find((page) => page.slug === slug);
}

export function PublicSiteHome() {
  return <PublicSitePage fallbackToMarketing />;
}

export function PublicSiteSlugRoute() {
  return <PublicSitePage />;
}

export default function PublicSitePage({ fallbackToMarketing = false }: PublicSitePageProps) {
  const params = useParams<{ slug?: string }>();
  const slug = params.slug;
  const [payload, setPayload] = useState<PublicSiteRenderResponse | null>(null);
  const [site, setSite] = useState<TemplateSite | undefined>();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSite() {
      setLoading(true);
      setNotFound(false);
      setError(null);

      try {
        const query = slug ? `?slug=${encodeURIComponent(slug)}` : '';
        const response = await fetch(`/api/public/site-render${query}`);

        if (response.status === 404) {
          if (!cancelled) {
            setPayload(null);
            setSite(undefined);
            setNotFound(true);
          }
          return;
        }

        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(typeof data?.error === 'string' ? data.error : 'Failed to load public site');
        }

        const normalizedSite = normalizeTemplateSite(data?.site);
        if (!normalizedSite) {
          throw new Error('Public site payload is invalid');
        }

        if (!cancelled) {
          setPayload(data as PublicSiteRenderResponse);
          setSite(normalizedSite);
        }
      } catch (loadError) {
        if (!cancelled) {
          setPayload(null);
          setSite(undefined);
          setError(loadError instanceof Error ? loadError.message : 'Failed to load public site');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSite();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-400">
        Loading site...
      </div>
    );
  }

  if (notFound) {
    return fallbackToMarketing ? <MarketingLanding /> : <NotFound />;
  }

  if (error || !payload || !site) {
    if (fallbackToMarketing) {
      return <MarketingLanding />;
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 p-6 text-center text-gray-300">
        <div className="max-w-lg rounded-2xl border border-red-900/60 bg-red-950/20 p-8">
          <h1 className="text-2xl font-bold text-white">Public page unavailable</h1>
          <p className="mt-3 text-sm text-gray-400">{error ?? 'Unable to render this public page.'}</p>
        </div>
      </div>
    );
  }

  const siteContext = buildTemplateSiteContext(site);
  const currentPageContent = findPageContent(site, payload.currentPage.slug);
  const pageMetaByPath = new Map(payload.seo.pageMeta.map((page) => [page.path, page]));
  const relatedPages = payload.seo.internalLinks
    .filter((link) => link.sourcePath === payload.requestedPath)
    .map((link) => {
      const target = pageMetaByPath.get(link.targetPath);
      if (!target) {
        return undefined;
      }

      return {
        ...target,
        anchor: link.anchor,
      };
    })
    .filter((page): page is SeoPageSummary & { anchor: string } => Boolean(page));
  const pageParagraphs = buildParagraphs(currentPageContent?.content);
  const TemplateComponent = getTemplateComponent(site.templateId);
  const isHomePage = payload.requestedPath === '/';

  return (
    <>
      <SEOHead
        title={payload.currentPage.metaTitle}
        description={payload.currentPage.metaDescription}
        keywords={payload.currentPage.keywords.join(', ')}
        canonicalUrl={payload.currentPage.canonicalUrl ?? payload.seo.metaTags.canonicalUrl}
        ogTitle={payload.currentPage.metaTitle}
        ogDescription={payload.currentPage.metaDescription}
        ogImage={payload.seo.socialMeta.ogImage}
        robots={payload.seo.metaTags.robots}
        structuredData={payload.seo.structuredData}
      />

      {isHomePage && TemplateComponent ? (
        <TemplateComponent siteId={site.id} site={site} config={site.config} />
      ) : (
        <div className="min-h-screen bg-gray-950 text-white">
          <TemplateTrustBar
            items={[
              { text: site.name ?? siteContext.brandName ?? 'Mortgage guidance', icon: <Building2 className="h-4 w-4" /> },
              { text: siteContext.locationLabel ?? siteContext.primaryStateName ?? 'Investor-focused lending', icon: <ExternalLink className="h-4 w-4" /> },
              { text: payload.currentPage.canonicalUrl ?? payload.seo.metaTags.canonicalUrl ?? site.domain ?? '', icon: <ArrowRight className="h-4 w-4" /> },
            ].filter((item) => item.text)}
          />

          <section className="border-b border-gray-900 bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 px-6 py-20">
            <div className="mx-auto max-w-5xl">
              <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-blue-300 hover:text-blue-200">
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to home
              </a>
              <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white md:text-6xl">
                {payload.currentPage.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-300">
                {payload.currentPage.metaDescription}
              </p>
            </div>
          </section>

          <section className="px-6 py-16">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <article className="rounded-3xl border border-gray-800 bg-gray-900/70 p-8 shadow-2xl shadow-black/30">
                <div className="space-y-6 text-base leading-8 text-gray-200">
                  {pageParagraphs.length > 0 ? (
                    pageParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                  ) : (
                    <p>
                      {payload.currentPage.metaDescription} Contact {site.name ?? siteContext.brandName ?? 'our team'} for a
                      tailored mortgage strategy and full scenario review.
                    </p>
                  )}
                </div>
              </article>

              <div className="space-y-6">
                <TemplateLeadPanel
                  title="Talk to a mortgage specialist"
                  description="Use the main site form or contact details below to turn this page visit into a live deal conversation."
                >
                  <div className="space-y-4 text-sm text-gray-300">
                    {site.config?.phone ? (
                      <a href={`tel:${site.config.phone}`} className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-950/80 px-4 py-3 hover:border-blue-700">
                        <Phone className="h-4 w-4 text-blue-400" />
                        <span>{site.config.phone}</span>
                      </a>
                    ) : null}
                    {site.config?.email ? (
                      <a href={`mailto:${site.config.email}`} className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-950/80 px-4 py-3 hover:border-blue-700">
                        <Mail className="h-4 w-4 text-blue-400" />
                        <span>{site.config.email}</span>
                      </a>
                    ) : null}
                    <a href="/" className="inline-flex items-center gap-2 font-semibold text-blue-300 hover:text-blue-200">
                      Return to the main lending page
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </TemplateLeadPanel>

                {relatedPages.length > 0 ? (
                  <div className="rounded-3xl border border-gray-800 bg-gray-900/70 p-6">
                    <h2 className="text-xl font-bold text-white">Related resources</h2>
                    <div className="mt-4 space-y-3">
                      {relatedPages.slice(0, 6).map((page) => (
                        <a
                          key={`${page.path}-${page.anchor}`}
                          href={page.path}
                          className="block rounded-2xl border border-gray-800 bg-gray-950/70 px-4 py-3 hover:border-blue-700"
                        >
                          <div className="text-sm font-semibold text-blue-300">{page.anchor}</div>
                          <div className="mt-1 text-sm text-gray-300">{page.metaDescription}</div>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <TemplateDisclosureFooter
            brandLine={`${site.name ?? siteContext.brandName ?? 'This site'} Mortgage Guidance`}
            disclosure={`${site.name ?? siteContext.brandName ?? 'This site'} provides mortgage information for educational and lead-generation purposes. Terms, approval, and program availability depend on borrower profile, property type, and lender guidelines.`}
          >
            {site.config?.nmlsNumber ? <p>NMLS #{site.config.nmlsNumber}</p> : null}
          </TemplateDisclosureFooter>
        </div>
      )}
    </>
  );
}

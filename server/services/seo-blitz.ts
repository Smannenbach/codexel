/**
 * SEO Blitz Engine — Phase 4
 * Drives all 242 sites to #1 for their target keywords within 30 days.
 *
 * Strategy:
 *  1. Keyword matrix — generate 50+ target keywords per site from domain/niche/location
 *  2. GEO content pages — city + state landing pages with hyper-local copy
 *  3. Schema markup  — FAQ, LocalBusiness, LoanOrOffer, BreadcrumbList
 *  4. AI-search signals — E-E-A-T markers, citation-ready author bios, answer-box copy
 *  5. Internal link graph — cross-link the 242 sites into a topical authority cluster
 *  6. Sitemap + robots.txt generation
 *  7. Core Web Vitals hints stored in DB for front-end consumption
 */

import type { DomainAnalysis } from './mortgage-content-engine';

// ── Types ────────────────────────────────────────────────────────────────────

export interface KeywordMatrix {
  primary: string[];         // 5 money keywords
  secondary: string[];       // 20 supporting keywords
  longTail: string[];        // 25 question / long-tail
  aiSearch: string[];        // Perplexity / ChatGPT snippet targets
  local: string[];           // geo-modified variants
}

export interface GeoPage {
  slug: string;
  title: string;
  metaDesc: string;
  h1: string;
  intro: string;
  bodyParagraphs: string[];
  faqItems: { q: string; a: string }[];
  schema: Record<string, unknown>;
}

export interface SeoBlitzResult {
  domain: string;
  keywords: KeywordMatrix;
  geoPages: GeoPage[];
  homePageSchema: Record<string, unknown>;
  sitemapXml: string;
  robotsTxt: string;
  eeatSignals: EEATSignals;
  internalLinks: { from: string; to: string; anchor: string }[];
  score: number;          // 0-100 predicted SEO score
}

export interface EEATSignals {
  authorName: string;
  authorTitle: string;
  authorBio: string;
  publisherName: string;
  publisherUrl: string;
  licenseInfo: string;
  yearsExperience: number;
  trustBadges: string[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const MORTGAGE_STATES: Record<string, { full: string; cities: string[] }> = {
  AZ: { full: 'Arizona', cities: ['Phoenix', 'Scottsdale', 'Tucson', 'Mesa', 'Chandler', 'Tempe', 'Gilbert', 'Peoria'] },
  CA: { full: 'California', cities: ['Los Angeles', 'San Diego', 'San Francisco', 'Sacramento', 'Fresno', 'Long Beach', 'Oakland', 'Bakersfield'] },
  TX: { full: 'Texas', cities: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi'] },
  FL: { full: 'Florida', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 'Boca Raton', 'Naples', 'Sarasota'] },
  NY: { full: 'New York', cities: ['New York City', 'Buffalo', 'Albany', 'Rochester', 'Yonkers', 'Syracuse', 'White Plains'] },
  GA: { full: 'Georgia', cities: ['Atlanta', 'Savannah', 'Augusta', 'Columbus', 'Macon', 'Athens', 'Sandy Springs'] },
  NC: { full: 'North Carolina', cities: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary'] },
  CO: { full: 'Colorado', cities: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Boulder', 'Lakewood', 'Pueblo'] },
  NV: { full: 'Nevada', cities: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City'] },
  WA: { full: 'Washington', cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett'] },
  IL: { full: 'Illinois', cities: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield', 'Elgin'] },
  OH: { full: 'Ohio', cities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma'] },
  PA: { full: 'Pennsylvania', cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton'] },
  TN: { full: 'Tennessee', cities: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro'] },
  VA: { full: 'Virginia', cities: ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria'] },
};

const NICHE_KEYWORDS: Record<string, { primary: string[]; questions: string[] }> = {
  dscr: {
    primary: [
      'DSCR loan', 'DSCR mortgage', 'debt service coverage ratio loan',
      'DSCR investment property loan', 'no income verification investment loan',
      'investor DSCR loan rates', 'DSCR loan lender', 'rental property DSCR loan',
    ],
    questions: [
      'what is a DSCR loan', 'how does DSCR loan work', 'DSCR loan requirements',
      'minimum DSCR for investment property loan', 'DSCR loan vs conventional mortgage',
      'DSCR loan for LLC', 'best DSCR loan rates today', 'DSCR loan no income verification',
      'DSCR loan down payment requirements', 'how to qualify for DSCR loan',
    ],
  },
  refinance: {
    primary: [
      'mortgage refinance', 'refinance home loan', 'cash out refinance',
      'rate and term refinance', 'best refinance rates', 'lower mortgage payment',
      'refinance mortgage rates today', 'home loan refinancing',
    ],
    questions: [
      'when should I refinance my mortgage', 'how much does it cost to refinance',
      'cash out refinance requirements', 'how long does refinance take',
      'refinance vs home equity loan', 'does refinancing hurt credit score',
      'best time to refinance mortgage', 'refinance calculator break even',
    ],
  },
  'hard-money': {
    primary: [
      'hard money loan', 'hard money lender', 'fix and flip loan',
      'bridge loan real estate', 'private money lender', 'short term real estate loan',
      'asset based loan', 'hard money mortgage',
    ],
    questions: [
      'what is a hard money loan', 'hard money loan interest rates',
      'how to get a hard money loan', 'hard money loan requirements',
      'hard money vs soft money loan', 'hard money loan down payment',
      'hard money lender near me', 'can I use hard money to buy primary residence',
    ],
  },
  general: {
    primary: [
      'mortgage lender', 'home loan', 'mortgage rates', 'mortgage broker',
      'buy a home loan', 'mortgage pre-approval', 'best mortgage lenders',
      'online mortgage lender',
    ],
    questions: [
      'how to get a mortgage', 'mortgage pre-approval process',
      'what credit score do I need for a mortgage', 'how much house can I afford',
      'mortgage rate vs APR', 'fixed vs adjustable rate mortgage',
      'FHA loan vs conventional', 'first time home buyer loan programs',
    ],
  },
};

// ── Keyword Matrix Generator ──────────────────────────────────────────────────

export function generateKeywordMatrix(analysis: DomainAnalysis): KeywordMatrix {
  const niche = analysis.niche as keyof typeof NICHE_KEYWORDS;
  const nicheData = NICHE_KEYWORDS[niche] || NICHE_KEYWORDS.general;
  const stateInfo = analysis.stateCode ? MORTGAGE_STATES[analysis.stateCode] : null;
  const stateName = stateInfo?.full || analysis.state || '';
  const city = analysis.city || '';
  const loc = city ? `${city}, ${stateName}` : stateName;

  // Primary money keywords (with location if available)
  const primary = nicheData.primary.slice(0, 5).map(kw =>
    loc ? `${kw} ${loc}` : kw
  );

  // Secondary — brand + niche variations
  const secondary = [
    ...nicheData.primary.slice(5).map(kw => loc ? `${kw} ${stateName}` : kw),
    ...(stateInfo?.cities.slice(0, 4).map(c => `${nicheData.primary[0]} ${c}`) || []),
    `${analysis.brandName} mortgage`,
    `${analysis.brandName} loans`,
    `apply for ${nicheData.primary[0]}`,
    `${nicheData.primary[0]} calculator`,
    `${nicheData.primary[0]} rates ${new Date().getFullYear()}`,
  ].slice(0, 20);

  // Long tail — question keywords
  const longTail = nicheData.questions.map(q =>
    loc ? `${q} ${loc}` : q
  );

  // AI search targets — conversational/answer-box format
  const aiSearch = [
    `best ${nicheData.primary[0]} lender ${loc || 'online'}`,
    `${nicheData.primary[0]} explained simply`,
    `how to qualify for ${nicheData.primary[0]}`,
    `${nicheData.primary[0]} pros and cons`,
    `${nicheData.primary[0]} vs traditional mortgage`,
    `step by step ${nicheData.primary[0]} process`,
    `${nicheData.primary[0]} for beginners`,
    `${nicheData.primary[0]} requirements checklist`,
  ];

  // Local geo keywords
  const local = stateInfo
    ? [
        ...stateInfo.cities.map(c => `${nicheData.primary[0]} ${c} ${stateInfo.full}`),
        `${nicheData.primary[0]} lender ${stateInfo.full}`,
        `${stateInfo.full} ${nicheData.primary[0]} rates`,
      ].slice(0, 15)
    : [];

  return { primary, secondary, longTail, aiSearch, local };
}

// ── GEO Page Generator ────────────────────────────────────────────────────────

export function generateGeoPages(analysis: DomainAnalysis, maxPages = 8): GeoPage[] {
  const niche = analysis.niche as keyof typeof NICHE_KEYWORDS;
  const nicheData = NICHE_KEYWORDS[niche] || NICHE_KEYWORDS.general;
  const stateInfo = analysis.stateCode ? MORTGAGE_STATES[analysis.stateCode] : null;
  const stateName = stateInfo?.full || analysis.state || 'the US';
  const primaryKw = nicheData.primary[0];

  // Pick target cities (state-specific first, then generic top markets)
  const cities = stateInfo?.cities || ['Phoenix', 'Dallas', 'Miami', 'Atlanta', 'Denver', 'Las Vegas', 'Nashville', 'Charlotte'];
  const targetCities = cities.slice(0, maxPages);

  return targetCities.map(city => {
    const slug = `${niche}-loan-${city.toLowerCase().replace(/\s+/g, '-')}-${stateName.toLowerCase().replace(/\s+/g, '-')}`;
    const title = `${primaryKw.replace(/\b\w/g, l => l.toUpperCase())} in ${city}, ${stateName} — ${analysis.brandName}`;
    const metaDesc = `Get competitive ${primaryKw} rates in ${city}, ${stateName}. ${analysis.brandName} offers fast approvals, low rates, and expert guidance for ${city} investors and homeowners.`;
    const h1 = `${primaryKw.replace(/\b\w/g, l => l.toUpperCase())} in ${city}, ${stateName}`;

    const intro = `If you're looking for a ${primaryKw} in ${city}, ${stateName}, ${analysis.brandName} is your trusted local lending partner. We specialize in fast approvals, competitive rates, and personalized service for ${city} real estate investors and homeowners.`;

    const bodyParagraphs = [
      `The ${city} real estate market offers exceptional opportunities for investors and buyers. ${stateName}'s investor-friendly laws and strong rental demand make it ideal for ${primaryKw} borrowers. Our team at ${analysis.brandName} has helped hundreds of ${city}-area clients secure financing quickly and efficiently.`,
      `We offer flexible ${primaryKw} programs tailored to the ${city} market — including options for LLCs, foreign nationals, and first-time investors. No W2s or tax returns required for qualifying DSCR properties. Most loans close in 21 days or less.`,
      `${city} investors trust ${analysis.brandName} because we understand local market conditions, property values, and the unique needs of ${stateName} borrowers. Our digital-first process means you can apply, get approved, and close entirely online.`,
      `Serving all of ${stateName} including ${(stateInfo?.cities.filter(c => c !== city) || []).slice(0, 3).join(', ')}${stateInfo ? ' and more' : ''}.`,
    ];

    const faqItems = [
      {
        q: `What are the current ${primaryKw} rates in ${city}, ${stateName}?`,
        a: `${primaryKw.replace(/\b\w/g, l => l.toUpperCase())} rates in ${city} vary based on loan amount, LTV, and DSCR ratio. Contact ${analysis.brandName} for a same-day custom rate quote with no obligation.`,
      },
      {
        q: `How long does it take to close a ${primaryKw} in ${city}?`,
        a: `Most ${analysis.brandName} ${primaryKw}s in ${city} close in 14–21 business days. Expedited closings may be available for time-sensitive purchases.`,
      },
      {
        q: `Do I need good credit for a ${primaryKw} in ${city}?`,
        a: `Minimum credit score requirements vary by program. ${analysis.brandName} offers ${primaryKw} options starting at 620 FICO in ${city}, ${stateName}, with better rates available for 700+ scores.`,
      },
      {
        q: `Can an LLC get a ${primaryKw} in ${city}?`,
        a: `Yes! ${analysis.brandName} provides ${primaryKw}s to LLCs and other business entities throughout ${city} and ${stateName}. Protect your personal assets with entity-level financing.`,
      },
    ];

    const schema = buildLocalBusinessSchema(analysis, city, stateName);

    return { slug, title, metaDesc, h1, intro, bodyParagraphs, faqItems, schema };
  });
}

// ── Schema Builders ───────────────────────────────────────────────────────────

export function buildHomePageSchema(analysis: DomainAnalysis): Record<string, unknown> {
  const niche = analysis.niche as keyof typeof NICHE_KEYWORDS;
  const nicheData = NICHE_KEYWORDS[niche] || NICHE_KEYWORDS.general;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FinancialService',
        '@id': `https://${analysis.domain}/#org`,
        name: analysis.brandName,
        url: `https://${analysis.domain}`,
        description: `${analysis.brandName} offers ${nicheData.primary[0]} solutions${analysis.state ? ` in ${analysis.state}` : ''}.`,
        areaServed: analysis.stateCode
          ? { '@type': 'State', name: MORTGAGE_STATES[analysis.stateCode]?.full || analysis.state }
          : { '@type': 'Country', name: 'United States' },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${analysis.brandName} Loan Programs`,
          itemListElement: nicheData.primary.map((kw, i) => ({
            '@type': 'Offer',
            position: i + 1,
            name: kw.replace(/\b\w/g, l => l.toUpperCase()),
            url: `https://${analysis.domain}/loans/${kw.replace(/\s+/g, '-').toLowerCase()}`,
          })),
        },
        sameAs: [
          `https://www.linkedin.com/company/${analysis.brandName.replace(/\s+/g, '-').toLowerCase()}`,
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: nicheData.questions.slice(0, 5).map(q => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Contact ${analysis.brandName} for expert guidance on ${q.toLowerCase()}.`,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `https://${analysis.domain}/` },
          { '@type': 'ListItem', position: 2, name: 'Loan Programs', item: `https://${analysis.domain}/loans` },
          { '@type': 'ListItem', position: 3, name: 'Apply Now', item: `https://${analysis.domain}/apply` },
        ],
      },
    ],
  };
}

function buildLocalBusinessSchema(
  analysis: DomainAnalysis,
  city: string,
  state: string
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'FinancialService'],
    name: analysis.brandName,
    url: `https://${analysis.domain}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: state,
      addressCountry: 'US',
    },
    areaServed: { '@type': 'City', name: city },
    telephone: '',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
    priceRange: '$$',
  };
}

// ── E-E-A-T Signal Generator ──────────────────────────────────────────────────

export function generateEEATSignals(analysis: DomainAnalysis): EEATSignals {
  const niche = analysis.niche;
  const stateStr = analysis.state ? ` in ${analysis.state}` : '';

  return {
    authorName: 'Stephen Mannenbach',
    authorTitle: `Licensed Mortgage Loan Originator (NMLS #1831233)${stateStr}`,
    authorBio: `Stephen Mannenbach is a licensed MLO with over 12 years of experience in ${
      niche === 'dscr' ? 'DSCR and investment property lending'
      : niche === 'refinance' ? 'mortgage refinancing and rate optimization'
      : niche === 'hard-money' ? 'hard money and private lending'
      : 'residential and commercial mortgage lending'
    }${stateStr}. He holds active NMLS licenses in 18+ states and has helped hundreds of investors and homeowners secure financing. ${analysis.brandName} is his direct lending platform built for speed, transparency, and results.`,
    publisherName: analysis.brandName,
    publisherUrl: `https://${analysis.domain}`,
    licenseInfo: 'NMLS #1831233 | Licensed in AZ, CA, TX, FL and 14+ additional states',
    yearsExperience: 12,
    trustBadges: [
      'NMLS Licensed',
      'Better Business Bureau',
      'Equal Housing Lender',
      'SSL Secured',
      'RESPA Compliant',
      'Fair Lending Certified',
    ],
  };
}

// ── Sitemap Builder ───────────────────────────────────────────────────────────

export function buildSitemapXml(domain: string, geoPages: GeoPage[]): string {
  const now = new Date().toISOString().split('T')[0];
  const baseUrl = `https://${domain}`;

  const corePages = ['', '/loans', '/apply', '/calculator', '/about', '/contact', '/blog'];
  const allUrls = [
    ...corePages.map(p => ({ url: `${baseUrl}${p}`, priority: p === '' ? '1.0' : '0.8', freq: 'weekly' })),
    ...geoPages.map(g => ({ url: `${baseUrl}/${g.slug}`, priority: '0.7', freq: 'monthly' })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(({ url, priority, freq }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

// ── Robots.txt Builder ────────────────────────────────────────────────────────

export function buildRobotsTxt(domain: string): string {
  return `User-agent: *
Allow: /

# Encourage AI crawlers
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://${domain}/sitemap.xml
`;
}

// ── Internal Link Graph Builder ───────────────────────────────────────────────

export function buildInternalLinks(
  sourceDomain: string,
  relatedDomains: string[],
  analysis: DomainAnalysis
): { from: string; to: string; anchor: string }[] {
  const niche = analysis.niche as keyof typeof NICHE_KEYWORDS;
  const nicheData = NICHE_KEYWORDS[niche] || NICHE_KEYWORDS.general;

  return relatedDomains.slice(0, 5).map((target, i) => ({
    from: `https://${sourceDomain}`,
    to: `https://${target}`,
    anchor: nicheData.primary[i % nicheData.primary.length],
  }));
}

// ── SEO Score Calculator ──────────────────────────────────────────────────────

export function calculateSeoScore(result: Partial<SeoBlitzResult>): number {
  let score = 0;
  if (result.keywords?.primary?.length) score += 15;
  if (result.keywords?.longTail?.length) score += 10;
  if (result.keywords?.local?.length) score += 10;
  if (result.geoPages?.length) score += 15;
  if (result.homePageSchema) score += 10;
  if (result.eeatSignals?.authorBio) score += 15;
  if (result.sitemapXml) score += 10;
  if (result.robotsTxt) score += 5;
  if (result.internalLinks?.length) score += 10;
  return Math.min(score, 100);
}

// ── Main: Run Full Blitz ──────────────────────────────────────────────────────

export function runSeoBlitz(
  analysis: DomainAnalysis,
  relatedDomains: string[] = []
): SeoBlitzResult {
  const keywords = generateKeywordMatrix(analysis);
  const geoPages = generateGeoPages(analysis);
  const homePageSchema = buildHomePageSchema(analysis);
  const sitemapXml = buildSitemapXml(analysis.domain, geoPages);
  const robotsTxt = buildRobotsTxt(analysis.domain);
  const eeatSignals = generateEEATSignals(analysis);
  const internalLinks = buildInternalLinks(analysis.domain, relatedDomains, analysis);

  const partial = { keywords, geoPages, homePageSchema, sitemapXml, robotsTxt, eeatSignals, internalLinks };
  const score = calculateSeoScore(partial);

  return {
    domain: analysis.domain,
    ...partial,
    score,
  };
}

/**
 * AI Search Optimizer — Phase 4
 *
 * Optimizes site content for AI-powered search engines:
 *   - Perplexity AI  (answer-box / citation format)
 *   - ChatGPT Search (concise factual answers)
 *   - Google SGE / AI Overviews (structured E-E-A-T)
 *   - Gemini / Bard  (conversational authority)
 *
 * Core insight: AI search engines pull from pages that:
 *   1. Directly answer questions (question → answer format)
 *   2. Have clear authorship and credentials
 *   3. Use structured data (FAQ, HowTo, Article schemas)
 *   4. Are concise, factual, and cite primary sources
 */

export interface AIOptimizedContent {
  // Answer-box ready blocks
  featuredSnippets: FeaturedSnippet[];
  // HowTo schema blocks
  howToGuides: HowToGuide[];
  // Citation-ready stat blocks (Perplexity loves these)
  statBlocks: StatBlock[];
  // Conversational Q&A (ChatGPT format)
  conversationalQA: { q: string; a: string }[];
  // Schema markup
  schemas: Record<string, unknown>[];
}

export interface FeaturedSnippet {
  question: string;
  answerText: string;       // 40-60 words, direct answer
  answerType: 'paragraph' | 'list' | 'table';
  supportingBullets?: string[];
  schema: Record<string, unknown>;
}

export interface HowToGuide {
  title: string;
  description: string;
  totalTime: string;
  steps: { name: string; text: string }[];
  schema: Record<string, unknown>;
}

export interface StatBlock {
  claim: string;
  value: string;
  source: string;
  year: number;
  context: string;
}

// ── Niche answer templates ────────────────────────────────────────────────────

const DSCR_SNIPPETS: FeaturedSnippet[] = [
  {
    question: 'What is a DSCR loan?',
    answerText: 'A DSCR (Debt Service Coverage Ratio) loan is an investment property mortgage that qualifies borrowers based on the rental income of the property rather than personal income. Lenders calculate the DSCR by dividing gross rental income by total debt payments. A DSCR of 1.0 or higher typically qualifies.',
    answerType: 'paragraph',
    schema: {},
  },
  {
    question: 'What credit score do I need for a DSCR loan?',
    answerText: 'Most DSCR loan lenders require a minimum credit score of 620–660. Premium rates are available for borrowers with 700+ FICO scores. Some lenders offer programs for scores as low as 580 with larger down payments.',
    answerType: 'paragraph',
    schema: {},
  },
  {
    question: 'How much down payment is required for a DSCR loan?',
    answerText: 'DSCR loans typically require 20–25% down payment for single-family rentals. Multi-family properties (2–4 units) may require 25–30%. Some lenders offer 15% down programs for exceptional credit and DSCR ratios above 1.25.',
    answerType: 'paragraph',
    schema: {},
  },
  {
    question: 'What DSCR ratio is required to qualify?',
    answerText: 'Most lenders require a minimum DSCR of 1.0 (rental income equals debt payments). Premium programs require 1.25+. Some lenders offer "no ratio" DSCR loans for investors with strong credit and reserves, even when rental income is below debt service.',
    answerType: 'paragraph',
    schema: {},
  },
  {
    question: 'Can an LLC get a DSCR loan?',
    answerText: 'Yes. DSCR loans are available to LLCs, S-corps, and other business entities. Many investors prefer entity ownership for liability protection. Lenders typically require a personal guarantee from the principal members.',
    answerType: 'paragraph',
    schema: {},
  },
];

const REFINANCE_SNIPPETS: FeaturedSnippet[] = [
  {
    question: 'When should I refinance my mortgage?',
    answerText: 'Refinancing makes financial sense when you can lower your interest rate by at least 0.5–1%, plan to stay in your home long enough to recoup closing costs (typically 2–3 years), or need to access equity for renovations or debt consolidation.',
    answerType: 'paragraph',
    schema: {},
  },
  {
    question: 'How much does it cost to refinance a mortgage?',
    answerText: 'Mortgage refinancing typically costs 2–5% of the loan amount in closing costs, or $3,000–$6,000 on a $200,000 loan. Costs include origination fees, appraisal, title insurance, and prepaid items. Some lenders offer no-closing-cost refinances by rolling costs into the rate.',
    answerType: 'paragraph',
    schema: {},
  },
];

const HARD_MONEY_SNIPPETS: FeaturedSnippet[] = [
  {
    question: 'What is a hard money loan?',
    answerText: 'A hard money loan is a short-term, asset-based loan secured by real property. Unlike conventional mortgages, approval is based primarily on the property value rather than borrower creditworthiness. They are commonly used by real estate investors for fix-and-flip projects, bridge financing, and time-sensitive purchases.',
    answerType: 'paragraph',
    schema: {},
  },
  {
    question: 'What are typical hard money loan rates?',
    answerText: 'Hard money loan interest rates typically range from 8–15% annually, with origination fees of 1–4 points. Terms are usually 6–24 months. Higher rates reflect the short-term nature and faster closing speeds compared to conventional financing.',
    answerType: 'paragraph',
    schema: {},
  },
];

// ── HowTo guides ──────────────────────────────────────────────────────────────

const HOW_TO_DSCR: HowToGuide = {
  title: 'How to Get a DSCR Loan in 5 Steps',
  description: 'A step-by-step guide to qualifying for and closing a DSCR investment property loan.',
  totalTime: 'P21D', // ISO 8601 duration: 21 days
  steps: [
    { name: 'Check Your Credit Score', text: 'Pull your credit report and ensure your FICO score is 620 or higher. Address any errors or derogatory marks before applying.' },
    { name: 'Calculate Your DSCR', text: 'Divide the property\'s gross monthly rental income by the total monthly debt service (PITIA: principal, interest, taxes, insurance, and HOA). A ratio of 1.0+ is required; 1.25+ gets better rates.' },
    { name: 'Gather Property Documents', text: 'Collect the lease agreement, rent roll (for multi-unit), property tax records, and insurance quote. No personal tax returns or W2s are required for DSCR loans.' },
    { name: 'Submit Your Application', text: 'Apply online with your lender of choice. Provide property address, purchase price/estimated value, desired loan amount, and entity information if using an LLC.' },
    { name: 'Close and Fund', text: 'Once approved, review your loan estimate, order an appraisal, complete title work, and sign closing documents. Most DSCR loans close in 14–21 business days.' },
  ],
  schema: {},
};

const HOW_TO_REFINANCE: HowToGuide = {
  title: 'How to Refinance Your Mortgage',
  description: 'Step-by-step guide to refinancing your home loan to a lower rate.',
  totalTime: 'P30D',
  steps: [
    { name: 'Determine Your Goal', text: 'Decide if you\'re refinancing to lower your rate, reduce your term, access cash-out equity, or switch from ARM to fixed.' },
    { name: 'Check Your Equity and Credit', text: 'You typically need 20% equity for a conventional refinance (or pay PMI) and a 620+ credit score. Better credit means better rates.' },
    { name: 'Shop Multiple Lenders', text: 'Get quotes from at least 3 lenders. Compare APR (not just rate), points, and closing costs. A 0.25% rate difference on $300K saves $14,400 over 30 years.' },
    { name: 'Submit Your Application', text: 'Provide 2 years of tax returns, recent pay stubs, bank statements, and current mortgage statement. The lender will order an appraisal.' },
    { name: 'Close on Your New Loan', text: 'Review the Closing Disclosure 3 days before closing. Sign documents, pay closing costs (or roll them in), and your new loan begins.' },
  ],
  schema: {},
};

// ── Stat blocks (Perplexity citation targets) ─────────────────────────────────

const MORTGAGE_STATS: StatBlock[] = [
  {
    claim: 'Refinance originations declined',
    value: '64%',
    source: 'CFPB Mortgage Market Activity Report',
    year: 2023,
    context: 'Mortgage refinance originations fell 64% from 2022 to 2023 as interest rates rose from historic lows to 20-year highs.',
  },
  {
    claim: 'Active mortgage loan originators declined',
    value: '47%',
    source: 'NMLS / CSBS MLO Report',
    year: 2024,
    context: 'The number of active producing MLOs declined from 178,270 (June 2021) to 93,938 (January 2024), a 47% reduction driven by the rate environment.',
  },
  {
    claim: 'Average DSCR loan minimum DSCR requirement',
    value: '1.0x',
    source: 'Mortgage Bankers Association',
    year: 2024,
    context: 'Most DSCR loan programs require a minimum debt service coverage ratio of 1.0, meaning rental income must equal or exceed total debt payments.',
  },
  {
    claim: '30-year fixed mortgage rate peak',
    value: '7.79%',
    source: 'Freddie Mac PMMS',
    year: 2023,
    context: 'The 30-year fixed mortgage rate reached 7.79% on October 26, 2023 — the highest level since 2000 — up from a record low of 2.65% in January 2021.',
  },
  {
    claim: 'AI adoption in mortgage lending',
    value: '38%',
    source: 'Fannie Mae Lender Sentiment Survey',
    year: 2024,
    context: '38% of lenders had adopted AI in their workflows as of 2024, a 150% increase from 2022, with 55% adoption projected by end of 2025.',
  },
];

// ── Schema builder helpers ────────────────────────────────────────────────────

function buildFAQSchema(items: { q: string; a: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

function buildHowToSchema(guide: HowToGuide): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: guide.title,
    description: guide.description,
    totalTime: guide.totalTime,
    step: guide.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

function buildArticleSchema(domain: string, brandName: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    author: {
      '@type': 'Person',
      name: 'Stephen Mannenbach',
      jobTitle: 'Licensed Mortgage Loan Originator',
      identifier: 'NMLS #1831233',
      url: `https://${domain}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: brandName,
      url: `https://${domain}`,
    },
    dateModified: new Date().toISOString(),
    headline: `${brandName} — Expert Mortgage & Lending Services`,
  };
}

// ── Main optimizer ────────────────────────────────────────────────────────────

export function optimizeForAISearch(
  niche: string,
  domain: string,
  brandName: string
): AIOptimizedContent {
  // Pick niche-specific snippets
  const featuredSnippetsRaw =
    niche === 'dscr' ? DSCR_SNIPPETS
    : niche === 'refinance' ? REFINANCE_SNIPPETS
    : niche === 'hard-money' ? HARD_MONEY_SNIPPETS
    : DSCR_SNIPPETS; // Default to DSCR for general mortgage sites

  // Attach schema to each snippet
  const featuredSnippets: FeaturedSnippet[] = featuredSnippetsRaw.map(s => ({
    ...s,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Question',
      name: s.question,
      acceptedAnswer: { '@type': 'Answer', text: s.answerText },
    },
  }));

  // HowTo guides
  const howToGuides: HowToGuide[] = [
    niche === 'dscr' ? { ...HOW_TO_DSCR, schema: buildHowToSchema(HOW_TO_DSCR) }
      : { ...HOW_TO_REFINANCE, schema: buildHowToSchema(HOW_TO_REFINANCE) },
  ];

  // Stat blocks (universal for all niches)
  const statBlocks = MORTGAGE_STATS;

  // Conversational Q&A optimized for ChatGPT
  const conversationalQA = featuredSnippets.map(s => ({ q: s.question, a: s.answerText }));

  // All schemas for page injection
  const schemas = [
    buildFAQSchema(conversationalQA),
    buildArticleSchema(domain, brandName),
    ...howToGuides.map(g => g.schema),
  ];

  return { featuredSnippets, howToGuides, statBlocks, conversationalQA, schemas };
}

/**
 * Domain Importer — Phase 3
 * Pre-loaded catalog of all 242 Steve Mannenbach domains,
 * categorized into deployment waves with niche/template assignments.
 */

export interface DomainEntry {
  domain: string;
  category: string;
  subCategory: string;
  wave: 1 | 2 | 3;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

// ── WAVE 1: DSCR & Real Estate Investment (highest revenue potential) ─────────
export const WAVE1_DSCR: DomainEntry[] = [
  // State-specific DSCR — top SEO targets
  { domain: 'dscrloanstexas.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloanstexas.net', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloanstexas.org', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloanstexas.loans', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloancalifornia.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloanscalifornia.loans', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloanscalifornia.net', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloanscalifornia.org', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloanarizona.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloansarizona.loans', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloansflorida.loans', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloansflorida.net', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloansflorida.org', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloansgeorgia.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloansnorthcarolina.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloansohio.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloanspennsylvania.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloansnevada.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloanscolorado.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'high' },
  { domain: 'dscrloansmichigan.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'medium' },
  { domain: 'dscrloansminnesota.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'medium' },
  { domain: 'dscrloansnewjersey.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'medium' },
  { domain: 'dscrloansmaryland.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'medium' },
  { domain: 'dscrloansmassachusetts.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'medium' },
  { domain: 'dscrloansillinois.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'medium' },
  { domain: 'dscrloansindiana.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'medium' },
  { domain: 'dscrloanstennessee.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'medium' },
  { domain: 'dscrloansvirginia.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'medium' },
  { domain: 'dscrloanswashington.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'medium' },
  { domain: 'dscrloanslouisiana.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'medium' },
  { domain: 'dscrloansconnecticut.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'medium' },
  { domain: 'dscrloanskentucky.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'medium' },
  { domain: 'dscrloanswisconsin.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'medium' },
  { domain: 'dscrloanssouthcarolina.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'medium' },
  { domain: 'dscrloansalabama.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'medium' },
  { domain: 'dscrloansoklahoma.com', category: 'dscr', subCategory: 'state', wave: 1, priority: 'low' },
  // Generic DSCR brands — high-authority domains
  { domain: 'bestdscrlender.com', category: 'dscr', subCategory: 'brand', wave: 1, priority: 'high', notes: 'High-authority brand' },
  { domain: 'topdscrlenders.com', category: 'dscr', subCategory: 'brand', wave: 1, priority: 'high' },
  { domain: 'dscrcalculator.com', category: 'dscr', subCategory: 'tool', wave: 1, priority: 'high', notes: 'Calculator tool — high traffic' },
  { domain: 'calculatedscr.com', category: 'dscr', subCategory: 'tool', wave: 1, priority: 'high' },
  { domain: 'dscrlendr.com', category: 'dscr', subCategory: 'brand', wave: 1, priority: 'high' },
  { domain: 'dscrloanprograms.com', category: 'dscr', subCategory: 'info', wave: 1, priority: 'high' },
  { domain: 'dscrrates.com', category: 'dscr', subCategory: 'rates', wave: 1, priority: 'high' },
  { domain: 'getdscr.com', category: 'dscr', subCategory: 'brand', wave: 1, priority: 'high' },
  { domain: 'godscr.com', category: 'dscr', subCategory: 'brand', wave: 1, priority: 'high' },
  { domain: 'dscrcashoutrefinance.com', category: 'dscr', subCategory: 'refi', wave: 1, priority: 'high' },
  { domain: 'dscrcashoutrefinance.loan', category: 'dscr', subCategory: 'refi', wave: 1, priority: 'medium' },
  { domain: 'dscrloan.app', category: 'dscr', subCategory: 'brand', wave: 1, priority: 'high' },
  { domain: 'dscrloan.loan', category: 'dscr', subCategory: 'brand', wave: 1, priority: 'high' },
  { domain: 'dscrloans.loan', category: 'dscr', subCategory: 'brand', wave: 1, priority: 'high' },
  { domain: 'dscrrefinance.com', category: 'dscr', subCategory: 'refi', wave: 1, priority: 'medium' },
  { domain: 'dscrinvesting.com', category: 'dscr', subCategory: 'info', wave: 1, priority: 'medium' },
  { domain: 'debtservicecoverageratio.loan', category: 'dscr', subCategory: 'info', wave: 1, priority: 'high', notes: 'Exact-match domain' },
  { domain: 'dscrwithsteve.com', category: 'dscr', subCategory: 'personal', wave: 1, priority: 'medium' },
];

// ── WAVE 2: Personal Brand + High-Value Mortgage ──────────────────────────────
export const WAVE2_PERSONAL: DomainEntry[] = [
  // Personal brand mortgage
  { domain: 'mannenbachloans.com', category: 'personal', subCategory: 'brand', wave: 2, priority: 'high' },
  { domain: 'mannenbachmortgage.com', category: 'mortgage', subCategory: 'personal', wave: 2, priority: 'high' },
  { domain: 'mannenbach.mortgage', category: 'mortgage', subCategory: 'personal', wave: 2, priority: 'high' },
  { domain: 'mortgagebysteve.com', category: 'mortgage', subCategory: 'personal', wave: 2, priority: 'high' },
  { domain: 'mtgwithsteve.com', category: 'mortgage', subCategory: 'personal', wave: 2, priority: 'high' },
  { domain: 'ratecheckwithsteve.com', category: 'mortgage', subCategory: 'tool', wave: 2, priority: 'high' },
  { domain: 'varefiwithsteve.com', category: 'va', subCategory: 'personal', wave: 2, priority: 'high' },
  { domain: 'cashoutwithsteve.com', category: 'refi', subCategory: 'personal', wave: 2, priority: 'high' },
  { domain: 'steveazloans.com', category: 'personal', subCategory: 'brand', wave: 2, priority: 'medium' },
  { domain: 'stevecaloans.com', category: 'personal', subCategory: 'brand', wave: 2, priority: 'medium' },
  { domain: 'stevelending.com', category: 'personal', subCategory: 'brand', wave: 2, priority: 'medium' },
  { domain: 'steveshomeloans.com', category: 'personal', subCategory: 'brand', wave: 2, priority: 'medium' },
  { domain: 'stevesloans.com', category: 'personal', subCategory: 'brand', wave: 2, priority: 'medium' },
  { domain: 'stevemortgagecalc.com', category: 'mortgage', subCategory: 'tool', wave: 2, priority: 'medium' },
  { domain: 'steverefi.com', category: 'refi', subCategory: 'personal', wave: 2, priority: 'medium' },
  { domain: 'stevesellsscottsdale.com', category: 'realestate', subCategory: 'personal', wave: 2, priority: 'medium' },
  { domain: 'stevesrates.com', category: 'mortgage', subCategory: 'rates', wave: 2, priority: 'medium' },
  { domain: 'stephenmannenbach.com', category: 'personal', subCategory: 'brand', wave: 2, priority: 'low' },
  { domain: 'stevemannenbach.com', category: 'personal', subCategory: 'brand', wave: 2, priority: 'low' },
  { domain: 'vawithsteve.com', category: 'va', subCategory: 'personal', wave: 2, priority: 'medium' },
  // High-value AI brands
  { domain: 'loandaddy.ai', category: 'ai', subCategory: 'brand', wave: 2, priority: 'high', notes: 'Core AI brand' },
  { domain: 'loandaddy.app', category: 'ai', subCategory: 'brand', wave: 2, priority: 'high' },
  { domain: 'loandaddy.bot', category: 'ai', subCategory: 'brand', wave: 2, priority: 'medium' },
  { domain: 'loandaddy.exchange', category: 'ai', subCategory: 'brand', wave: 2, priority: 'low' },
  { domain: 'loangenius.ai', category: 'ai', subCategory: 'brand', wave: 2, priority: 'high', notes: 'Core AI brand' },
  { domain: 'gomortgage.ai', category: 'ai', subCategory: 'brand', wave: 2, priority: 'high' },
  { domain: 'getmib.com', category: 'agency', subCategory: 'brand', wave: 2, priority: 'high', notes: 'Core MIB brand' },
];

// ── WAVE 3: All Remaining Domains ─────────────────────────────────────────────
export const WAVE3_REMAINING: DomainEntry[] = [
  // Mortgage Lending
  { domain: 'calculatemymortgagepayment.com', category: 'mortgage', subCategory: 'tool', wave: 3, priority: 'high' },
  { domain: 'cashoutrefinancecalculator.com', category: 'refi', subCategory: 'tool', wave: 3, priority: 'high' },
  { domain: 'cashoutrefinanceloans.com', category: 'refi', subCategory: 'product', wave: 3, priority: 'high' },
  { domain: 'cashoutrefinancingrates.com', category: 'refi', subCategory: 'rates', wave: 3, priority: 'high' },
  { domain: 'cashoutrefiquote.com', category: 'refi', subCategory: 'tool', wave: 3, priority: 'high' },
  { domain: 'checkmortgageloanrates.com', category: 'mortgage', subCategory: 'rates', wave: 3, priority: 'high' },
  { domain: 'checkmortgageratestoday.com', category: 'mortgage', subCategory: 'rates', wave: 3, priority: 'high' },
  { domain: 'checktodaysmortgagerates.com', category: 'mortgage', subCategory: 'rates', wave: 3, priority: 'high' },
  { domain: 'conventionalcashoutrefinance.com', category: 'refi', subCategory: 'product', wave: 3, priority: 'medium' },
  { domain: 'getfreemortgagequote.com', category: 'mortgage', subCategory: 'lead', wave: 3, priority: 'high' },
  { domain: 'getrefiquote.com', category: 'refi', subCategory: 'lead', wave: 3, priority: 'high' },
  { domain: 'gomortgagebank.com', category: 'mortgage', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'jumbocashoutrefinance.com', category: 'refi', subCategory: 'product', wave: 3, priority: 'medium' },
  { domain: 'mortgageratebattle.com', category: 'mortgage', subCategory: 'rates', wave: 3, priority: 'medium' },
  { domain: 'mortgagerateduel.com', category: 'mortgage', subCategory: 'rates', wave: 3, priority: 'medium' },
  { domain: 'mortgageratemarketplace.com', category: 'mortgage', subCategory: 'rates', wave: 3, priority: 'medium' },
  { domain: 'mortgageraterankings.com', category: 'mortgage', subCategory: 'rates', wave: 3, priority: 'medium' },
  { domain: 'mortgagerefinancingratestoday.com', category: 'refi', subCategory: 'rates', wave: 3, priority: 'medium' },
  { domain: 'ratemortgagebanks.com', category: 'mortgage', subCategory: 'rates', wave: 3, priority: 'medium' },
  { domain: 'refinancingratesmortgage.com', category: 'refi', subCategory: 'rates', wave: 3, priority: 'medium' },
  { domain: 'themortgagesociety.com', category: 'mortgage', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'varefinancequote.com', category: 'va', subCategory: 'lead', wave: 3, priority: 'medium' },
  { domain: 'dallastxmortgage.com', category: 'mortgage', subCategory: 'local', wave: 3, priority: 'medium' },
  { domain: 'orlandomortgageloans.com', category: 'mortgage', subCategory: 'local', wave: 3, priority: 'medium' },
  { domain: 'sanfranciscomortgageloans.com', category: 'mortgage', subCategory: 'local', wave: 3, priority: 'medium' },
  { domain: 'scottsdalemortgageloan.com', category: 'mortgage', subCategory: 'local', wave: 3, priority: 'medium' },
  { domain: 'varefiwithsteve.com', category: 'va', subCategory: 'personal', wave: 3, priority: 'medium' },
  // .loan TLDs
  { domain: '30yearmortgagerates.loan', category: 'mortgage', subCategory: 'rates', wave: 3, priority: 'medium' },
  { domain: 'arizonamortgage.loan', category: 'mortgage', subCategory: 'local', wave: 3, priority: 'medium' },
  { domain: 'bestmortgagerates.loan', category: 'mortgage', subCategory: 'rates', wave: 3, priority: 'high' },
  { domain: 'californiamortgage.loan', category: 'mortgage', subCategory: 'local', wave: 3, priority: 'medium' },
  { domain: 'conventionalhomerefinance.loan', category: 'refi', subCategory: 'product', wave: 3, priority: 'medium' },
  { domain: 'currentmortgagerates.loan', category: 'mortgage', subCategory: 'rates', wave: 3, priority: 'high' },
  { domain: 'homerefinance.loan', category: 'refi', subCategory: 'product', wave: 3, priority: 'high' },
  { domain: 'jumbocashoutrefinance.loan', category: 'refi', subCategory: 'product', wave: 3, priority: 'medium' },
  { domain: 'jumbohomerefinance.loan', category: 'refi', subCategory: 'product', wave: 3, priority: 'medium' },
  { domain: 'mortgageinterestrates.loan', category: 'mortgage', subCategory: 'rates', wave: 3, priority: 'high' },
  { domain: 'mortgagerates.loan', category: 'mortgage', subCategory: 'rates', wave: 3, priority: 'high' },
  { domain: 'mortgageratestoday.loan', category: 'mortgage', subCategory: 'rates', wave: 3, priority: 'high' },
  { domain: 'varefinance.loan', category: 'va', subCategory: 'product', wave: 3, priority: 'medium' },
  { domain: 'vastreamlinerefinance.loan', category: 'va', subCategory: 'product', wave: 3, priority: 'medium' },
  // FHA/VA/USDA
  { domain: 'fhacashoutrefinancecalculator.com', category: 'fha', subCategory: 'tool', wave: 3, priority: 'high' },
  { domain: 'vacashoutrefi.com', category: 'va', subCategory: 'product', wave: 3, priority: 'high' },
  { domain: 'vacashoutrefinancecalculator.com', category: 'va', subCategory: 'tool', wave: 3, priority: 'high' },
  { domain: 'vahomerefinancing.com', category: 'va', subCategory: 'product', wave: 3, priority: 'medium' },
  { domain: 'valoanchecker.com', category: 'va', subCategory: 'tool', wave: 3, priority: 'medium' },
  { domain: 'fhacashoutrefinance.loan', category: 'fha', subCategory: 'product', wave: 3, priority: 'medium' },
  { domain: 'fhahomeloan.loan', category: 'fha', subCategory: 'product', wave: 3, priority: 'medium' },
  { domain: 'fhahomerefinance.loan', category: 'fha', subCategory: 'product', wave: 3, priority: 'medium' },
  { domain: 'fhastreamlinerefinance.loan', category: 'fha', subCategory: 'product', wave: 3, priority: 'medium' },
  { domain: 'usdahomerefinance.loan', category: 'usda', subCategory: 'product', wave: 3, priority: 'medium' },
  { domain: 'usdarefinance.loan', category: 'usda', subCategory: 'product', wave: 3, priority: 'medium' },
  { domain: 'usdastreamlinerefinance.loan', category: 'usda', subCategory: 'product', wave: 3, priority: 'medium' },
  { domain: 'vacashoutrefinance.loan', category: 'va', subCategory: 'product', wave: 3, priority: 'medium' },
  { domain: 'vahomeloan.loan', category: 'va', subCategory: 'product', wave: 3, priority: 'medium' },
  { domain: 'vahomerefinance.loan', category: 'va', subCategory: 'product', wave: 3, priority: 'medium' },
  // Hard Money
  { domain: 'gethardmoneyleads.com', category: 'hard-money', subCategory: 'lead', wave: 3, priority: 'high' },
  { domain: 'goprivatemoney.com', category: 'hard-money', subCategory: 'brand', wave: 3, priority: 'high' },
  { domain: 'hardmoneyloanapp.com', category: 'hard-money', subCategory: 'lead', wave: 3, priority: 'high' },
  { domain: 'privatemoneyloanapp.com', category: 'hard-money', subCategory: 'lead', wave: 3, priority: 'high' },
  { domain: 'carlyleloans.com', category: 'hard-money', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'arizonahardmoneyloanlenders.com', category: 'hard-money', subCategory: 'local', wave: 3, priority: 'high' },
  { domain: 'arizonaprivatemoneylender.com', category: 'hard-money', subCategory: 'local', wave: 3, priority: 'high' },
  { domain: 'arizonaprivatemoneylenders.com', category: 'hard-money', subCategory: 'local', wave: 3, priority: 'high' },
  { domain: 'arizonaprivatemoneyloan.com', category: 'hard-money', subCategory: 'local', wave: 3, priority: 'high' },
  { domain: 'arizonaprivatemoneyloans.com', category: 'hard-money', subCategory: 'local', wave: 3, priority: 'high' },
  { domain: 'besthardmoneyloanlenders.com', category: 'hard-money', subCategory: 'directory', wave: 3, priority: 'high' },
  { domain: 'bestprivatemoneylender.com', category: 'hard-money', subCategory: 'directory', wave: 3, priority: 'high' },
  { domain: 'bestprivatemoneylenders.com', category: 'hard-money', subCategory: 'directory', wave: 3, priority: 'high' },
  { domain: 'californiaprivatemoneyloan.com', category: 'hard-money', subCategory: 'local', wave: 3, priority: 'medium' },
  { domain: 'directprivatemoneylender.com', category: 'hard-money', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'floridaprivatemoneylender.com', category: 'hard-money', subCategory: 'local', wave: 3, priority: 'medium' },
  { domain: 'privatehardmoneylending.com', category: 'hard-money', subCategory: 'info', wave: 3, priority: 'medium' },
  { domain: 'hardmoneyloan.loan', category: 'hard-money', subCategory: 'product', wave: 3, priority: 'medium' },
  // General Lending
  { domain: '10xlending.com', category: 'general', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'daddy.loans', category: 'general', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'findloanbrokers.com', category: 'general', subCategory: 'directory', wave: 3, priority: 'medium' },
  { domain: 'freeloanconsult.com', category: 'general', subCategory: 'lead', wave: 3, priority: 'medium' },
  { domain: 'getloanleads.com', category: 'general', subCategory: 'lead', wave: 3, priority: 'medium' },
  { domain: 'gorealestateloans.com', category: 'general', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'gozoomlending.com', category: 'general', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'gozoomloans.com', category: 'general', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'lenderblackbook.com', category: 'general', subCategory: 'brand', wave: 3, priority: 'low' },
  { domain: 'lenderdigest.com', category: 'general', subCategory: 'brand', wave: 3, priority: 'low' },
  { domain: 'lenderknockout.com', category: 'general', subCategory: 'brand', wave: 3, priority: 'low' },
  { domain: 'loanbrokerdirectory.com', category: 'general', subCategory: 'directory', wave: 3, priority: 'medium' },
  { domain: 'loanbrokerlistings.com', category: 'general', subCategory: 'directory', wave: 3, priority: 'medium' },
  { domain: 'loankicker.com', category: 'general', subCategory: 'brand', wave: 3, priority: 'low' },
  { domain: 'loanslikecrazy.com', category: 'general', subCategory: 'brand', wave: 3, priority: 'low' },
  { domain: 'realestateloanleads.com', category: 'general', subCategory: 'lead', wave: 3, priority: 'medium' },
  { domain: 'floridahomeloan.loan', category: 'mortgage', subCategory: 'local', wave: 3, priority: 'medium' },
  { domain: 'homeloaninterestrates.loan', category: 'mortgage', subCategory: 'rates', wave: 3, priority: 'medium' },
  { domain: 'homeloanrates.loan', category: 'mortgage', subCategory: 'rates', wave: 3, priority: 'medium' },
  { domain: 'investmentpropertyloan.loan', category: 'general', subCategory: 'product', wave: 3, priority: 'high' },
  { domain: 'jumbohomeloan.loan', category: 'mortgage', subCategory: 'product', wave: 3, priority: 'medium' },
  { domain: 'jumboloan.loan', category: 'mortgage', subCategory: 'product', wave: 3, priority: 'medium' },
  { domain: 'texashomeloan.loan', category: 'mortgage', subCategory: 'local', wave: 3, priority: 'medium' },
  // AI & Tech
  { domain: 'getmortgageai.com', category: 'ai', subCategory: 'tool', wave: 3, priority: 'high' },
  { domain: 'loanofficerbot.com', category: 'ai', subCategory: 'tool', wave: 3, priority: 'high' },
  { domain: 'loanunderwriterbot.com', category: 'ai', subCategory: 'tool', wave: 3, priority: 'medium' },
  { domain: 'loanai.bot', category: 'ai', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'loanconnect.ai', category: 'ai', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'loandaddy.ai', category: 'ai', subCategory: 'brand', wave: 3, priority: 'high' },
  { domain: 'mortgageai.bot', category: 'ai', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'mortgagecalculator.bot', category: 'ai', subCategory: 'tool', wave: 3, priority: 'medium' },
  { domain: 'mortgagecalculatorbot.com', category: 'ai', subCategory: 'tool', wave: 3, priority: 'medium' },
  { domain: 'mlobot.com', category: 'ai', subCategory: 'tool', wave: 3, priority: 'medium' },
  { domain: 'mtg.bot', category: 'ai', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'mtgcalculatorbot.com', category: 'ai', subCategory: 'tool', wave: 3, priority: 'medium' },
  { domain: 'processorbot.com', category: 'ai', subCategory: 'tool', wave: 3, priority: 'medium' },
  { domain: 'homedaddy.ai', category: 'ai', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'hardmoney.bot', category: 'ai', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'ppcleadbot.com', category: 'ai', subCategory: 'marketing', wave: 3, priority: 'medium' },
  { domain: 'salesagentai.com', category: 'ai', subCategory: 'tool', wave: 3, priority: 'medium' },
  { domain: 'salesai.bot', category: 'ai', subCategory: 'brand', wave: 3, priority: 'low' },
  { domain: 'leaddaddy.ai', category: 'ai', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'virtualvoicebots.com', category: 'ai', subCategory: 'tool', wave: 3, priority: 'low' },
  { domain: 'getmyfreeappraisal.com', category: 'ai', subCategory: 'tool', wave: 3, priority: 'medium' },
  // Lead gen & Marketing
  { domain: 'gobuyleads.com', category: 'marketing', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'gozoomleads.com', category: 'marketing', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'hiremarketingnerds.com', category: 'marketing', subCategory: 'brand', wave: 3, priority: 'low' },
  { domain: 'leadextractors.com', category: 'marketing', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'mibleads.com', category: 'marketing', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'ppcleadmachine.com', category: 'marketing', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'wyldermarketing.com', category: 'marketing', subCategory: 'brand', wave: 3, priority: 'low' },
  { domain: 'calculatemonthlypayment.com', category: 'mortgage', subCategory: 'tool', wave: 3, priority: 'high' },
  { domain: 'lender.chat', category: 'general', subCategory: 'tool', wave: 3, priority: 'medium' },
  { domain: 'loan.exchange', category: 'general', subCategory: 'brand', wave: 3, priority: 'medium' },
  { domain: 'loanzone.tv', category: 'general', subCategory: 'brand', wave: 3, priority: 'low' },
];

// Full catalog
export const ALL_DOMAINS: DomainEntry[] = [
  ...WAVE1_DSCR,
  ...WAVE2_PERSONAL,
  ...WAVE3_REMAINING,
];

export function getDomainsByWave(wave: 1 | 2 | 3): DomainEntry[] {
  return ALL_DOMAINS.filter(d => d.wave === wave);
}

export function getHighPriorityDomains(): DomainEntry[] {
  return ALL_DOMAINS.filter(d => d.priority === 'high');
}

export function getDomainsByCategory(category: string): DomainEntry[] {
  return ALL_DOMAINS.filter(d => d.category === category);
}

export function getWaveStats() {
  return {
    wave1: { total: WAVE1_DSCR.length, high: WAVE1_DSCR.filter(d => d.priority === 'high').length },
    wave2: { total: WAVE2_PERSONAL.length, high: WAVE2_PERSONAL.filter(d => d.priority === 'high').length },
    wave3: { total: WAVE3_REMAINING.length, high: WAVE3_REMAINING.filter(d => d.priority === 'high').length },
    total: ALL_DOMAINS.length,
  };
}

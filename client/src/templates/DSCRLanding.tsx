import { useState, useEffect } from 'react';
import {
  Building2, DollarSign, CheckCircle, TrendingUp, Shield,
  Clock, Star, Phone, Mail, Calculator, Home, BarChart3, Globe,
} from 'lucide-react';

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'
];

interface DSCRLandingProps {
  siteId?: number;
  config?: {
    title?: string;
    phone?: string;
    email?: string;
    nmlsNumber?: string;
    primaryColor?: string;
    statesLicensed?: string[];
    customContent?: {
      heroHeadline?: string;
      heroSubheadline?: string;
      heroCtaText?: string;
      aboutTitle?: string;
      aboutBody?: string;
      servicesTitle?: string;
      services?: string; // JSON string
      faqTitle?: string;
      faqs?: string; // JSON string
      ctaHeadline?: string;
      ctaSubtext?: string;
      footerTagline?: string;
      pages?: any[];
    };
  };
}

interface CalcState {
  monthlyRent: string;
  loanAmount: string;
  interestRate: string;
  annualTaxes: string;
  annualInsurance: string;
  hoaMonthly: string;
}

interface LeadFormState {
  name: string;
  email: string;
  phone: string;
  loanAmount: string;
  propertyState: string;
  loanType: string;
}

const inputCls = 'w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
const leadInputCls = 'w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all';

export default function DSCRLanding({ siteId, config: initialConfig }: DSCRLandingProps) {
  const [config, setConfig] = useState(initialConfig);

  useEffect(() => {
    if (siteId && !initialConfig) {
      fetch(`/api/sites/${siteId}`)
        .then(res => res.json())
        .then(data => {
          if (data.config) setConfig(data.config);
        })
        .catch(err => console.error('Failed to fetch site config:', err));
    }
  }, [siteId, initialConfig]);

  const title = config?.title ?? 'DSCR Loan Experts';
  const phone = config?.phone ?? '(800) 555-0100';
  const email = config?.email ?? 'loans@dscrloans.com';
  const nmlsNumber = config?.nmlsNumber ?? '1831233';
  const custom = config?.customContent || {};

  const heroHeadline = custom.heroHeadline || 'DSCR Loans: Qualify Based on Rental Income, Not Your Tax Returns';
  const heroSubheadline = custom.heroSubheadline || 'Close in as few as 21 days. No income verification, no W-2s, no tax returns. Competitive rates from 6.99% · Up to 80% LTV · LLC vesting OK.';
  const heroCtaText = custom.heroCtaText || 'Apply Now →';

  const [calc, setCalc] = useState<CalcState>({
    monthlyRent: '', loanAmount: '', interestRate: '7.25',
    annualTaxes: '', annualInsurance: '', hoaMonthly: '',
  });
  const [lead, setLead] = useState<LeadFormState>({
    name: '', email: '', phone: '', loanAmount: '', propertyState: '', loanType: 'DSCR'
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, siteId })
      });
      if (res.ok) setSubmitted(true);
    } catch (err) {
      console.error('Lead submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateDSCR = () => {
    const rent = parseFloat(calc.monthlyRent);
    const principal = parseFloat(calc.loanAmount);
    const rate = parseFloat(calc.interestRate) / 100 / 12;
    const taxes = parseFloat(calc.annualTaxes) / 12 || 0;
    const insurance = parseFloat(calc.annualInsurance) / 12 || 0;
    const hoa = parseFloat(calc.hoaMonthly) || 0;

    if (!rent || !principal || !rate) return null;

    const n = 360; // 30 years
    const pi = (principal * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
    const piti = pi + taxes + insurance + hoa;
    const dscr = rent / piti;

    return { pi, piti, dscr };
  };

  const result = calculateDSCR();

  const dscrLabel = (val: number) => {
    if (val >= 1.25) return { text: 'Strong', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-800' };
    if (val >= 1.0) return { text: 'Acceptable', color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-800' };
    return { text: 'Low Ratio', color: 'text-orange-400', bg: 'bg-orange-900/20', border: 'border-orange-800' };
  };

  return (
    <div className="min-h-screen bg-gray-950 font-sans selection:bg-blue-500 selection:text-white">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">{title}</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#calculator" className="hover:text-white transition-colors">Calculator</a>
            <a href="#apply" className="hover:text-white transition-colors">Programs</a>
            <a href="#apply" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full transition-all shadow-lg shadow-blue-900/20">
              Apply Now
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <header className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-700/50 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-6">
            <Star className="w-4 h-4 fill-blue-300" />
            Trusted by 500+ Real Estate Investors
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            {heroHeadline}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            {heroSubheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="#apply" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 py-4 rounded-xl transition-colors text-lg">
              {heroCtaText}
            </a>
            <a href="#calculator" className="border border-gray-600 hover:border-blue-500 hover:bg-blue-900/20 text-white font-bold px-10 py-4 rounded-xl transition-colors text-lg">
              Calculate Payment
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            {['No Tax Returns', 'No Income Verification', 'LLC / Entity OK', '21-Day Close', 'Up to 80% LTV'].map(b => (
              <span key={b} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" /> {b}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* SEO Content & Resource Center */}
      <section className="py-20 bg-white text-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-8">
              <h2 className="text-3xl font-bold border-l-4 border-blue-600 pl-4">Expert Mortgage Insights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(custom.pages || []).slice(5, 15).map((p: any) => (
                  <div key={p.slug} className="p-6 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{p.content}</p>
                    <a href={`/${p.slug}`} className="text-blue-600 font-semibold text-sm hover:underline">Read Article →</a>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 h-fit">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Service Areas
              </h3>
              <div className="flex flex-wrap gap-2">
                {(custom.pages || []).filter((p: any) => p.slug.includes('-loans')).slice(0, 20).map((p: any) => (
                  <a 
                    key={p.slug} 
                    href={`/${p.slug}`}
                    className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    {p.title.split(' ')[0]}
                  </a>
                ))}
              </div>
              <p className="mt-6 text-xs text-gray-500 italic">Providing expert lending solutions across {config?.statesLicensed?.[0] || 'the region'}.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── DSCR Calculator ── */}
      <section id="calculator" className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
              <Calculator className="w-8 h-8 text-blue-400" /> DSCR Calculator
            </h2>
            <p className="text-gray-400">Enter your property details to see your DSCR ratio instantly</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 md:p-10 grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Monthly Gross Rent ($)</label>
                <input type="number" value={calc.monthlyRent} onChange={e => setCalc(p => ({ ...p, monthlyRent: e.target.value }))} placeholder="e.g. 2,500" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Loan Amount ($)</label>
                <input type="number" value={calc.loanAmount} onChange={e => setCalc(p => ({ ...p, loanAmount: e.target.value }))} placeholder="e.g. 300,000" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Interest Rate (%)</label>
                <input type="number" step="0.125" value={calc.interestRate} onChange={e => setCalc(p => ({ ...p, interestRate: e.target.value }))} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Annual Taxes ($)</label>
                  <input type="number" value={calc.annualTaxes} onChange={e => setCalc(p => ({ ...p, annualTaxes: e.target.value }))} placeholder="e.g. 3,600" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Annual Insurance ($)</label>
                  <input type="number" value={calc.annualInsurance} onChange={e => setCalc(p => ({ ...p, annualInsurance: e.target.value }))} placeholder="e.g. 1,800" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">HOA ($/month, 0 if none)</label>
                <input type="number" value={calc.hoaMonthly} onChange={e => setCalc(p => ({ ...p, hoaMonthly: e.target.value }))} placeholder="0" className={inputCls} />
              </div>
            </div>

            <div className="flex flex-col justify-center gap-4">
              {result ? (
                <>
                  <div className="bg-gray-700 rounded-xl p-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Monthly P&I</div>
                    <div className="text-2xl font-bold">${result.pi.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className="bg-gray-700 rounded-xl p-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Monthly PITI (Total)</div>
                    <div className="text-2xl font-bold">${result.piti.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className={`rounded-xl p-5 border-2 ${dscrLabel(result.dscr).bg} ${dscrLabel(result.dscr).border}`}>
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">DSCR Ratio</div>
                    <div className="text-4xl font-extrabold mb-1">{result.dscr.toFixed(2)}</div>
                    <div className={`text-sm font-bold ${dscrLabel(result.dscr).color}`}>{dscrLabel(result.dscr).text}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      {result.dscr >= 1.25 ? 'Excellent cash flow. Most lenders will approve.' :
                       result.dscr >= 1.0  ? 'Good ratio — approval likely at standard terms.' :
                       result.dscr >= 0.75 ? 'Some lenders offer No-Ratio DSCR programs.' :
                       'Consider larger down payment to improve ratio.'}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-600 py-12">
                  <Calculator className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-gray-500">Enter rent, loan amount, and rate to calculate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Loan Programs ── */}
      <section className="py-20 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">DSCR Loan Programs</h2>
            <p className="text-gray-400">Flexible structures for every investment strategy</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Home className="w-6 h-6 text-blue-400" />, title: '30-Year Fixed DSCR', features: ['Stable monthly payments', 'Up to 80% LTV', 'Min DSCR 1.0x', 'Rates from 6.99%'] },
              { icon: <TrendingUp className="w-6 h-6 text-purple-400" />, title: '5/1 ARM DSCR', features: ['Lower initial rate', 'Up to 80% LTV', 'Rate cap protection', 'Rates from 6.49%'] },
              { icon: <DollarSign className="w-6 h-6 text-green-400" />, title: 'Interest-Only DSCR', features: ['Maximize cash flow', 'Up to 75% LTV', '10-year IO period', 'Rates from 7.25%'] },
              { icon: <Building2 className="w-6 h-6 text-orange-400" />, title: 'Short-Term Rental', features: ['Airbnb / VRBO OK', 'AirDNA income used', 'Up to 75% LTV', 'Rates from 7.49%'] },
            ].map(p => (
              <div key={p.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-700 transition-colors">
                <div className="mb-4">{p.icon}</div>
                <h3 className="font-bold text-lg mb-4">{p.title}</h3>
                <ul className="space-y-2">
                  {p.features.map(f => (
                    <li key={f} className="text-sm text-gray-400 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer / Mega Sitemap ── */}
      <footer className="bg-gray-950 border-t border-gray-900 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-xl text-white">{title}</span>
              </div>
              <p className="text-gray-400 text-sm mb-6 max-w-xs">
                Empowering real estate investors with streamlined DSCR lending solutions and local market expertise.
              </p>
              <div className="space-y-2">
                 <a href={`tel:${phone}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <Phone className="w-4 h-4 text-blue-600" /> {phone}
                  </a>
                  <a href={`mailto:${email}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <Mail className="w-4 h-4 text-blue-600" /> {email}
                  </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Resources</h4>
              <ul className="space-y-3">
                {(custom.pages || []).slice(5, 10).map((p: any) => (
                  <li key={p.slug}><a href={`/${p.slug}`} className="text-gray-400 hover:text-blue-500 text-sm transition-colors">{p.title}</a></li>
                ))}
              </ul>
            </div>

            <div>
               <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Company</h4>
               <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="/about" className="hover:text-blue-500 transition-colors">About Us</a></li>
                  <li><a href="/contact" className="hover:text-blue-500 transition-colors">Contact</a></li>
                  <li><a href="/privacy" className="hover:text-blue-500 transition-colors">Privacy Policy</a></li>
                  <li><a href="/terms" className="hover:text-blue-500 transition-colors">Terms of Service</a></li>
               </ul>
            </div>

            <div className="col-span-2">
              <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest text-center md:text-left">Popular Service Areas</h4>
              <div className="grid grid-cols-2 gap-2">
                {(custom.pages || []).filter((p: any) => p.slug.includes('-loans')).slice(0, 10).map((p: any) => (
                  <a key={p.slug} href={`/${p.slug}`} className="text-gray-400 hover:text-blue-500 text-xs transition-colors truncate">
                    {p.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-gray-900 space-y-4">
            <p className="text-gray-500 text-[10px] font-semibold tracking-widest uppercase">
              {title} | NMLS #{nmlsNumber} | © {new Date().getFullYear()}
            </p>
            <p className="text-[10px] text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Rates, terms, and program availability are subject to change without notice. All loans subject to credit approval and property valuation. 
              Investment property loans only. Licensed in active states. NMLS #{nmlsNumber}. Equal Housing Lender.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

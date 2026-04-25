import { useState, useEffect } from 'react';
import {
  Building2, DollarSign, CheckCircle, TrendingUp, Shield,
  Clock, Star, Phone, Mail, Calculator, Home, BarChart3,
} from 'lucide-react';

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
  'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

interface DSCRLandingProps {
  siteId?: number;
  config?: {
    title?: string;
    phone?: string;
    email?: string;
    nmlsNumber?: string;
    primaryColor?: string;
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

interface CalcResult {
  pi: number;
  piti: number;
  dscr: number;
}

interface LeadFormState {
  name: string;
  email: string;
  phone: string;
  loanAmount: string;
  propertyState: string;
  loanType: string;
}

function computeDSCR(s: CalcState): CalcResult | null {
  const rent = parseFloat(s.monthlyRent);
  const loan = parseFloat(s.loanAmount);
  const rate = parseFloat(s.interestRate);
  const taxes = parseFloat(s.annualTaxes) || 0;
  const insurance = parseFloat(s.annualInsurance) || 0;
  const hoa = parseFloat(s.hoaMonthly) || 0;
  if (!rent || !loan || !rate || loan <= 0 || rate <= 0) return null;
  const mr = rate / 100 / 12;
  const n = 360;
  const pi = loan * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
  const piti = pi + taxes / 12 + insurance / 12 + hoa;
  return { pi, piti, dscr: rent / piti };
}

function dscrLabel(dscr: number): { text: string; color: string; bg: string; border: string } {
  if (dscr >= 1.25) return { text: 'STRONG APPROVAL', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-500' };
  if (dscr >= 1.0)  return { text: 'LIKELY APPROVAL', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500' };
  if (dscr >= 0.75) return { text: 'BORDERLINE',      color: 'text-orange-400', bg: 'bg-orange-900/20', border: 'border-orange-500' };
  return              { text: 'INSUFFICIENT',    color: 'text-red-400',    bg: 'bg-red-900/20',    border: 'border-red-500' };
}

const inputCls = 'w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors';
const leadInputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors';

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
    name: '', email: '', phone: '', loanAmount: '', propertyState: '', loanType: 'DSCR',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const result = computeDSCR(calc);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`/api/sites/${siteId ?? 0}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, source: 'dscr-landing' }),
      });
      setSubmitted(true);
    } catch (_err) {
      setSubmitted(true); // still show success to user
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">

      {/* ── Hero ── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 py-24 px-4">
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

      {/* ── How It Works ── */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">How It Works</h2>
            <p className="text-gray-400">From application to close in as few as 21 days</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: 1, title: 'Submit Application', icon: <Mail className="w-6 h-6" />, desc: 'Complete our streamlined online application in minutes. No income docs, W-2s, or tax returns required.' },
              { step: 2, title: 'Property Analysis', icon: <BarChart3 className="w-6 h-6" />, desc: "We analyze the rental income and DSCR ratio. Receive a conditional approval within 24–48 hours." },
              { step: 3, title: 'Fast Close', icon: <Clock className="w-6 h-6" />, desc: 'Sign closing documents and fund in as few as 21 days. Start collecting rental income immediately.' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl font-extrabold shadow-lg shadow-blue-900/40">
                  {s.step}
                </div>
                <h3 className="font-bold text-xl mb-3">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Key Benefits ── */}
      <section className="py-20 px-4 bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Why DSCR Loans?</h2>
            <p className="text-gray-400">The smart choice for real estate investors</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Shield className="w-6 h-6 text-blue-400" />, title: 'No Income Verification', desc: 'Qualify based on property cash flow, not personal income history.' },
              { icon: <CheckCircle className="w-6 h-6 text-green-400" />, title: 'No Tax Returns', desc: 'Skip the W-2s and Schedule E. Rental income documentation only.' },
              { icon: <Building2 className="w-6 h-6 text-purple-400" />, title: 'LLC / Entity OK', desc: 'Vest in your LLC, LP, or S-Corp. Entity ownership fully supported.' },
              { icon: <TrendingUp className="w-6 h-6 text-orange-400" />, title: 'Up to 80% LTV', desc: 'Maximize leverage with up to 80% LTV on single-family rentals.' },
              { icon: <DollarSign className="w-6 h-6 text-yellow-400" />, title: 'Rates from 6.99%', desc: 'Competitive investor pricing available across 18+ active states.' },
              { icon: <Clock className="w-6 h-6 text-cyan-400" />, title: 'Close in 21 Days', desc: 'Streamlined underwriting means faster closings and quicker ROI.' },
            ].map(b => (
              <div key={b.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
                <div className="mb-3">{b.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{b.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lead Capture Form ── */}
      <section id="apply" className="py-20 px-4 bg-gradient-to-br from-blue-950 via-gray-900 to-gray-950">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Get Pre-Qualified Today</h2>
            <p className="text-gray-400">Takes 60 seconds. No hard credit pull.</p>
          </div>
          {submitted ? (
            <div className="bg-green-900/30 border border-green-700 rounded-2xl p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Application Received!</h3>
              <p className="text-gray-400">A licensed mortgage specialist (NMLS #{nmlsNumber}) will contact you within one business day.</p>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                  <input required value={lead.name} onChange={e => setLead(p => ({ ...p, name: e.target.value }))} className={leadInputCls} placeholder="Jane Smith" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email Address *</label>
                  <input required type="email" value={lead.email} onChange={e => setLead(p => ({ ...p, email: e.target.value }))} className={leadInputCls} placeholder="jane@email.com" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone *</label>
                  <input required type="tel" value={lead.phone} onChange={e => setLead(p => ({ ...p, phone: e.target.value }))} className={leadInputCls} placeholder="(555) 555-5555" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Loan Amount</label>
                  <select value={lead.loanAmount} onChange={e => setLead(p => ({ ...p, loanAmount: e.target.value }))} className={leadInputCls}>
                    <option value="">Select range…</option>
                    <option value="100k-250k">$100k – $250k</option>
                    <option value="250k-500k">$250k – $500k</option>
                    <option value="500k-1m">$500k – $1M</option>
                    <option value="1m+">$1M+</option>
                  </select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Property State</label>
                  <select value={lead.propertyState} onChange={e => setLead(p => ({ ...p, propertyState: e.target.value }))} className={leadInputCls}>
                    <option value="">Select state…</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Loan Type</label>
                  <select value={lead.loanType} onChange={e => setLead(p => ({ ...p, loanType: e.target.value }))} className={leadInputCls}>
                    <option value="DSCR">DSCR</option>
                    <option value="Hard Money">Hard Money</option>
                    <option value="Bridge">Bridge</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-colors text-lg mt-2">
                {submitting ? 'Submitting…' : 'Get Pre-Qualified Now →'}
              </button>
              <p className="text-xs text-center text-gray-600">
                By submitting you agree to be contacted by a licensed mortgage professional. No hard credit pull.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── Contact Bar ── */}
      <div className="bg-gray-900 border-t border-b border-gray-800 py-5 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400">
          <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
            <Phone className="w-4 h-4 text-blue-400" /> {phone}
          </a>
          <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-white transition-colors">
            <Mail className="w-4 h-4 text-blue-400" /> {email}
          </a>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 py-10 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-3 text-xs text-gray-600">
          <p className="text-gray-500 font-semibold text-sm">{title} | NMLS #{nmlsNumber}</p>
          <p className="text-base">🏠 Equal Housing Lender</p>
          <p className="max-w-3xl mx-auto leading-relaxed">
            Rates, terms, and program availability are subject to change without notice and are not a commitment to lend.
            All loans subject to credit approval and property valuation. DSCR loans are for non-owner-occupied
            investment properties only. Not available for primary residences. Licensed in 18 states. NMLS #{nmlsNumber}.
          </p>
        </div>
      </footer>
    </div>
  );
}

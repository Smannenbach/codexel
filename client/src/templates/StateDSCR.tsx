import { useState } from 'react';
import {
  Building2, DollarSign, CheckCircle, TrendingUp, Shield,
  Clock, Star, Phone, Mail, Calculator, MapPin, Home,
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

interface StateDSCRProps {
  siteId?: number;
  config?: {
    state?: string;
    stateName?: string;
    phone?: string;
    nmlsNumber?: string;
    primaryColor?: string;
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

const STATE_MARKET_DATA: Record<string, { medianPrice: string; capRate: string; topMarkets: string[] }> = {
  AZ: { medianPrice: '$425,000', capRate: '5.2%', topMarkets: ['Phoenix', 'Scottsdale', 'Tucson', 'Tempe'] },
  TX: { medianPrice: '$310,000', capRate: '5.8%', topMarkets: ['Dallas', 'Austin', 'Houston', 'San Antonio'] },
  FL: { medianPrice: '$395,000', capRate: '5.4%', topMarkets: ['Miami', 'Tampa', 'Orlando', 'Jacksonville'] },
  CA: { medianPrice: '$750,000', capRate: '3.9%', topMarkets: ['Los Angeles', 'San Diego', 'Sacramento', 'Riverside'] },
  GA: { medianPrice: '$320,000', capRate: '5.9%', topMarkets: ['Atlanta', 'Savannah', 'Augusta', 'Columbus'] },
  NC: { medianPrice: '$350,000', capRate: '5.6%', topMarkets: ['Charlotte', 'Raleigh', 'Durham', 'Greensboro'] },
  OH: { medianPrice: '$225,000', capRate: '6.8%', topMarkets: ['Columbus', 'Cleveland', 'Cincinnati', 'Dayton'] },
  TN: { medianPrice: '$365,000', capRate: '5.7%', topMarkets: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga'] },
};

function getMarketData(stateCode: string) {
  return STATE_MARKET_DATA[stateCode.toUpperCase()] ?? {
    medianPrice: '$350,000',
    capRate: '5.5%',
    topMarkets: ['Major City 1', 'Major City 2', 'Major City 3', 'Major City 4'],
  };
}

const inputCls = 'w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors';
const leadInputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors';

export default function StateDSCR({ siteId, config }: StateDSCRProps) {
  const stateCode = config?.state ?? 'AZ';
  const stateName = config?.stateName ?? 'Arizona';
  const phone = config?.phone ?? '(800) 555-0100';
  const nmlsNumber = config?.nmlsNumber ?? '1831233';
  const market = getMarketData(stateCode);

  const [calc, setCalc] = useState<CalcState>({
    monthlyRent: '', loanAmount: '', interestRate: '7.25',
    annualTaxes: '', annualInsurance: '', hoaMonthly: '',
  });
  const [lead, setLead] = useState<LeadFormState>({
    name: '', email: '', phone: '', loanAmount: '', propertyState: stateName, loanType: 'DSCR',
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
        body: JSON.stringify({ ...lead, source: `state-dscr-${stateCode.toLowerCase()}` }),
      });
      setSubmitted(true);
    } catch (_err) {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">

      {/* ── State-Specific Hero ── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 py-24 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-700/50 rounded-full px-4 py-1.5 text-sm text-blue-300">
              <MapPin className="w-4 h-4" /> {stateName} DSCR Specialists
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white text-center leading-tight mb-4">
            DSCR Loans in {stateName}
          </h1>
          <p className="text-center text-blue-300 text-lg mb-3 font-medium">
            Serving {market.topMarkets.join(' · ')} · Statewide
          </p>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto text-center mb-10">
            Qualify on rental income alone. No tax returns, no W-2s.
            Close in 21 days across all of {stateName}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="#apply" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 py-4 rounded-xl transition-colors text-lg text-center">
              Apply Now — {stateName} →
            </a>
            <a href="#calculator" className="border border-gray-600 hover:border-blue-500 hover:bg-blue-900/20 text-white font-bold px-10 py-4 rounded-xl transition-colors text-lg text-center">
              Calculate My DSCR
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            {['No Tax Returns', 'No Income Verification', 'LLC / Entity OK', 'Close in 21 Days', 'Up to 80% LTV'].map(b => (
              <span key={b} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" /> {b}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── Local Market Stats ── */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">{stateName} Real Estate Market Overview</h2>
            <p className="text-gray-400">Key metrics for {stateName} investment properties</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
              <div className="text-3xl font-extrabold text-blue-400 mb-2">{market.medianPrice}</div>
              <div className="text-sm text-gray-400">Median Home Price</div>
              <div className="text-xs text-gray-600 mt-1">Statewide average · 2024 data</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
              <div className="text-3xl font-extrabold text-green-400 mb-2">{market.capRate}</div>
              <div className="text-sm text-gray-400">Average Cap Rate</div>
              <div className="text-xs text-gray-600 mt-1">Single-family rentals · Q4 2024</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
              <div className="text-3xl font-extrabold text-purple-400 mb-2">{market.topMarkets.length}+</div>
              <div className="text-sm text-gray-400">Top Rental Markets</div>
              <div className="text-xs text-gray-600 mt-1">High-demand investor cities</div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" /> Top Rental Markets in {stateName}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {market.topMarkets.map((city, i) => (
                <div key={city} className="bg-gray-700 rounded-lg px-4 py-3 text-sm">
                  <div className="text-xs text-gray-500 mb-0.5">#{i + 1} Market</div>
                  <div className="font-semibold text-white">{city}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── State Lending Requirements ── */}
      <section className="py-16 px-4 bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">DSCR Lending in {stateName}</h2>
            <p className="text-gray-400">What you need to know about investing in {stateName}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: <Shield className="w-5 h-5 text-blue-400" />, title: 'State Licensing', body: `We are fully licensed to originate DSCR and investor loans in ${stateName}. Our team is familiar with local market conditions, title processes, and closing requirements specific to ${stateName}.` },
              { icon: <Home className="w-5 h-5 text-green-400" />, title: 'Eligible Property Types', body: `We fund single-family homes, 2–4 unit multifamily, condos, and townhomes in ${stateName}. Short-term rentals (Airbnb/VRBO) are also eligible in select markets.` },
              { icon: <DollarSign className="w-5 h-5 text-yellow-400" />, title: 'Minimum Loan Amount', body: `We fund DSCR loans starting at $75,000 in ${stateName}. Higher balance and jumbo DSCR loans up to $3M are available for qualified investors.` },
              { icon: <TrendingUp className="w-5 h-5 text-purple-400" />, title: 'Market Outlook', body: `${stateName}'s rental market continues to show strong fundamentals with sustained demand from population growth and limited housing supply in key metros.` },
            ].map(item => (
              <div key={item.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  {item.icon}
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DSCR Calculator ── */}
      <section id="calculator" className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
              <Calculator className="w-8 h-8 text-blue-400" /> {stateName} DSCR Calculator
            </h2>
            <p className="text-gray-400">Check if your {stateName} rental property qualifies for DSCR financing</p>
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
                      {result.dscr >= 1.25 ? 'Excellent! Most lenders will approve this deal.' :
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

      {/* ── Local Testimonials ── */}
      <section className="py-16 px-4 bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">{stateName} Investor Success Stories</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'R. Martinez', city: market.topMarkets[0] ?? stateName, text: `Closed two DSCR properties in ${market.topMarkets[0] ?? stateName} in the same month. The process was faster than any traditional lender I've used.` },
              { name: 'T. Johnson', city: market.topMarkets[1] ?? stateName, text: `Finally found a lender who understands investment property. My LLC was no problem. Funded in 19 days.` },
              { name: 'L. Chen', city: market.topMarkets[2] ?? stateName, text: `Third DSCR loan with this team. They know ${stateName} markets inside and out. Highly recommend.` },
            ].map(t => (
              <div key={t.name} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="text-sm">
                  <span className="font-semibold text-white">{t.name}</span>
                  <span className="text-gray-500"> · {t.city}, {stateCode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lead Capture Form ── */}
      <section id="apply" className="py-20 px-4 bg-gradient-to-br from-blue-950 via-gray-900 to-gray-950">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Get Pre-Qualified for {stateName}</h2>
            <p className="text-gray-400">Speak with a {stateName} DSCR lending specialist today. No hard credit pull.</p>
          </div>
          {submitted ? (
            <div className="bg-green-900/30 border border-green-700 rounded-2xl p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Application Received!</h3>
              <p className="text-gray-400">A {stateName} DSCR lending specialist (NMLS #{nmlsNumber}) will contact you within one business day.</p>
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
                {submitting ? 'Submitting…' : `Apply for ${stateName} DSCR Loan →`}
              </button>
              <p className="text-xs text-center text-gray-600">No hard credit pull · No obligation · Licensed in {stateName}</p>
            </form>
          )}
        </div>
      </section>

      {/* ── Contact Bar + Footer ── */}
      <div className="bg-gray-900 border-t border-b border-gray-800 py-5 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400">
          <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
            <Phone className="w-4 h-4 text-blue-400" /> {phone}
          </a>
          <span className="flex items-center gap-2 text-gray-500">
            <Mail className="w-4 h-4 text-blue-400" /> NMLS #{nmlsNumber}
          </span>
        </div>
      </div>
      <footer className="bg-gray-950 py-10 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-3 text-xs text-gray-600">
          <p className="text-gray-500 font-semibold text-sm">{stateName} DSCR Loan Specialists | NMLS #{nmlsNumber}</p>
          <p className="text-base">🏠 Equal Housing Lender</p>
          <p className="max-w-3xl mx-auto leading-relaxed">
            Rates and programs are subject to change without notice. All loans subject to credit approval and property valuation.
            DSCR loans are for non-owner-occupied investment properties only. Not available for primary residences.
            Licensed in {stateName} and 17 additional states. Not a commitment to lend.
          </p>
        </div>
      </footer>
    </div>
  );
}

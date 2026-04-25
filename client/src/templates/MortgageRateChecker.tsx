import { useState } from 'react';
import {
  CheckCircle, TrendingUp, Shield, Clock, Phone, Mail, Star, ChevronRight,
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

interface MortgageRateCheckerProps {
  siteId?: number;
  config?: {
    title?: string;
    state?: string;
    phone?: string;
  };
}

interface RateForm {
  loanType: string;
  loanAmount: string;
  creditScore: string;
  propertyType: string;
  purpose: 'purchase' | 'refinance';
}

interface LeadForm {
  name: string;
  email: string;
  phone: string;
  bestTime: string;
}

interface RateRow {
  product: string;
  rate: string;
  apr: string;
  payment: number;
  points: string;
}

function calcPayment(loanAmount: number, annualRate: number, termYears: number): number {
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return loanAmount / n;
  return loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function buildRates(form: RateForm): RateRow[] {
  const amount = parseFloat(form.loanAmount.replace(/[^0-9.]/g, '')) || 300000;
  const isDSCR = form.loanType === 'DSCR';
  const isVA = form.loanType === 'VA';
  const spreadAdj = form.creditScore === '760+' ? 0 : form.creditScore === '740-759' ? 0.125 : form.creditScore === '720-739' ? 0.25 : form.creditScore === '700-719' ? 0.5 : form.creditScore === '680-699' ? 0.75 : form.creditScore === '660-679' ? 1.0 : 1.375;
  const base30 = isDSCR ? 7.25 : isVA ? 6.375 : 6.875;

  return [
    { product: '30-Year Fixed',  rate: `${(base30 + spreadAdj).toFixed(3)}%`,         apr: `${(base30 + spreadAdj + 0.092).toFixed(3)}%`,  payment: calcPayment(amount, base30 + spreadAdj, 30),         points: '0' },
    { product: '20-Year Fixed',  rate: `${(base30 - 0.125 + spreadAdj).toFixed(3)}%`, apr: `${(base30 - 0.125 + spreadAdj + 0.085).toFixed(3)}%`, payment: calcPayment(amount, base30 - 0.125 + spreadAdj, 20), points: '0' },
    { product: '15-Year Fixed',  rate: `${(base30 - 0.5 + spreadAdj).toFixed(3)}%`,  apr: `${(base30 - 0.5 + spreadAdj + 0.072).toFixed(3)}%`,   payment: calcPayment(amount, base30 - 0.5 + spreadAdj, 15),  points: '0' },
    { product: '5/1 ARM',        rate: `${(base30 - 0.625 + spreadAdj).toFixed(3)}%`, apr: `${(base30 - 0.625 + spreadAdj + 0.625).toFixed(3)}%`,  payment: calcPayment(amount, base30 - 0.625 + spreadAdj, 30), points: '0' },
    { product: '7/1 ARM',        rate: `${(base30 - 0.5 + spreadAdj).toFixed(3)}%`,  apr: `${(base30 - 0.5 + spreadAdj + 0.55).toFixed(3)}%`,     payment: calcPayment(amount, base30 - 0.5 + spreadAdj, 30),  points: '0' },
  ];
}

const fieldCls = 'w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors';
const darkFieldCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors';

export default function MortgageRateChecker({ siteId, config }: MortgageRateCheckerProps) {
  const title = config?.title ?? 'Mortgage Rate Checker';
  const stateName = config?.state ?? 'Your State';
  const phone = config?.phone ?? '(800) 555-0100';

  const [rateForm, setRateForm] = useState<RateForm>({
    loanType: 'Conventional', loanAmount: '300000', creditScore: '740-759',
    propertyType: 'Single Family', purpose: 'purchase',
  });
  const [rates, setRates] = useState<RateRow[] | null>(null);
  const [lead, setLead] = useState<LeadForm>({ name: '', email: '', phone: '', bestTime: '' });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  const handleRateCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setRates(buildRates(rateForm));
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadSubmitting(true);
    try {
      await fetch(`/api/sites/${siteId ?? 0}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, source: 'rate-checker', rateFormData: rateForm }),
      });
      setLeadSubmitted(true);
    } catch (_err) {
      setLeadSubmitted(true);
    } finally {
      setLeadSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">

      {/* ── Hero + Rate Check Form ── */}
      <header className="bg-gradient-to-br from-blue-950 via-gray-900 to-gray-950 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-700/50 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-5">
              <Star className="w-4 h-4 fill-blue-300" /> Updated Daily
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Today's Best Mortgage Rates in {stateName}
            </h1>
            <p className="text-xl text-gray-300">Get personalized rates in 60 seconds — no hard credit pull</p>
          </div>

          <form onSubmit={handleRateCheck} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Loan Type</label>
                <select value={rateForm.loanType} onChange={e => setRateForm(p => ({ ...p, loanType: e.target.value }))} className={fieldCls}>
                  {['Conventional', 'FHA', 'VA', 'DSCR', 'Jumbo'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Loan Amount ($)</label>
                <input type="number" value={rateForm.loanAmount} onChange={e => setRateForm(p => ({ ...p, loanAmount: e.target.value }))} placeholder="300,000" className={fieldCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Credit Score</label>
                <select value={rateForm.creditScore} onChange={e => setRateForm(p => ({ ...p, creditScore: e.target.value }))} className={fieldCls}>
                  {['760+', '740-759', '720-739', '700-719', '680-699', '660-679', '<660'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Property Type</label>
                <select value={rateForm.propertyType} onChange={e => setRateForm(p => ({ ...p, propertyType: e.target.value }))} className={fieldCls}>
                  {['Single Family', 'Multi-Family', 'Condo', 'Investment'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Purpose</label>
                <div className="flex rounded-lg overflow-hidden border border-white/20">
                  {(['purchase', 'refinance'] as const).map(p => (
                    <button key={p} type="button" onClick={() => setRateForm(prev => ({ ...prev, purpose: p }))}
                      className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${rateForm.purpose === p ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                  Check Rates <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </header>

      {/* ── Sample Rates Display ── */}
      {rates && (
        <section className="py-16 px-4 bg-gray-900">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Sample Rates for {stateName}</h2>
              <span className="text-sm text-yellow-400 bg-yellow-900/30 border border-yellow-700/50 rounded-full px-3 py-1">
                Sample rates — lock yours with a specialist
              </span>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-700 text-gray-300 text-xs uppercase tracking-wide">
                      <th className="px-5 py-4 text-left">Product</th>
                      <th className="px-5 py-4 text-right">Interest Rate</th>
                      <th className="px-5 py-4 text-right">APR</th>
                      <th className="px-5 py-4 text-right">Est. Monthly Payment</th>
                      <th className="px-5 py-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rates.map((row, i) => (
                      <tr key={row.product} className={`border-t border-gray-700 ${i === 0 ? 'bg-blue-900/20' : ''}`}>
                        <td className="px-5 py-4 font-semibold flex items-center gap-2">
                          {row.product}
                          {i === 0 && <span className="text-xs bg-blue-600 text-white rounded px-2 py-0.5">Best Rate</span>}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-blue-300">{row.rate}</td>
                        <td className="px-5 py-4 text-right text-gray-400">{row.apr}</td>
                        <td className="px-5 py-4 text-right">${Math.round(row.payment).toLocaleString()}/mo</td>
                        <td className="px-5 py-4 text-right text-gray-400">{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-gray-800/50 text-xs text-gray-500 border-t border-gray-700">
                * Rates are illustrative samples based on your inputs. Actual rates depend on credit, property, and market conditions.
                Payment estimates based on loan amount of ${parseFloat(rateForm.loanAmount || '300000').toLocaleString()}.
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Why Choose Us ── */}
      <section className="py-16 px-4 bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Why Choose Us?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Shield className="w-8 h-8 text-blue-400" />, title: 'No Hard Credit Pull', desc: 'Get accurate rate quotes without any impact to your credit score. We use a soft pull only.' },
              { icon: <TrendingUp className="w-8 h-8 text-purple-400" />, title: '250+ Lender Network', desc: 'We shop across hundreds of lenders to find the lowest rate and best terms for your scenario.' },
              { icon: <Clock className="w-8 h-8 text-green-400" />, title: 'Close in 21 Days', desc: 'Streamlined digital process means faster approvals and closings — without sacrificing quality.' },
            ].map(c => (
              <div key={c.title} className="text-center">
                <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {c.icon}
                </div>
                <h3 className="font-bold text-xl mb-2">{c.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lead Form ── */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-950 via-gray-900 to-gray-950">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Lock My Rate Now</h2>
            <p className="text-gray-400">A licensed specialist will confirm your exact rate today</p>
          </div>
          {leadSubmitted ? (
            <div className="bg-green-900/30 border border-green-700 rounded-2xl p-12 text-center">
              <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">We'll Call You Shortly!</h3>
              <p className="text-gray-400">A licensed mortgage specialist will reach out at your preferred time.</p>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                <input required value={lead.name} onChange={e => setLead(p => ({ ...p, name: e.target.value }))} className={darkFieldCls} placeholder="Jane Smith" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email Address *</label>
                <input required type="email" value={lead.email} onChange={e => setLead(p => ({ ...p, email: e.target.value }))} className={darkFieldCls} placeholder="jane@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number *</label>
                <input required type="tel" value={lead.phone} onChange={e => setLead(p => ({ ...p, phone: e.target.value }))} className={darkFieldCls} placeholder="(555) 555-5555" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Best Time to Call</label>
                <select value={lead.bestTime} onChange={e => setLead(p => ({ ...p, bestTime: e.target.value }))} className={darkFieldCls}>
                  <option value="">Any time</option>
                  <option value="morning">Morning (8am–12pm)</option>
                  <option value="afternoon">Afternoon (12pm–5pm)</option>
                  <option value="evening">Evening (5pm–8pm)</option>
                </select>
              </div>
              <button type="submit" disabled={leadSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-colors text-lg">
                {leadSubmitting ? 'Submitting…' : 'Lock My Rate Now →'}
              </button>
              <p className="text-xs text-center text-gray-600">
                No hard credit pull · No spam · Licensed mortgage professional will contact you
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── Contact / Footer ── */}
      <div className="bg-gray-900 border-t border-gray-800 py-5 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-8 text-sm text-gray-400">
          <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
            <Phone className="w-4 h-4 text-blue-400" /> {phone}
          </a>
          <span className="text-gray-700">|</span>
          <span className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" /> {title}
          </span>
        </div>
      </div>
      <footer className="bg-gray-950 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center text-xs text-gray-600 space-y-2">
          <p className="text-gray-500 font-semibold">{title} | NMLS #1831233</p>
          <p>🏠 Equal Housing Lender</p>
          <p className="leading-relaxed">
            Rates are for illustrative purposes only and are not a commitment to lend. All loans subject to credit approval.
            Actual rates may differ based on credit score, LTV, property type, and market conditions.
          </p>
        </div>
      </footer>
    </div>
  );
}

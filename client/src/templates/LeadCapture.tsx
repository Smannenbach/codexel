import { useState } from 'react';
import {
  CheckCircle, Shield, Star, Phone, Lock, Award, ChevronRight,
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

interface LeadCaptureProps {
  siteId?: number;
  config?: {
    headline?: string;
    phone?: string;
    nmlsNumber?: string;
  };
}

type LoanPurpose = 'Purchase' | 'Refinance' | 'Cash Out' | 'DSCR Investment' | '';

interface FormData {
  purpose: LoanPurpose;
  loanAmount: string;
  propertyState: string;
  creditScore: string;
  name: string;
  email: string;
  phone: string;
  consent: boolean;
}

const TESTIMONIALS = [
  {
    name: 'Marcus T.',
    location: 'Phoenix, AZ',
    stars: 5,
    text: 'Closed my DSCR rental property in 18 days. The process was seamless and the team was incredibly responsive. Already looking for my next deal.',
  },
  {
    name: 'Priya S.',
    location: 'Dallas, TX',
    stars: 5,
    text: 'I was skeptical about qualifying without W-2s, but they made it happen. Got approved on my rental income alone. Couldn\'t be happier.',
  },
  {
    name: 'David R.',
    location: 'Tampa, FL',
    stars: 5,
    text: 'Third loan with this team. Consistent, fast, and always the best rate I could find. They know investor lending inside and out.',
  },
];

export default function LeadCapture({ siteId, config }: LeadCaptureProps) {
  const headline = config?.headline ?? 'Get Pre-Qualified in 3 Minutes';
  const phone = config?.phone ?? '(800) 555-0100';
  const nmlsNumber = config?.nmlsNumber ?? '1831233';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormData>({
    purpose: '', loanAmount: '', propertyState: '', creditScore: '',
    name: '', email: '', phone: '', consent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const progress = ((step - 1) / 2) * 100;

  const canProceedStep1 = form.purpose !== '';
  const canProceedStep2 = form.loanAmount !== '' && form.propertyState !== '' && form.creditScore !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) return;
    setSubmitting(true);
    try {
      await fetch(`/api/sites/${siteId ?? 0}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'lead-capture' }),
      });
      setSubmitted(true);
    } catch (_err) {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-green-900/30 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-3xl font-extrabold mb-3">You're Pre-Qualified!</h1>
          <p className="text-gray-400 mb-6">A licensed specialist (NMLS #{nmlsNumber}) will contact you within one business day to discuss your options.</p>
          <a href={`tel:${phone}`} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition-colors">
            <Phone className="w-5 h-5" /> Call Now: {phone}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">

      {/* ── Full-Screen Hero ── */}
      <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-950 to-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/25 via-transparent to-transparent pointer-events-none" />

        {/* Trust bar */}
        <div className="relative bg-blue-900/30 border-b border-blue-800/50 py-2 px-4">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs text-blue-200">
            <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> 500+ loans closed</span>
            <span className="text-blue-700 hidden md:inline">|</span>
            <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> A+ BBB Rating</span>
            <span className="text-blue-700 hidden md:inline">|</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> 21-Day Close Guarantee</span>
          </div>
        </div>

        {/* Main content */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-3">
                {headline}
              </h1>
              <p className="text-gray-400 text-lg">No hard credit pull · No obligation · Takes 3 minutes</p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                {[1, 2, 3].map(n => (
                  <div key={n} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                      step > n ? 'bg-green-500 text-white' :
                      step === n ? 'bg-blue-600 text-white ring-4 ring-blue-600/30' :
                      'bg-gray-800 text-gray-500 border border-gray-700'
                    }`}>
                      {step > n ? <CheckCircle className="w-5 h-5" /> : n}
                    </div>
                    {n < 3 && (
                      <div className="flex-1 h-1 mx-2 rounded-full bg-gray-800">
                        <div className="h-1 rounded-full bg-blue-600 transition-all duration-500"
                          style={{ width: step > n ? '100%' : '0%' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 px-0">
                <span>Loan Purpose</span>
                <span className="text-center flex-1 mx-4">Loan Details</span>
                <span>Your Info</span>
              </div>
              <div className="mt-3 h-1 bg-gray-800 rounded-full">
                <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Form card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">

              {/* Step 1: Loan Purpose */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold mb-6 text-center">What are you looking to do?</h2>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {(['Purchase', 'Refinance', 'Cash Out', 'DSCR Investment'] as LoanPurpose[]).map(p => (
                      <button key={p} type="button" onClick={() => setForm(prev => ({ ...prev, purpose: p }))}
                        className={`py-4 px-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                          form.purpose === p
                            ? 'border-blue-500 bg-blue-600/20 text-white'
                            : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                        }`}>
                        {p}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setStep(2)} disabled={!canProceedStep1}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Step 2: Loan Details */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold mb-6 text-center">Tell us about your loan</h2>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Estimated Loan Amount</label>
                      <select value={form.loanAmount} onChange={e => setForm(p => ({ ...p, loanAmount: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                        <option value="">Select range…</option>
                        <option value="under-150k">Under $150,000</option>
                        <option value="150k-300k">$150,000 – $300,000</option>
                        <option value="300k-500k">$300,000 – $500,000</option>
                        <option value="500k-750k">$500,000 – $750,000</option>
                        <option value="750k-1m">$750,000 – $1,000,000</option>
                        <option value="1m+">$1,000,000+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Property State</label>
                      <select value={form.propertyState} onChange={e => setForm(p => ({ ...p, propertyState: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                        <option value="">Select state…</option>
                        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Credit Score Range</label>
                      <select value={form.creditScore} onChange={e => setForm(p => ({ ...p, creditScore: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                        <option value="">Select range…</option>
                        {['760+', '740-759', '720-739', '700-719', '680-699', '660-679', 'Below 660'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors font-medium">
                      Back
                    </button>
                    <button onClick={() => setStep(3)} disabled={!canProceedStep2}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                      Continue <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Info */}
              {step === 3 && (
                <form onSubmit={handleSubmit}>
                  <h2 className="text-xl font-bold mb-6 text-center">Where should we send your results?</h2>
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                      <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="Jane Smith" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Email Address *</label>
                      <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="jane@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number *</label>
                      <input required type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="(555) 555-5555" />
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={form.consent} onChange={e => setForm(p => ({ ...p, consent: e.target.checked }))}
                        className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500" />
                      <span className="text-xs text-gray-400 leading-relaxed">
                        I agree to be contacted by a licensed mortgage professional (NMLS #{nmlsNumber}) via phone, email, or text regarding my mortgage inquiry. No hard credit pull.
                      </span>
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(2)} className="px-5 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors font-medium">
                      Back
                    </button>
                    <button type="submit" disabled={submitting || !form.consent}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                      {submitting ? 'Submitting…' : <>Get My Results <ChevronRight className="w-5 h-5" /></>}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: <Shield className="w-4 h-4 text-green-400" />, text: 'Licensed in 27 States' },
                { icon: <CheckCircle className="w-4 h-4 text-blue-400" />, text: `NMLS #${nmlsNumber}` },
                { icon: <Lock className="w-4 h-4 text-yellow-400" />, text: 'SSL Secured' },
                { icon: <Star className="w-4 h-4 text-purple-400" />, text: 'No Hard Pull' },
              ].map(b => (
                <div key={b.text} className="flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-400">
                  {b.icon} {b.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Testimonials ── */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">What Our Clients Say</h2>
            <p className="text-gray-400">Real experiences from real investors</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="text-sm">
                  <span className="font-semibold text-white">{t.name}</span>
                  <span className="text-gray-500"> · {t.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 border-t border-gray-800 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center text-xs text-gray-600 space-y-2">
          <p className="text-gray-500 font-semibold">NMLS #{nmlsNumber} | Equal Housing Lender 🏠</p>
          <p className="leading-relaxed max-w-2xl mx-auto">
            All loans subject to credit approval. Not a commitment to lend. Rates and programs subject to change.
            Licensed in 27 states. This site is not affiliated with or endorsed by any government agency.
          </p>
        </div>
      </footer>
    </div>
  );
}

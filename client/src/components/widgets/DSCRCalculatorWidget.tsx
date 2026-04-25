import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Home, TrendingUp, Calculator } from 'lucide-react';

interface DSCRResult {
  monthlyPI: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  totalPITI: number;
  monthlyRent: number;
  dscr: number;
  qualification: string;
  maxLoanAmount: number;
  annualDebtService: number;
}

interface Props {
  onLeadCapture?: (dscr: number) => void;
  compact?: boolean;
}

const QUAL_COLORS: Record<string, string> = {
  'Strong Approval': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Likely Approval': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Borderline': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Insufficient': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const DSCR_BAR_COLORS: Record<string, string> = {
  'Strong Approval': 'bg-green-500',
  'Likely Approval': 'bg-yellow-500',
  'Borderline': 'bg-orange-500',
  'Insufficient': 'bg-red-500',
};

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function DSCRCalculatorWidget({ onLeadCapture, compact = false }: Props) {
  const [monthlyRent, setMonthlyRent] = useState('4000');
  const [annualTaxes, setAnnualTaxes] = useState('3600');
  const [annualInsurance, setAnnualInsurance] = useState('1200');
  const [monthlyHOA, setMonthlyHOA] = useState('0');
  const [loanAmount, setLoanAmount] = useState('400000');
  const [interestRate, setInterestRate] = useState('7.25');
  const [result, setResult] = useState<DSCRResult | null>(null);

  useEffect(() => {
    const rent = parseFloat(monthlyRent) || 0;
    const taxes = parseFloat(annualTaxes) || 0;
    const ins = parseFloat(annualInsurance) || 0;
    const hoa = parseFloat(monthlyHOA) || 0;
    const loan = parseFloat(loanAmount) || 0;
    const rate = parseFloat(interestRate) || 0;

    if (rent > 0 && loan > 0 && rate > 0) {
      fetch('/api/calculator/dscr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyRent: rent, annualTaxes: taxes, annualInsurance: ins,
          monthlyHOA: hoa, loanAmount: loan, interestRate: rate, loanTermYears: 30,
        }),
      })
        .then(r => r.json())
        .then(setResult)
        .catch(() => null);
    }
  }, [monthlyRent, annualTaxes, annualInsurance, monthlyHOA, loanAmount, interestRate]);

  const inputCls = 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 h-9 text-sm';

  return (
    <Card className="bg-gray-900 border-gray-700 text-white">
      <CardHeader className={compact ? 'pb-2 pt-4 px-4' : 'pb-3'}>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Calculator className="w-4 h-4 text-blue-400" />
          DSCR Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className={compact ? 'px-4 pb-4' : ''}>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Monthly Rent</label>
            <Input className={inputCls} value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} placeholder="4000" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Loan Amount</label>
            <Input className={inputCls} value={loanAmount} onChange={e => setLoanAmount(e.target.value)} placeholder="400000" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Interest Rate (%)</label>
            <Input className={inputCls} value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder="7.25" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Annual Taxes</label>
            <Input className={inputCls} value={annualTaxes} onChange={e => setAnnualTaxes(e.target.value)} placeholder="3600" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Annual Insurance</label>
            <Input className={inputCls} value={annualInsurance} onChange={e => setAnnualInsurance(e.target.value)} placeholder="1200" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Monthly HOA</label>
            <Input className={inputCls} value={monthlyHOA} onChange={e => setMonthlyHOA(e.target.value)} placeholder="0" />
          </div>
        </div>

        {result && (
          <div className="space-y-3">
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-3xl font-bold text-white mb-1">{result.dscr.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mb-2">DSCR Ratio</div>
              <Badge className={`${QUAL_COLORS[result.qualification]} border text-xs`}>
                {result.qualification}
              </Badge>
              <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${DSCR_BAR_COLORS[result.qualification]}`}
                  style={{ width: `${Math.min(result.dscr / 2 * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span><span>1.0</span><span>1.25+</span><span>2.0</span>
              </div>
            </div>

            <div className="space-y-1.5">
              {[
                { icon: <DollarSign className="w-3 h-3" />, label: 'P&I', val: result.monthlyPI },
                { icon: <Home className="w-3 h-3" />, label: 'Taxes', val: result.monthlyTaxes },
                { icon: <TrendingUp className="w-3 h-3" />, label: 'Insurance', val: result.monthlyInsurance },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-400">{row.icon}{row.label}</span>
                  <span className="text-gray-200">{fmt(row.val)}/mo</span>
                </div>
              ))}
              <div className="border-t border-gray-700 pt-1.5 flex justify-between text-sm font-medium">
                <span className="text-gray-300">Total PITI</span>
                <span className="text-white">{fmt(result.totalPITI)}/mo</span>
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-700/40 rounded-lg p-2.5 text-sm">
              <span className="text-gray-400">Max Loan at 1.25× DSCR: </span>
              <span className="text-blue-300 font-semibold">{fmt(result.maxLoanAmount)}</span>
            </div>

            {result.dscr >= 1.0 && onLeadCapture && (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                onClick={() => onLeadCapture(result.dscr)}
              >
                Get Pre-Qualified — DSCR {result.dscr.toFixed(2)}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

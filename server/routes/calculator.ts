import { Router } from 'express';
import { z } from 'zod';

export const calculatorRoutes = Router();

function calcMonthlyPI(principal: number, annualRate: number, termYears: number): number {
  if (annualRate === 0) return principal / (termYears * 12);
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
}

function maxLoanFromPI(targetPI: number, annualRate: number, termYears: number): number {
  if (annualRate === 0) return targetPI * termYears * 12;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return targetPI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// POST /api/calculator/dscr
calculatorRoutes.post('/dscr', (req, res) => {
  try {
    const schema = z.object({
      monthlyRent: z.number().positive(),
      annualTaxes: z.number().min(0),
      annualInsurance: z.number().min(0),
      monthlyHOA: z.number().min(0).default(0),
      loanAmount: z.number().positive(),
      interestRate: z.number().positive(),
      loanTermYears: z.number().int().positive().default(30),
    });

    const d = schema.parse(req.body);
    const monthlyPI = calcMonthlyPI(d.loanAmount, d.interestRate, d.loanTermYears);
    const monthlyTaxes = d.annualTaxes / 12;
    const monthlyInsurance = d.annualInsurance / 12;
    const totalPITI = monthlyPI + monthlyTaxes + monthlyInsurance + d.monthlyHOA;
    const dscr = d.monthlyRent / totalPITI;

    let qualification: string;
    if (dscr >= 1.25) qualification = 'Strong Approval';
    else if (dscr >= 1.0) qualification = 'Likely Approval';
    else if (dscr >= 0.75) qualification = 'Borderline';
    else qualification = 'Insufficient';

    // Max loan at 1.25 DSCR
    const maxPITI = d.monthlyRent / 1.25;
    const maxPI = maxPITI - monthlyTaxes - monthlyInsurance - d.monthlyHOA;
    const maxLoanAmount = maxPI > 0 ? maxLoanFromPI(maxPI, d.interestRate, d.loanTermYears) : 0;

    res.json({
      monthlyPI: round2(monthlyPI),
      monthlyTaxes: round2(monthlyTaxes),
      monthlyInsurance: round2(monthlyInsurance),
      monthlyHOA: round2(d.monthlyHOA),
      totalPITI: round2(totalPITI),
      monthlyRent: d.monthlyRent,
      dscr: round2(dscr),
      qualification,
      maxLoanAmount: round2(maxLoanAmount),
      annualDebtService: round2(totalPITI * 12),
    });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Invalid input', details: err.errors });
    res.status(500).json({ error: 'Calculation failed' });
  }
});

// POST /api/calculator/refinance-savings
calculatorRoutes.post('/refinance-savings', (req, res) => {
  try {
    const schema = z.object({
      currentBalance: z.number().positive(),
      currentRate: z.number().positive(),
      currentMonthlyPayment: z.number().positive(),
      newRate: z.number().positive(),
      loanTermYears: z.number().int().positive().default(30),
      closingCosts: z.number().min(0).default(0),
    });

    const d = schema.parse(req.body);
    const newMonthlyPayment = calcMonthlyPI(d.currentBalance, d.newRate, d.loanTermYears);
    const monthlySavings = d.currentMonthlyPayment - newMonthlyPayment;
    const annualSavings = monthlySavings * 12;
    const breakEvenMonths = d.closingCosts > 0 && monthlySavings > 0
      ? Math.ceil(d.closingCosts / monthlySavings) : 0;
    const fiveYearSavings = monthlySavings * 60 - d.closingCosts;
    const tenYearSavings = monthlySavings * 120 - d.closingCosts;

    res.json({
      currentMonthlyPayment: round2(d.currentMonthlyPayment),
      newMonthlyPayment: round2(newMonthlyPayment),
      monthlySavings: round2(monthlySavings),
      annualSavings: round2(annualSavings),
      breakEvenMonths,
      fiveYearSavings: round2(fiveYearSavings),
      tenYearSavings: round2(tenYearSavings),
      closingCosts: d.closingCosts,
      totalInterestCurrent: round2(d.currentMonthlyPayment * d.loanTermYears * 12 - d.currentBalance),
      totalInterestNew: round2(newMonthlyPayment * d.loanTermYears * 12 - d.currentBalance),
    });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Invalid input', details: err.errors });
    res.status(500).json({ error: 'Calculation failed' });
  }
});

// POST /api/calculator/mortgage-payment
calculatorRoutes.post('/mortgage-payment', (req, res) => {
  try {
    const schema = z.object({
      homePrice: z.number().positive(),
      downPaymentPercent: z.number().min(0).max(100).default(20),
      interestRate: z.number().positive(),
      loanTermYears: z.number().int().positive().default(30),
      annualTaxes: z.number().min(0).default(0),
      annualInsurance: z.number().min(0).default(0),
      monthlyHOA: z.number().min(0).default(0),
    });

    const d = schema.parse(req.body);
    const downPaymentAmount = d.homePrice * (d.downPaymentPercent / 100);
    const loanAmount = d.homePrice - downPaymentAmount;
    const monthlyPI = calcMonthlyPI(loanAmount, d.interestRate, d.loanTermYears);
    const monthlyTaxes = d.annualTaxes / 12;
    const monthlyInsurance = d.annualInsurance / 12;
    const totalMonthly = monthlyPI + monthlyTaxes + monthlyInsurance + d.monthlyHOA;

    res.json({
      homePrice: d.homePrice,
      downPaymentAmount: round2(downPaymentAmount),
      downPaymentPercent: d.downPaymentPercent,
      loanAmount: round2(loanAmount),
      monthlyPI: round2(monthlyPI),
      monthlyTaxes: round2(monthlyTaxes),
      monthlyInsurance: round2(monthlyInsurance),
      monthlyHOA: d.monthlyHOA,
      totalMonthly: round2(totalMonthly),
      totalInterestPaid: round2(monthlyPI * d.loanTermYears * 12 - loanAmount),
      totalCostOfLoan: round2(monthlyPI * d.loanTermYears * 12),
    });
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Invalid input', details: err.errors });
    res.status(500).json({ error: 'Calculation failed' });
  }
});

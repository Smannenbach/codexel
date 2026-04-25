export { default as DSCRLanding } from './DSCRLanding';
export { default as MortgageRateChecker } from './MortgageRateChecker';
export { default as LeadCapture } from './LeadCapture';
export { default as StateDSCR } from './StateDSCR';

export const TEMPLATE_REGISTRY = [
  {
    id: 'dscr-landing',
    name: 'DSCR Landing Page',
    description: 'Full DSCR loan landing page with calculator and lead capture',
    category: 'dscr',
    component: 'DSCRLanding',
    thumbnail: '/templates/dscr-landing.png',
    features: ['DSCR Calculator', 'Lead Form', 'Loan Programs', 'SEO Optimized'],
  },
  {
    id: 'mortgage-rate-checker',
    name: 'Mortgage Rate Checker',
    description: 'Interactive rate comparison tool with lead capture',
    category: 'mortgage',
    component: 'MortgageRateChecker',
    thumbnail: '/templates/rate-checker.png',
    features: ['Rate Calculator', 'Product Comparison', 'Lead Form'],
  },
  {
    id: 'lead-capture',
    name: 'High-Converting Lead Capture',
    description: 'Multi-step lead funnel optimized for maximum conversions',
    category: 'lead-gen',
    component: 'LeadCapture',
    thumbnail: '/templates/lead-capture.png',
    features: ['Multi-Step Form', 'Progress Bar', 'Trust Badges', 'Testimonials'],
  },
  {
    id: 'state-dscr',
    name: 'State-Specific DSCR',
    description: 'DSCR landing page optimized for a specific US state',
    category: 'dscr',
    component: 'StateDSCR',
    thumbnail: '/templates/state-dscr.png',
    features: ['State SEO', 'Local Stats', 'DSCR Calculator', 'Lead Form'],
  },
] as const;

export type TemplateId = typeof TEMPLATE_REGISTRY[number]['id'];
export type TemplateCategory = typeof TEMPLATE_REGISTRY[number]['category'];

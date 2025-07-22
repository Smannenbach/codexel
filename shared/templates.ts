export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  targetRole?: string; // For individual-specific templates
  features: string[];
  techStack: string[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  preview?: string;
  icon: string;
  prompts: {
    initial: string;
    customization?: string[];
  };
}

export const projectTemplates: ProjectTemplate[] = [
  // REAL ESTATE INDUSTRY - COMPANIES
  {
    id: 'real-estate-brokerage',
    name: 'Real Estate Brokerage Website',
    description: 'Full-featured website for real estate brokerages with agent profiles, property listings, and lead management',
    category: 'Real Estate',
    industry: 'Real Estate',
    features: [
      'Agent directory with individual profiles',
      'MLS property listing integration',
      'Advanced property search with filters',
      'Virtual tour scheduling',
      'Lead capture and CRM integration',
      'Market reports and analytics',
      'Client testimonials',
      'Commission calculator',
      'Office locations map'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'MLS API'],
    estimatedTime: '2-3 weeks',
    difficulty: 'advanced',
    icon: '🏢',
    prompts: {
      initial: 'Create a professional real estate brokerage website with MLS integration and agent management',
      customization: [
        'How many agents does your brokerage have?',
        'Which MLS systems do you need to integrate with?',
        'Do you need IDX/VOW compliance?'
      ]
    }
  },

  // REAL ESTATE INDUSTRY - INDIVIDUALS
  {
    id: 'real-estate-agent',
    name: 'Real Estate Agent Personal Website',
    description: 'Personal branding website for individual real estate agents with lead generation focus',
    category: 'Real Estate',
    industry: 'Real Estate',
    targetRole: 'Real Estate Agent',
    features: [
      'Personal brand showcase',
      'Featured listings carousel',
      'Home valuation tool',
      'Neighborhood guides',
      'First-time buyer resources',
      'Seller\'s guide',
      'Client testimonials',
      'Schedule showing form',
      'Email newsletter signup',
      'Social media integration'
    ],
    techStack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    estimatedTime: '1 week',
    difficulty: 'intermediate',
    icon: '🏡',
    prompts: {
      initial: 'Build a personal website for a real estate agent focused on lead generation and personal branding',
      customization: [
        'What\'s your primary market area?',
        'Do you specialize in any property types?',
        'What\'s your unique value proposition?'
      ]
    }
  },

  // MORTGAGE INDUSTRY - COMPANIES
  {
    id: 'mortgage-bank',
    name: 'Mortgage Bank Enterprise Platform',
    description: 'Complete digital mortgage platform for banks with loan origination, processing, and compliance',
    category: 'Financial Services',
    industry: 'Mortgage',
    features: [
      'Online loan application portal',
      'Document upload and verification',
      'Credit check integration',
      'Automated underwriting system',
      'Loan status tracking',
      'Rate lock functionality',
      'Compliance management (RESPA, TILA)',
      'Branch and loan officer management',
      'Investor portal',
      'Secondary market integration'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Kubernetes'],
    estimatedTime: '3-4 months',
    difficulty: 'advanced',
    icon: '🏦',
    prompts: {
      initial: 'Create an enterprise mortgage banking platform with full loan origination system and compliance features',
      customization: [
        'What loan types will you offer?',
        'Which credit bureaus do you work with?',
        'Do you need warehouse line management?'
      ]
    }
  },

  {
    id: 'correspondent-lender',
    name: 'Correspondent Lender Portal',
    description: 'B2B platform for correspondent lenders to manage broker relationships and loan submissions',
    category: 'Financial Services',
    industry: 'Mortgage',
    features: [
      'Broker onboarding portal',
      'Wholesale rate sheets',
      'Loan submission pipeline',
      'Automated loan pricing',
      'Document management',
      'Broker commission tracking',
      'Compliance monitoring',
      'TPO management',
      'Investor guidelines library',
      'API for LOS integration'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'GraphQL'],
    estimatedTime: '2-3 months',
    difficulty: 'advanced',
    icon: '🤝',
    prompts: {
      initial: 'Build a correspondent lender portal for managing wholesale mortgage broker relationships',
      customization: [
        'How many brokers do you work with?',
        'What loan products do you offer?',
        'Which LOS systems need integration?'
      ]
    }
  },

  // MORTGAGE INDUSTRY - INDIVIDUALS
  {
    id: 'loan-officer',
    name: 'Mortgage Loan Officer Website',
    description: 'Personal website for loan officers with calculators, application, and lead nurturing',
    category: 'Financial Services',
    industry: 'Mortgage',
    targetRole: 'Loan Officer',
    features: [
      'Mortgage calculators suite',
      'Current rates display',
      'Loan application form',
      'Credit score resources',
      'First-time buyer guides',
      'Refinance analyzer',
      'Client testimonials',
      'Educational blog',
      'NMLS license display',
      'Secure document upload'
    ],
    techStack: ['React', 'TypeScript', 'Next.js', 'Stripe'],
    estimatedTime: '1 week',
    difficulty: 'intermediate',
    icon: '💰',
    prompts: {
      initial: 'Create a professional website for a mortgage loan officer with lead generation and educational content',
      customization: [
        'What\'s your NMLS number?',
        'Which states are you licensed in?',
        'What loan types do you specialize in?'
      ]
    }
  },

  {
    id: 'branch-manager',
    name: 'Mortgage Branch Manager Platform',
    description: 'Branch management system for mortgage branch managers to oversee operations and team',
    category: 'Financial Services',
    industry: 'Mortgage',
    targetRole: 'Branch Manager',
    features: [
      'Team performance dashboard',
      'Pipeline management',
      'Commission tracking',
      'Recruiting portal',
      'Training resources',
      'Compliance monitoring',
      'Marketing materials library',
      'Branch P&L reporting',
      'Lead distribution system',
      'Team communication hub'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Chart.js'],
    estimatedTime: '2-3 weeks',
    difficulty: 'advanced',
    icon: '📊',
    prompts: {
      initial: 'Build a branch management platform for mortgage branch managers with team oversight and recruiting',
      customization: [
        'How many loan officers in your branch?',
        'What\'s your monthly volume target?',
        'Do you need multi-branch support?'
      ]
    }
  },

  // FINANCIAL SERVICES - COMPANIES
  {
    id: 'investment-firm',
    name: 'Investment Management Firm Website',
    description: 'Professional website for investment firms with client portal and fund information',
    category: 'Financial Services',
    industry: 'Investment',
    features: [
      'Fund performance tracking',
      'Client portal with statements',
      'Investment strategy showcase',
      'Market insights and research',
      'Team and expertise profiles',
      'Regulatory disclosures',
      'Document center',
      'Event registration',
      'Newsletter subscription',
      'Secure messaging'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Chart.js'],
    estimatedTime: '3-4 weeks',
    difficulty: 'advanced',
    icon: '📈',
    prompts: {
      initial: 'Create an investment firm website with client portal and fund performance tracking',
      customization: [
        'What types of funds do you manage?',
        'Do you need SEC compliance features?',
        'What\'s your AUM range?'
      ]
    }
  },

  {
    id: 'private-equity',
    name: 'Private Equity Firm Platform',
    description: 'Sophisticated platform for PE firms with deal flow management and investor relations',
    category: 'Financial Services',
    industry: 'Private Equity',
    features: [
      'Portfolio company showcase',
      'Investor portal (LP access)',
      'Deal flow pipeline',
      'Document data room',
      'Capital call management',
      'Performance reporting',
      'Team bios and track record',
      'News and insights',
      'Event management',
      'Secure communications'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS S3'],
    estimatedTime: '2-3 months',
    difficulty: 'advanced',
    icon: '💼',
    prompts: {
      initial: 'Build a private equity firm platform with investor portal and portfolio management',
      customization: [
        'How many portfolio companies?',
        'Do you need fund accounting integration?',
        'What\'s your investor communication frequency?'
      ]
    }
  },

  // FINANCIAL SERVICES - INDIVIDUALS
  {
    id: 'financial-advisor',
    name: 'Financial Advisor Personal Website',
    description: 'Professional website for financial advisors focused on client acquisition and education',
    category: 'Financial Services',
    industry: 'Wealth Management',
    targetRole: 'Financial Advisor',
    features: [
      'Service offerings overview',
      'Financial planning tools',
      'Retirement calculator',
      'Risk assessment quiz',
      'Educational resources',
      'Market commentary blog',
      'Client testimonials',
      'Appointment scheduling',
      'Newsletter signup',
      'Compliance disclosures'
    ],
    techStack: ['React', 'TypeScript', 'Next.js', 'Calendly API'],
    estimatedTime: '1 week',
    difficulty: 'intermediate',
    icon: '📊',
    prompts: {
      initial: 'Create a financial advisor website with calculators and client education focus',
      customization: [
        'What licenses do you hold?',
        'What\'s your ideal client profile?',
        'Do you specialize in any areas?'
      ]
    }
  },

  // HOSPITALITY INDUSTRY
  {
    id: 'hotel',
    name: 'Hotel Booking Website',
    description: 'Full-featured hotel website with real-time booking, room management, and guest services',
    category: 'Hospitality',
    industry: 'Hotels',
    features: [
      'Real-time room availability',
      'Online booking system',
      'Multiple room types gallery',
      'Amenities showcase',
      'Restaurant/spa integration',
      'Event spaces booking',
      'Guest reviews integration',
      'Loyalty program',
      'Multi-language support',
      'Virtual tours'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe', 'Booking APIs'],
    estimatedTime: '3-4 weeks',
    difficulty: 'advanced',
    icon: '🏨',
    prompts: {
      initial: 'Build a hotel website with real-time booking system and guest management',
      customization: [
        'How many rooms does your hotel have?',
        'Do you need channel manager integration?',
        'What amenities should be highlighted?'
      ]
    }
  },

  {
    id: 'restaurant',
    name: 'Restaurant Website with Ordering',
    description: 'Modern restaurant website with online ordering, reservations, and menu management',
    category: 'Hospitality',
    industry: 'Restaurant',
    features: [
      'Interactive menu with photos',
      'Online ordering system',
      'Table reservation system',
      'Delivery/pickup options',
      'Real-time order tracking',
      'Customer reviews',
      'Loyalty rewards program',
      'Gift card sales',
      'Event catering requests',
      'Social media integration'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe', 'Twilio'],
    estimatedTime: '2-3 weeks',
    difficulty: 'intermediate',
    icon: '🍽️',
    prompts: {
      initial: 'Create a restaurant website with online ordering and reservation system',
      customization: [
        'What type of cuisine do you serve?',
        'Do you offer delivery or just pickup?',
        'How many table seats do you have?'
      ]
    }
  },

  {
    id: 'bar-nightclub',
    name: 'Bar & Nightclub Website',
    description: 'Vibrant website for bars and nightclubs with event management and VIP bookings',
    category: 'Hospitality',
    industry: 'Nightlife',
    features: [
      'Event calendar and tickets',
      'VIP table reservations',
      'Drink menu showcase',
      'Photo gallery',
      'DJ/artist profiles',
      'Guest list management',
      'Age verification',
      'Social media feeds',
      'Bottle service booking',
      'Mobile-optimized design'
    ],
    techStack: ['React', 'TypeScript', 'Next.js', 'Stripe', 'Instagram API'],
    estimatedTime: '2 weeks',
    difficulty: 'intermediate',
    icon: '🍸',
    prompts: {
      initial: 'Build a bar/nightclub website with event management and VIP reservations',
      customization: [
        'What\'s your venue capacity?',
        'Do you host special events?',
        'Do you need age verification?'
      ]
    }
  },

  // RETAIL INDUSTRY
  {
    id: 'gun-shop',
    name: 'Firearms Retail Store',
    description: 'Compliant e-commerce platform for firearms retailers with FFL integration',
    category: 'Retail',
    industry: 'Firearms',
    features: [
      'FFL dealer locator',
      'Age/ID verification',
      'Inventory management',
      'Background check integration',
      'Compliance tracking',
      'Training class scheduling',
      'Gunsmith services',
      'Ammunition catalog',
      'Transfer services',
      'ATF compliance features'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe'],
    estimatedTime: '3-4 weeks',
    difficulty: 'advanced',
    icon: '🔫',
    prompts: {
      initial: 'Create a compliant firearms retail website with FFL integration and inventory management',
      customization: [
        'What\'s your FFL number?',
        'Which states do you ship to?',
        'Do you offer training classes?'
      ]
    }
  },

  // CONSTRUCTION INDUSTRY
  {
    id: 'home-builder',
    name: 'Home Builder Showcase',
    description: 'Website for home builders with floor plans, communities, and design center',
    category: 'Construction',
    industry: 'Real Estate Development',
    features: [
      'Floor plan gallery',
      'Interactive community maps',
      'Virtual home tours',
      'Design center options',
      'Mortgage calculator',
      'Construction progress tracker',
      'Buyer portal',
      'Warranty management',
      'Model home scheduling',
      'Quick move-in homes'
    ],
    techStack: ['React', 'TypeScript', 'Next.js', '3D viewer libraries'],
    estimatedTime: '3-4 weeks',
    difficulty: 'advanced',
    icon: '🏗️',
    prompts: {
      initial: 'Build a home builder website with floor plans and virtual tours',
      customization: [
        'How many communities are you building?',
        'Do you offer custom homes?',
        'What\'s your price range?'
      ]
    }
  },

  {
    id: 'real-estate-developer',
    name: 'Real Estate Developer Platform',
    description: 'Corporate website for developers with project portfolio and investor relations',
    category: 'Construction',
    industry: 'Real Estate Development',
    features: [
      'Project portfolio showcase',
      'Development pipeline',
      'Investor relations portal',
      'Press releases and news',
      'Sustainability initiatives',
      'Partner/vendor portal',
      'Career opportunities',
      'Community impact reports',
      'Financial reports',
      'Property management integration'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'CMS'],
    estimatedTime: '3-4 weeks',
    difficulty: 'advanced',
    icon: '🏙️',
    prompts: {
      initial: 'Create a real estate developer website with project portfolio and investor portal',
      customization: [
        'What types of properties do you develop?',
        'Do you need investor access controls?',
        'How many active projects?'
      ]
    }
  },

  // HEALTHCARE INDUSTRY
  {
    id: 'medical-practice',
    name: 'Medical Practice Website',
    description: 'HIPAA-compliant website for medical practices with patient portal',
    category: 'Healthcare',
    industry: 'Medical',
    features: [
      'Online appointment booking',
      'Patient portal access',
      'Provider profiles',
      'Service descriptions',
      'Insurance information',
      'Patient forms download',
      'Telehealth integration',
      'Prescription refills',
      'Health resources blog',
      'HIPAA compliance'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Twilio'],
    estimatedTime: '3-4 weeks',
    difficulty: 'advanced',
    icon: '🏥',
    prompts: {
      initial: 'Build a HIPAA-compliant medical practice website with patient portal',
      customization: [
        'What\'s your medical specialty?',
        'How many providers?',
        'Do you need EHR integration?'
      ]
    }
  },

  // LEGAL INDUSTRY
  {
    id: 'law-firm',
    name: 'Law Firm Website',
    description: 'Professional law firm website with practice areas and client intake',
    category: 'Legal',
    industry: 'Legal Services',
    features: [
      'Practice area pages',
      'Attorney profiles',
      'Case results showcase',
      'Client testimonials',
      'Legal resource library',
      'Contact forms by practice',
      'Newsletter/alerts signup',
      'Webinar registration',
      'Client portal',
      'Multi-language support'
    ],
    techStack: ['React', 'TypeScript', 'Next.js', 'PostgreSQL'],
    estimatedTime: '2-3 weeks',
    difficulty: 'intermediate',
    icon: '⚖️',
    prompts: {
      initial: 'Create a law firm website with practice areas and attorney profiles',
      customization: [
        'What practice areas do you cover?',
        'How many attorneys?',
        'Do you need client portal features?'
      ]
    }
  },

  // EDUCATION INDUSTRY
  {
    id: 'online-school',
    name: 'Online Education Platform',
    description: 'Complete e-learning platform with courses, assessments, and certificates',
    category: 'Education',
    industry: 'EdTech',
    features: [
      'Course catalog and search',
      'Video lesson player',
      'Interactive assignments',
      'Progress tracking',
      'Certificate generation',
      'Student dashboard',
      'Instructor tools',
      'Discussion forums',
      'Payment processing',
      'Mobile app support'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS S3', 'Stripe'],
    estimatedTime: '2-3 months',
    difficulty: 'advanced',
    icon: '🎓',
    prompts: {
      initial: 'Build an online education platform with courses and student management',
      customization: [
        'What subjects will you teach?',
        'Do you need live classes?',
        'What\'s your pricing model?'
      ]
    }
  },

  // AUTOMOTIVE INDUSTRY
  {
    id: 'car-dealership',
    name: 'Auto Dealership Website',
    description: 'Car dealership website with inventory management and financing',
    category: 'Automotive',
    industry: 'Auto Sales',
    features: [
      'Vehicle inventory search',
      'VIN decoder integration',
      'Photo galleries',
      'Finance calculator',
      'Trade-in valuation',
      'Service scheduling',
      'Parts catalog',
      'Test drive booking',
      'Credit application',
      'Specials and incentives'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Auto APIs'],
    estimatedTime: '3-4 weeks',
    difficulty: 'advanced',
    icon: '🚗',
    prompts: {
      initial: 'Create an auto dealership website with inventory and financing tools',
      customization: [
        'New, used, or both?',
        'Which brands do you carry?',
        'Do you need DMS integration?'
      ]
    }
  },

  // FITNESS INDUSTRY
  {
    id: 'gym-fitness',
    name: 'Gym & Fitness Center',
    description: 'Fitness center website with class scheduling and membership management',
    category: 'Fitness',
    industry: 'Health & Wellness',
    features: [
      'Class schedule and booking',
      'Trainer profiles',
      'Membership plans',
      'Online payment',
      'Member portal',
      'Workout tracking',
      'Nutrition resources',
      'Virtual classes',
      'Equipment showcase',
      'Mobile app integration'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe'],
    estimatedTime: '2-3 weeks',
    difficulty: 'intermediate',
    icon: '💪',
    prompts: {
      initial: 'Build a gym website with class scheduling and membership management',
      customization: [
        'How many locations?',
        'What types of classes?',
        'Do you offer personal training?'
      ]
    }
  },

  // Add more templates for other industries...
  
  // PORTFOLIO MANAGERS
  {
    id: 'portfolio-manager',
    name: 'Portfolio Manager Dashboard',
    description: 'Professional platform for portfolio managers with analytics and client reporting',
    category: 'Financial Services',
    industry: 'Asset Management',
    targetRole: 'Portfolio Manager',
    features: [
      'Portfolio performance analytics',
      'Risk assessment tools',
      'Client reporting portal',
      'Market research integration',
      'Trade execution interface',
      'Compliance monitoring',
      'Attribution analysis',
      'Benchmark comparison',
      'Document management',
      'Client communication hub'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Python', 'Chart.js'],
    estimatedTime: '4-6 weeks',
    difficulty: 'advanced',
    icon: '📊',
    prompts: {
      initial: 'Create a portfolio manager platform with analytics and client reporting',
      customization: [
        'What asset classes do you manage?',
        'How many client accounts?',
        'Which market data feeds do you need?'
      ]
    }
  },

  // REAL ESTATE INVESTORS
  {
    id: 'real-estate-investor',
    name: 'Real Estate Investment Platform',
    description: 'Comprehensive platform for real estate investors to track properties, analyze deals, and manage portfolios',
    category: 'Real Estate',
    industry: 'Real Estate Investment',
    targetRole: 'Real Estate Investor',
    features: [
      'Property portfolio dashboard',
      'Deal analysis calculator',
      'Cash flow projections',
      'ROI and cap rate analysis',
      'Property comparison tools',
      'Market trend analytics',
      'Tenant management',
      'Expense tracking',
      'Tax documentation',
      'Investment reporting'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Chart.js'],
    estimatedTime: '3-4 weeks',
    difficulty: 'advanced',
    icon: '🏘️',
    prompts: {
      initial: 'Build a real estate investment platform with property tracking and analysis tools',
      customization: [
        'What types of properties do you invest in?',
        'How many properties in your portfolio?',
        'Do you need syndication features?'
      ]
    }
  },

  // INSURANCE INDUSTRY
  {
    id: 'insurance-agency',
    name: 'Insurance Agency Website',
    description: 'Full-service insurance agency website with quote engine and client portal',
    category: 'Financial Services',
    industry: 'Insurance',
    features: [
      'Online quote calculator',
      'Policy comparison tools',
      'Client portal access',
      'Claims submission forms',
      'Agent directory',
      'Coverage explanations',
      'Payment processing',
      'Document management',
      'Live chat support',
      'Mobile app integration'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Insurance APIs'],
    estimatedTime: '4-5 weeks',
    difficulty: 'advanced',
    icon: '🛡️',
    prompts: {
      initial: 'Create an insurance agency website with quote engine and client management',
      customization: [
        'What types of insurance do you offer?',
        'Which carriers do you work with?',
        'Do you need comparative rating?'
      ]
    }
  },

  {
    id: 'insurance-agent',
    name: 'Insurance Agent Personal Site',
    description: 'Personal website for insurance agents focused on lead generation and client education',
    category: 'Financial Services',
    industry: 'Insurance',
    targetRole: 'Insurance Agent',
    features: [
      'Quick quote forms',
      'Insurance calculators',
      'Educational resources',
      'Client testimonials',
      'Coverage guides',
      'Local market insights',
      'Referral program',
      'Newsletter signup',
      'Appointment booking',
      'License verification'
    ],
    techStack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    estimatedTime: '1-2 weeks',
    difficulty: 'intermediate',
    icon: '🏦',
    prompts: {
      initial: 'Build an insurance agent website focused on lead generation and education',
      customization: [
        'What insurance lines do you specialize in?',
        'What\'s your target demographic?',
        'Do you need multi-state licensing display?'
      ]
    }
  },

  // TECHNOLOGY INDUSTRY
  {
    id: 'saas-startup',
    name: 'SaaS Startup Landing Page',
    description: 'Modern SaaS landing page with pricing, features showcase, and conversion optimization',
    category: 'Technology',
    industry: 'Software',
    features: [
      'Hero section with demo',
      'Feature comparison grid',
      'Pricing calculator',
      'Customer testimonials',
      'Integration showcase',
      'Free trial signup',
      'Documentation portal',
      'Blog/resources section',
      'Live chat widget',
      'A/B testing setup'
    ],
    techStack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Analytics'],
    estimatedTime: '2-3 weeks',
    difficulty: 'intermediate',
    icon: '🚀',
    prompts: {
      initial: 'Create a SaaS startup landing page with conversion optimization',
      customization: [
        'What does your software do?',
        'What\'s your pricing model?',
        'Who are your main competitors?'
      ]
    }
  },

  {
    id: 'it-consultant',
    name: 'IT Consultant Portfolio',
    description: 'Professional website for IT consultants showcasing expertise and services',
    category: 'Technology',
    industry: 'IT Services',
    targetRole: 'IT Consultant',
    features: [
      'Service offerings matrix',
      'Technology stack showcase',
      'Case studies section',
      'Client project gallery',
      'Consultation booking',
      'Resource downloads',
      'Security certifications',
      'SLA information',
      'Support ticket portal',
      'Knowledge base'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    estimatedTime: '2 weeks',
    difficulty: 'intermediate',
    icon: '💻',
    prompts: {
      initial: 'Build an IT consultant website with service showcase and booking system',
      customization: [
        'What IT services do you offer?',
        'What industries do you serve?',
        'Do you need remote support features?'
      ]
    }
  },

  // MANUFACTURING INDUSTRY
  {
    id: 'manufacturing-company',
    name: 'Manufacturing Company Website',
    description: 'Industrial manufacturing website with product catalog and B2B features',
    category: 'Manufacturing',
    industry: 'Industrial',
    features: [
      'Product catalog with specs',
      'Custom quote request',
      'CAD file downloads',
      'Dealer locator',
      'Quality certifications',
      'Supply chain portal',
      'Order tracking system',
      'Technical resources',
      'Trade show calendar',
      'Sustainability reports'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', '3D viewers'],
    estimatedTime: '4-5 weeks',
    difficulty: 'advanced',
    icon: '🏭',
    prompts: {
      initial: 'Create a manufacturing company website with B2B features and product catalog',
      customization: [
        'What products do you manufacture?',
        'Do you sell direct or through dealers?',
        'What certifications do you hold?'
      ]
    }
  },

  // NONPROFIT SECTOR
  {
    id: 'nonprofit-org',
    name: 'Nonprofit Organization Website',
    description: 'Mission-driven website for nonprofits with donation processing and volunteer management',
    category: 'Nonprofit',
    industry: 'Charitable',
    features: [
      'Online donation portal',
      'Recurring giving options',
      'Impact stories showcase',
      'Volunteer registration',
      'Event management',
      'Newsletter integration',
      'Transparency reports',
      'Grant information',
      'Sponsor recognition',
      'Social media feeds'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe', 'PayPal'],
    estimatedTime: '3-4 weeks',
    difficulty: 'intermediate',
    icon: '❤️',
    prompts: {
      initial: 'Build a nonprofit website with donation processing and volunteer management',
      customization: [
        'What\'s your mission focus?',
        'Do you need tax receipt generation?',
        'What types of events do you host?'
      ]
    }
  },

  // ENTERTAINMENT INDUSTRY
  {
    id: 'event-venue',
    name: 'Event Venue Booking Platform',
    description: 'Comprehensive venue website with virtual tours, availability calendar, and booking system',
    category: 'Hospitality',
    industry: 'Events',
    features: [
      'Virtual venue tours',
      'Real-time availability',
      'Instant quote generator',
      'Floor plan configurator',
      'Vendor directory',
      'Photo galleries',
      'Client testimonials',
      'Catering menus',
      'Contract management',
      'Payment processing'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', '360° viewers'],
    estimatedTime: '3-4 weeks',
    difficulty: 'advanced',
    icon: '🎪',
    prompts: {
      initial: 'Create an event venue website with booking system and virtual tours',
      customization: [
        'What types of events do you host?',
        'How many event spaces?',
        'Do you offer catering services?'
      ]
    }
  },

  // AGRICULTURE INDUSTRY
  {
    id: 'farm-ranch',
    name: 'Farm & Ranch Website',
    description: 'Agricultural business website with product sales, farm tours, and CSA management',
    category: 'Agriculture',
    industry: 'Farming',
    features: [
      'Product marketplace',
      'CSA subscription management',
      'Farm tour booking',
      'Seasonal availability calendar',
      'Recipe blog',
      'Wholesale ordering',
      'Delivery zone mapping',
      'Sustainability practices',
      'Farm news/updates',
      'Weather integration'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Maps API'],
    estimatedTime: '3 weeks',
    difficulty: 'intermediate',
    icon: '🌾',
    prompts: {
      initial: 'Build a farm website with product sales and CSA management',
      customization: [
        'What do you grow/raise?',
        'Do you offer CSA shares?',
        'What\'s your delivery area?'
      ]
    }
  },

  // BEAUTY & WELLNESS
  {
    id: 'spa-salon',
    name: 'Spa & Salon Booking Website',
    description: 'Luxurious spa/salon website with online booking, gift cards, and membership programs',
    category: 'Beauty',
    industry: 'Wellness',
    features: [
      'Service menu with pricing',
      'Online appointment booking',
      'Staff profiles',
      'Gift card sales',
      'Membership programs',
      'Before/after galleries',
      'Product shop',
      'Loyalty rewards',
      'SMS reminders',
      'COVID safety protocols'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Twilio', 'Square'],
    estimatedTime: '3 weeks',
    difficulty: 'intermediate',
    icon: '💆',
    prompts: {
      initial: 'Create a spa/salon website with booking system and retail shop',
      customization: [
        'What services do you offer?',
        'How many service providers?',
        'Do you sell retail products?'
      ]
    }
  },

  {
    id: 'personal-trainer',
    name: 'Personal Trainer Website',
    description: 'Fitness professional website with training programs, client portal, and progress tracking',
    category: 'Fitness',
    industry: 'Health & Wellness',
    targetRole: 'Personal Trainer',
    features: [
      'Training program showcase',
      'Client progress tracking',
      'Workout plan generator',
      'Nutrition guidance',
      'Before/after gallery',
      'Class scheduling',
      'Package pricing',
      'Client testimonials',
      'Fitness assessments',
      'Video exercise library'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Video streaming'],
    estimatedTime: '2-3 weeks',
    difficulty: 'intermediate',
    icon: '🏋️',
    prompts: {
      initial: 'Build a personal trainer website with client management and progress tracking',
      customization: [
        'What\'s your training specialty?',
        'Do you offer online or in-person?',
        'Do you provide nutrition plans?'
      ]
    }
  },

  // CREATIVE INDUSTRY
  {
    id: 'photography-studio',
    name: 'Photography Studio Portfolio',
    description: 'Stunning photography website with galleries, booking system, and client proofing',
    category: 'Creative',
    industry: 'Photography',
    features: [
      'Portfolio galleries',
      'Client proofing portal',
      'Session booking calendar',
      'Package pricing display',
      'Print ordering system',
      'Digital download delivery',
      'Blog/behind scenes',
      'Instagram integration',
      'Testimonial showcase',
      'Contract management'
    ],
    techStack: ['React', 'TypeScript', 'Next.js', 'AWS S3', 'Stripe'],
    estimatedTime: '3 weeks',
    difficulty: 'intermediate',
    icon: '📸',
    prompts: {
      initial: 'Create a photography studio website with galleries and client proofing',
      customization: [
        'What type of photography?',
        'Do you sell prints?',
        'Do you need watermarking?'
      ]
    }
  },

  // TRANSPORTATION
  {
    id: 'logistics-company',
    name: 'Logistics & Transportation Platform',
    description: 'Freight and logistics website with shipment tracking, quote calculator, and carrier portal',
    category: 'Transportation',
    industry: 'Logistics',
    features: [
      'Instant freight quotes',
      'Shipment tracking',
      'Carrier portal',
      'Document management',
      'Route optimization',
      'Warehouse locations',
      'API integration',
      'Customer dashboard',
      'Invoice management',
      'Performance metrics'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Maps API', 'Tracking APIs'],
    estimatedTime: '5-6 weeks',
    difficulty: 'advanced',
    icon: '🚚',
    prompts: {
      initial: 'Build a logistics platform with tracking and carrier management',
      customization: [
        'What shipping modes do you offer?',
        'Do you need LTL/FTL options?',
        'Which regions do you serve?'
      ]
    }
  },

  // SECURITY INDUSTRY
  {
    id: 'security-company',
    name: 'Security Services Website',
    description: 'Professional security company website with service areas, quote system, and client portal',
    category: 'Security',
    industry: 'Security Services',
    features: [
      'Service area mapping',
      'Security assessment tool',
      'Quote request system',
      'Guard scheduling portal',
      'Incident reporting',
      'Client dashboard',
      'Emergency contacts',
      'License display',
      'Training certifications',
      'Alarm monitoring info'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Maps API'],
    estimatedTime: '3-4 weeks',
    difficulty: 'intermediate',
    icon: '🔒',
    prompts: {
      initial: 'Create a security services website with quote system and client portal',
      customization: [
        'What security services do you provide?',
        'Do you offer 24/7 monitoring?',
        'What\'s your service area?'
      ]
    }
  }
];

// Helper function to get templates by category
export function getTemplatesByCategory(category: string): ProjectTemplate[] {
  return projectTemplates.filter(template => template.category === category);
}

// Helper function to get templates by industry
export function getTemplatesByIndustry(industry: string): ProjectTemplate[] {
  return projectTemplates.filter(template => template.industry === industry);
}

// Helper function to get templates for individuals
export function getIndividualTemplates(): ProjectTemplate[] {
  return projectTemplates.filter(template => template.targetRole !== undefined);
}

// Helper function to get templates for companies
export function getCompanyTemplates(): ProjectTemplate[] {
  return projectTemplates.filter(template => template.targetRole === undefined);
}

// Get all unique categories
export function getCategories(): string[] {
  return Array.from(new Set(projectTemplates.map(template => template.category)));
}

// Get all unique industries
export function getIndustries(): string[] {
  return Array.from(new Set(projectTemplates.map(template => template.industry)));
}
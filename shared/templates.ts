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
  },

  // LEGAL INDUSTRY - PERSONAL INJURY ATTORNEYS
  {
    id: 'personal-injury-attorney',
    name: 'Personal Injury Law Firm Website',
    description: 'High-converting personal injury attorney website with case evaluation, live chat, and results showcase',
    category: 'Legal',
    industry: 'Personal Injury Law',
    targetRole: 'Personal Injury Attorney',
    features: [
      'Free case evaluation form',
      'Live chat with intake team',
      'Case results showcase',
      'Practice area pages',
      'Attorney profiles',
      'Client testimonials',
      'Settlement calculator',
      'Accident report forms',
      'Mobile accident app',
      '24/7 availability display'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Live Chat API', 'SMS'],
    estimatedTime: '3-4 weeks',
    difficulty: 'advanced',
    icon: '⚖️',
    prompts: {
      initial: 'Build a personal injury law firm website optimized for conversions and lead capture',
      customization: [
        'What types of injuries do you handle?',
        'Do you work on contingency?',
        'What\'s your case success rate?'
      ]
    }
  },

  // MEDICAL MALPRACTICE ATTORNEYS
  {
    id: 'medical-malpractice-attorney',
    name: 'Medical Malpractice Law Firm',
    description: 'Specialized medical malpractice website with case screening, expert resources, and victim support',
    category: 'Legal',
    industry: 'Medical Malpractice Law',
    targetRole: 'Medical Malpractice Attorney',
    features: [
      'Medical error case evaluator',
      'Expert witness network',
      'Hospital safety ratings',
      'Case timeline builder',
      'Damage calculator',
      'Medical record upload',
      'Nurse case managers',
      'Video consultations',
      'Success stories library',
      'Medical glossary'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'HIPAA Compliance', 'Video API'],
    estimatedTime: '4-5 weeks',
    difficulty: 'advanced',
    icon: '🏥',
    prompts: {
      initial: 'Create a medical malpractice law firm website with HIPAA-compliant features',
      customization: [
        'What medical errors do you handle?',
        'Do you have medical experts on staff?',
        'Which states are you licensed in?'
      ]
    }
  },

  // CLASS ACTION ATTORNEYS
  {
    id: 'class-action-attorney',
    name: 'Class Action Law Firm Platform',
    description: 'Mass tort and class action platform with case management, plaintiff portal, and settlement tracking',
    category: 'Legal',
    industry: 'Class Action Law',
    targetRole: 'Class Action Attorney',
    features: [
      'Mass plaintiff registration',
      'Case status tracker',
      'Document distribution',
      'Settlement calculator',
      'Plaintiff portal',
      'Automated notifications',
      'Media center',
      'Co-counsel network',
      'Court filing tracker',
      'FAQ knowledge base'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Mass Email', 'Document Management'],
    estimatedTime: '5-6 weeks',
    difficulty: 'advanced',
    icon: '👥',
    prompts: {
      initial: 'Build a class action law firm platform with plaintiff management system',
      customization: [
        'What types of class actions?',
        'How many plaintiffs typically?',
        'Do you need co-counsel features?'
      ]
    }
  },

  // AI & INTELLECTUAL PROPERTY ATTORNEYS
  {
    id: 'ai-ip-attorney',
    name: 'AI & IP Law Firm Website',
    description: 'Cutting-edge IP law firm website specializing in AI, software patents, and tech licensing',
    category: 'Legal',
    industry: 'Intellectual Property Law',
    targetRole: 'IP Attorney',
    features: [
      'Patent search integration',
      'AI invention disclosure',
      'Trademark monitoring',
      'License agreement generator',
      'IP portfolio dashboard',
      'Prior art database',
      'Tech transfer portal',
      'Startup packages',
      'Copyright registration',
      'Trade secret vault'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Patent APIs', 'Blockchain'],
    estimatedTime: '4-5 weeks',
    difficulty: 'advanced',
    icon: '🤖',
    prompts: {
      initial: 'Create an AI & IP law firm website with patent search and portfolio management',
      customization: [
        'Do you focus on AI/ML patents?',
        'Do you handle open source licensing?',
        'What tech sectors do you serve?'
      ]
    }
  },

  // CORPORATE ATTORNEYS
  {
    id: 'corporate-attorney',
    name: 'Corporate Law Firm Website',
    description: 'Premium corporate law website with deal room, transaction management, and investor resources',
    category: 'Legal',
    industry: 'Corporate Law',
    targetRole: 'Corporate Attorney',
    features: [
      'Virtual deal room',
      'Transaction tracker',
      'Entity formation tools',
      'Contract templates',
      'Board portal',
      'Compliance calendar',
      'M&A calculator',
      'Investor resources',
      'SEC filing tracker',
      'Corporate governance'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'DocuSign', 'Data Room API'],
    estimatedTime: '4-5 weeks',
    difficulty: 'advanced',
    icon: '🏢',
    prompts: {
      initial: 'Build a corporate law firm website with transaction management features',
      customization: [
        'What size deals do you handle?',
        'Do you need M&A features?',
        'Which industries do you serve?'
      ]
    }
  },

  // DIVORCE/FAMILY LAW ATTORNEYS
  {
    id: 'divorce-attorney',
    name: 'Family Law Practice Website',
    description: 'Compassionate family law website with cost calculators, document prep, and mediation scheduling',
    category: 'Legal',
    industry: 'Family Law',
    targetRole: 'Divorce Attorney',
    features: [
      'Divorce cost calculator',
      'Child support estimator',
      'Asset division tool',
      'Document preparation',
      'Mediation scheduling',
      'Parenting plan builder',
      'Client portal',
      'Payment plans',
      'Resource library',
      'Emergency contact'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Payment Plans', 'Scheduling'],
    estimatedTime: '3 weeks',
    difficulty: 'intermediate',
    icon: '👨‍👩‍👧',
    prompts: {
      initial: 'Create a family law website with calculators and client resources',
      customization: [
        'Do you handle high-asset divorces?',
        'Do you offer mediation?',
        'What\'s your typical case timeline?'
      ]
    }
  },

  // CRIMINAL DEFENSE ATTORNEYS
  {
    id: 'criminal-defense-attorney',
    name: 'Criminal Defense Law Firm',
    description: '24/7 criminal defense website with bail info, case evaluation, and attorney matching',
    category: 'Legal',
    industry: 'Criminal Law',
    targetRole: 'Criminal Defense Attorney',
    features: [
      '24/7 emergency line',
      'Bail bond calculator',
      'Charge information database',
      'Attorney availability',
      'Case evaluation form',
      'Court date reminders',
      'Jail visit scheduling',
      'Payment arrangements',
      'Case results archive',
      'Know your rights guide'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Twilio', 'SMS alerts'],
    estimatedTime: '3 weeks',
    difficulty: 'intermediate',
    icon: '🚨',
    prompts: {
      initial: 'Build a criminal defense website with 24/7 availability and bail information',
      customization: [
        'What types of crimes do you defend?',
        'Do you handle federal cases?',
        'Do you work with bail bondsmen?'
      ]
    }
  },

  // IMMIGRATION ATTORNEYS
  {
    id: 'immigration-attorney',
    name: 'Immigration Law Firm Website',
    description: 'Multi-lingual immigration website with visa trackers, document checklists, and case status',
    category: 'Legal',
    industry: 'Immigration Law',
    targetRole: 'Immigration Attorney',
    features: [
      'Visa eligibility quiz',
      'Case status tracker',
      'Document checklist',
      'Multi-language support',
      'USCIS updates feed',
      'Fee calculator',
      'Appointment scheduler',
      'Translation services',
      'Success stories',
      'Immigration news'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Translation API', 'USCIS API'],
    estimatedTime: '3-4 weeks',
    difficulty: 'advanced',
    icon: '🌍',
    prompts: {
      initial: 'Create an immigration law website with multi-language support and case tracking',
      customization: [
        'Which visa types do you handle?',
        'What languages do you need?',
        'Do you handle deportation defense?'
      ]
    }
  },

  // ESTATE PLANNING ATTORNEYS
  {
    id: 'estate-planning-attorney',
    name: 'Estate Planning Law Firm',
    description: 'Trust and estate website with planning tools, document vault, and family portal',
    category: 'Legal',
    industry: 'Estate Law',
    targetRole: 'Estate Planning Attorney',
    features: [
      'Estate planning quiz',
      'Trust calculator',
      'Document vault',
      'Family tree builder',
      'Asset inventory',
      'Beneficiary portal',
      'Tax estimator',
      'Will updates tracker',
      'Power of attorney forms',
      'Legacy planning guide'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Encryption', 'DocuSign'],
    estimatedTime: '3-4 weeks',
    difficulty: 'intermediate',
    icon: '📜',
    prompts: {
      initial: 'Build an estate planning website with document vault and planning tools',
      customization: [
        'Do you handle high net worth estates?',
        'Do you offer tax planning?',
        'What\'s your typical client age?'
      ]
    }
  },

  // DENTAL PRACTICES
  {
    id: 'dental-practice',
    name: 'Modern Dental Practice Website',
    description: 'Patient-friendly dental website with online booking, treatment gallery, and insurance verification',
    category: 'Healthcare',
    industry: 'Dentistry',
    features: [
      'Online appointment booking',
      'Insurance verification',
      'Treatment cost estimator',
      'Before/after gallery',
      'Patient portal',
      'Treatment plan builder',
      'Payment plans',
      'Emergency dental info',
      'Virtual consultations',
      'Review management'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Dental APIs', 'Payment Processing'],
    estimatedTime: '3 weeks',
    difficulty: 'intermediate',
    icon: '🦷',
    prompts: {
      initial: 'Create a dental practice website with patient booking and insurance features',
      customization: [
        'What dental services do you offer?',
        'Do you accept insurance?',
        'Do you offer payment plans?'
      ]
    }
  },

  // COSMETIC DENTISTS
  {
    id: 'cosmetic-dentist',
    name: 'Cosmetic Dentistry Showcase',
    description: 'High-end cosmetic dentistry website with smile gallery, virtual design, and financing options',
    category: 'Healthcare',
    industry: 'Cosmetic Dentistry',
    targetRole: 'Cosmetic Dentist',
    features: [
      'Smile gallery showcase',
      'Virtual smile design',
      'Treatment simulator',
      'Celebrity smile matcher',
      'Financing calculator',
      'Before/after slider',
      'Video testimonials',
      'Spa amenities showcase',
      'VIP patient program',
      'Social media gallery'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Image Processing', '3D Viewer'],
    estimatedTime: '4 weeks',
    difficulty: 'advanced',
    icon: '✨',
    prompts: {
      initial: 'Build a luxury cosmetic dentistry website with smile design features',
      customization: [
        'What cosmetic procedures do you specialize in?',
        'Do you offer smile makeovers?',
        'What\'s your price range?'
      ]
    }
  },

  // PLASTIC SURGEONS
  {
    id: 'plastic-surgeon',
    name: 'Plastic Surgery Practice Website',
    description: 'Premium plastic surgery website with 3D imaging, virtual consultations, and results gallery',
    category: 'Healthcare',
    industry: 'Plastic Surgery',
    targetRole: 'Plastic Surgeon',
    features: [
      '3D imaging viewer',
      'Virtual consultations',
      'Before/after galleries',
      'Procedure videos',
      'Cost estimator',
      'Financing options',
      'Recovery timeline',
      'Patient testimonials',
      'Board certifications',
      'Private patient portal'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', '3D Imaging API', 'HIPAA Compliance'],
    estimatedTime: '5 weeks',
    difficulty: 'advanced',
    icon: '🏥',
    prompts: {
      initial: 'Create a plastic surgery website with 3D imaging and consultation features',
      customization: [
        'What procedures do you specialize in?',
        'Do you offer non-surgical treatments?',
        'Do you need 3D imaging integration?'
      ]
    }
  },

  // AESTHETIC MEDICINE
  {
    id: 'med-spa',
    name: 'Medical Spa & Aesthetics',
    description: 'Luxury med spa website with treatment menu, membership programs, and booking system',
    category: 'Healthcare',
    industry: 'Aesthetic Medicine',
    features: [
      'Treatment menu catalog',
      'Membership programs',
      'Package deals builder',
      'Virtual skin analysis',
      'Loyalty rewards',
      'Gift card sales',
      'Provider profiles',
      'Treatment tracking',
      'Product shop',
      'Event calendar'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Booking System', 'E-commerce'],
    estimatedTime: '3-4 weeks',
    difficulty: 'intermediate',
    icon: '💉',
    prompts: {
      initial: 'Build a medical spa website with membership and booking features',
      customization: [
        'What aesthetic treatments do you offer?',
        'Do you sell skincare products?',
        'Do you have membership tiers?'
      ]
    }
  },

  // ORTHODONTISTS
  {
    id: 'orthodontist',
    name: 'Orthodontic Practice Website',
    description: 'Modern orthodontics website with treatment simulator, progress tracking, and parent portal',
    category: 'Healthcare',
    industry: 'Orthodontics',
    targetRole: 'Orthodontist',
    features: [
      'Smile assessment tool',
      'Treatment simulator',
      'Progress photo tracker',
      'Parent portal',
      'Payment calculator',
      'Appointment reminders',
      'Rewards program',
      'Emergency care guide',
      'Virtual check-ins',
      'Treatment timeline'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Image Analysis', 'SMS'],
    estimatedTime: '3 weeks',
    difficulty: 'intermediate',
    icon: '😁',
    prompts: {
      initial: 'Create an orthodontic website with treatment tracking and parent portal',
      customization: [
        'Do you offer Invisalign?',
        'Do you treat adults and children?',
        'What\'s your payment structure?'
      ]
    }
  },

  // OPHTHALMOLOGISTS / EYE SURGEONS
  {
    id: 'eye-surgeon',
    name: 'Eye Surgery Center Website',
    description: 'Advanced eye care website with vision simulator, surgery info, and patient education',
    category: 'Healthcare',
    industry: 'Ophthalmology',
    targetRole: 'Eye Surgeon',
    features: [
      'Vision simulator',
      'LASIK calculator',
      'Cataract information',
      'Surgery videos',
      'Insurance checker',
      'Post-op care portal',
      'Eye health library',
      'Appointment scheduling',
      'Referral network',
      'Technology showcase'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Vision Simulator', 'Video Platform'],
    estimatedTime: '4 weeks',
    difficulty: 'advanced',
    icon: '👁️',
    prompts: {
      initial: 'Build an eye surgery center website with vision tools and patient education',
      customization: [
        'What eye surgeries do you perform?',
        'Do you offer LASIK?',
        'Do you accept insurance?'
      ]
    }
  },

  // CARDIOLOGISTS
  {
    id: 'cardiology-practice',
    name: 'Cardiology Practice Website',
    description: 'Heart health website with risk assessment, patient monitoring, and educational resources',
    category: 'Healthcare',
    industry: 'Cardiology',
    targetRole: 'Cardiologist',
    features: [
      'Heart risk calculator',
      'Patient monitoring portal',
      'Test results access',
      'Appointment scheduling',
      'Medication tracker',
      'Diet planning tools',
      'Exercise guidelines',
      'Emergency protocols',
      'Research participation',
      'Telemedicine options'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Health APIs', 'Telemedicine'],
    estimatedTime: '4 weeks',
    difficulty: 'advanced',
    icon: '❤️',
    prompts: {
      initial: 'Create a cardiology website with patient monitoring and risk assessment',
      customization: [
        'Do you offer interventional procedures?',
        'Do you have cardiac rehab programs?',
        'Do you need remote monitoring?'
      ]
    }
  },

  // PSYCHIATRISTS
  {
    id: 'psychiatry-practice',
    name: 'Psychiatry Practice Website',
    description: 'Confidential psychiatry website with secure messaging, teletherapy, and patient resources',
    category: 'Healthcare',
    industry: 'Mental Health',
    targetRole: 'Psychiatrist',
    features: [
      'Secure patient portal',
      'Teletherapy platform',
      'Appointment scheduling',
      'Prescription management',
      'Mental health screening',
      'Crisis resources',
      'Group therapy calendar',
      'Insurance verification',
      'Patient forms',
      'Resource library'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Video API', 'HIPAA Compliance'],
    estimatedTime: '4 weeks',
    difficulty: 'advanced',
    icon: '🧠',
    prompts: {
      initial: 'Build a psychiatry website with teletherapy and secure communication',
      customization: [
        'What conditions do you treat?',
        'Do you offer teletherapy?',
        'Do you prescribe medications?'
      ]
    }
  },

  // INVESTMENT BANKERS
  {
    id: 'investment-banking-firm',
    name: 'Investment Banking Platform',
    description: 'Elite investment banking website with deal showcase, market insights, and client portal',
    category: 'Financial Services',
    industry: 'Investment Banking',
    targetRole: 'Investment Banker',
    features: [
      'Deal tombstone gallery',
      'Market research portal',
      'Transaction tracker',
      'Industry reports',
      'Team expertise matrix',
      'Client portal',
      'Pitch deck library',
      'League table rankings',
      'Press releases',
      'Career opportunities'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Financial APIs', 'Data Room'],
    estimatedTime: '5 weeks',
    difficulty: 'advanced',
    icon: '💼',
    prompts: {
      initial: 'Create an investment banking website with deal showcase and client portal',
      customization: [
        'What sectors do you focus on?',
        'What size deals do you handle?',
        'Do you need pitch deck features?'
      ]
    }
  },

  // HEDGE FUND MANAGERS
  {
    id: 'hedge-fund',
    name: 'Hedge Fund Investor Portal',
    description: 'Sophisticated hedge fund website with performance analytics, investor portal, and compliance',
    category: 'Financial Services',
    industry: 'Hedge Funds',
    targetRole: 'Fund Manager',
    features: [
      'Performance dashboard',
      'Investor portal',
      'Fund documents vault',
      'Subscription management',
      'Redemption requests',
      'Risk analytics',
      'Compliance tracking',
      'Quarterly reports',
      'Limited partner access',
      'Due diligence room'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Bloomberg API', 'Encryption'],
    estimatedTime: '6 weeks',
    difficulty: 'advanced',
    icon: '📈',
    prompts: {
      initial: 'Build a hedge fund platform with investor portal and performance tracking',
      customization: [
        'What\'s your investment strategy?',
        'What\'s your minimum investment?',
        'Do you need K-1 distribution?'
      ]
    }
  },

  // VENTURE CAPITALISTS
  {
    id: 'venture-capital-firm',
    name: 'VC Firm Portfolio Platform',
    description: 'Modern VC website with portfolio showcase, founder resources, and pitch submission',
    category: 'Financial Services',
    industry: 'Venture Capital',
    targetRole: 'VC Partner',
    features: [
      'Portfolio showcase',
      'Pitch deck submission',
      'Founder resources',
      'Team profiles',
      'Investment thesis',
      'News and insights',
      'Event calendar',
      'Job board',
      'LP portal',
      'Exit announcements'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'CRM Integration', 'Analytics'],
    estimatedTime: '4 weeks',
    difficulty: 'intermediate',
    icon: '🚀',
    prompts: {
      initial: 'Create a VC firm website with portfolio showcase and pitch submission',
      customization: [
        'What stages do you invest in?',
        'What sectors do you focus on?',
        'What\'s your typical check size?'
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
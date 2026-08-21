/**
 * Mock ATS data fixtures for testing score tiers and feedback checklists
 * Scenarios:
 * 1. Score 94 - 'Strong Match' (After GitHub sync and AI optimization)
 * 2. Score 72 - 'Moderate' (Decent resume with missing keywords and weak metrics)
 * 3. Score 45 - 'Needs Revision' (Unformatted initial upload with missing sections)
 */

export const mockAtsData94 = {
  score: 94,
  tier: 'Strong Match',
  lastAnalyzed: 'Just now',
  breakdown: {
    actionVerbs: { score: 96, label: 'Excellent', count: 18, target: 15 },
    quantifiableMetrics: { score: 92, label: 'High Impact', count: 12, target: 10 },
    keywordAlignment: { score: 95, label: '95% Target Match', matched: 24, total: 25 },
    formattingCleanliness: { score: 98, label: 'Clean Single-Column', status: 'Optimal' },
  },
  feedback: [
    {
      id: 'fb-94-1',
      status: 'pass',
      category: 'Keyword Alignment',
      tabCategory: 'Keyword Match',
      message: 'Matched 24 of 25 high-priority tech keywords from selected GitHub repositories.',
      suggestion: 'Keywords like "TypeScript", "React 19", "PostgreSQL", and "FastAPI" are prominently positioned in your project bullets.',
    },
    {
      id: 'fb-94-2',
      status: 'pass',
      category: 'Quantifiable Metrics Found',
      tabCategory: 'Bullet Improvements',
      message: '92% of experience and project bullet points contain concrete measurable business outcomes.',
      suggestion: 'Strong metric density (e.g. "reduced latency by 42%", "supporting 15k+ daily requests") satisfies enterprise screening bots.',
    },
    {
      id: 'fb-94-3',
      status: 'pass',
      category: 'Action Verbs Used',
      tabCategory: 'Bullet Improvements',
      message: '18 strong, non-repetitive power verbs utilized across experience sections.',
      suggestion: 'Verbs used: Architected, Spearheaded, Orchestrated, Optimized, Engineered.',
    },
    {
      id: 'fb-94-4',
      status: 'pass',
      category: 'Formatting Cleanliness',
      tabCategory: 'Overview',
      message: 'Standard US Letter margin spacing and standard font hierarchy detected.',
      suggestion: 'Single-column structure parses flawlessly with zero table nesting or unreadable graphics.',
    },
    {
      id: 'fb-94-5',
      status: 'warn',
      category: 'Keyword Alignment',
      tabCategory: 'Keyword Match',
      message: 'Minor optional keyword "Kubernetes / Helm" mentioned only once in skills list.',
      suggestion: 'If targeting DevOps-heavy positions, add a brief mention of Helm deployments inside your backend project bullet.',
    },
  ],
};

export const mockAtsData72 = {
  score: 72,
  tier: 'Moderate',
  lastAnalyzed: '2 hours ago',
  breakdown: {
    actionVerbs: { score: 75, label: 'Good', count: 11, target: 15 },
    quantifiableMetrics: { score: 68, label: 'Moderate Impact', count: 6, target: 10 },
    keywordAlignment: { score: 74, label: '74% Target Match', matched: 17, total: 25 },
    formattingCleanliness: { score: 85, label: 'Standard Structure', status: 'Acceptable' },
  },
  feedback: [
    {
      id: 'fb-72-1',
      status: 'pass',
      category: 'Formatting Cleanliness',
      tabCategory: 'Overview',
      message: 'Standard contact header and clean section headings detected.',
      suggestion: 'ATS parsers successfully recognized Name, Email, Phone, and LinkedIn links.',
    },
    {
      id: 'fb-72-2',
      status: 'warn',
      category: 'Keyword Alignment',
      tabCategory: 'Keyword Match',
      message: 'Missing 8 important backend keywords frequently required in full-stack listings.',
      suggestion: 'Consider including keywords such as "RESTful APIs", "CI/CD Pipeline", and "Redis Caching" from your recent GitHub repos.',
    },
    {
      id: 'fb-72-3',
      status: 'warn',
      category: 'Quantifiable Metrics Found',
      tabCategory: 'Bullet Improvements',
      message: 'Only 6 out of 14 bullet points contain numbers or percentage improvements.',
      suggestion: 'Quantify your achievements by adding user numbers, speedups, or percentage test coverage metrics.',
    },
    {
      id: 'fb-72-4',
      status: 'warn',
      category: 'Action Verbs Used',
      tabCategory: 'Bullet Improvements',
      message: 'Repeated use of generic verbs like "Worked on" and "Helped with" (found 4 times).',
      suggestion: 'Replace passive phrases with impactful verbs: "Engineered", "Designed", "Executed".',
    },
    {
      id: 'fb-72-5',
      status: 'pass',
      category: 'Action Verbs Used',
      tabCategory: 'Overview',
      message: 'Good chronological job progression with distinct timeline dates.',
      suggestion: 'All employment dates follow a standard "Month Year – Month Year" machine-readable format.',
    },
  ],
};

export const mockAtsData45 = {
  score: 45,
  tier: 'Needs Revision',
  lastAnalyzed: '1 day ago',
  breakdown: {
    actionVerbs: { score: 40, label: 'Weak', count: 5, target: 15 },
    quantifiableMetrics: { score: 35, label: 'Missing Data', count: 2, target: 10 },
    keywordAlignment: { score: 48, label: '48% Target Match', matched: 9, total: 25 },
    formattingCleanliness: { score: 55, label: 'Parsing Risks', status: 'Needs Fixes' },
  },
  feedback: [
    {
      id: 'fb-45-1',
      status: 'fail',
      category: 'Keyword Alignment',
      tabCategory: 'Keyword Match',
      message: 'Low keyword relevance with target software engineering job postings (under 50%).',
      suggestion: 'Connect your GitHub profile and let the AI auto-populate modern framework tags and project summaries.',
    },
    {
      id: 'fb-45-2',
      status: 'fail',
      category: 'Quantifiable Metrics Found',
      tabCategory: 'Bullet Improvements',
      message: 'Almost all project descriptions lack measurable results or impact figures.',
      suggestion: 'Add concrete numbers. Example: "Improved load times by 35% by implementing Redis caching".',
    },
    {
      id: 'fb-45-3',
      status: 'fail',
      category: 'Action Verbs Used',
      tabCategory: 'Bullet Improvements',
      message: 'Over-reliance on passive duty lists rather than accomplishment-oriented action verbs.',
      suggestion: 'Replace "Responsible for bug fixes" with "Resolved 40+ high-priority production bugs".',
    },
    {
      id: 'fb-45-4',
      status: 'warn',
      category: 'Formatting Cleanliness',
      tabCategory: 'Overview',
      message: 'Inconsistent date formatting across work experience items.',
      suggestion: 'Standardize all dates to "Jan 2023 - Present" to avoid ATS date confusion.',
    },
    {
      id: 'fb-45-5',
      status: 'pass',
      category: 'Formatting Cleanliness',
      tabCategory: 'Overview',
      message: 'Contact email address and phone number found in plain text.',
      suggestion: 'Contact details are readable without image OCR.',
    },
  ],
};

export const mockScenarios = {
  94: mockAtsData94,
  72: mockAtsData72,
  45: mockAtsData45,
};

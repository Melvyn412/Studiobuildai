// Local parsing dictionary for secure skill evaluations
const SKILL_DATABASE: Record<string, string[]> = {
  'Engineering': [
    'react', 'typescript', 'javascript', 'node.js', 'express', 'postgresql', 'sql',
    'system design', 'aws', 'git', 'jest', 'mongodb', 'rest apis', 'ci/cd', 'docker',
    'python', 'rust', 'c++', 'go', 'redis', 'microservices', 'kubernetes', 'html', 'css'
  ],
  'HR & Legal': [
    'ats', 'sourcing', 'onboarding', 'hris', 'compliance', 'benefits', 'interviewing',
    'conflict resolution', 'employee engagement', 'labor law', 'recruiter', 'payroll',
    'policy', 'conflict', 'mediation', 'dispute', 'recruitment', 'grievance', 'osha'
  ],
  'Marketing': [
    'seo', 'content strategy', 'google analytics', 'social media', 'copywriting',
    'email marketing', 'ppc', 'crm', 'brand management', 'a/b testing', 'kpis',
    'advertising', 'copywriter', 'analytics', 'growth', 'funnel', 'campaign'
  ],
  'Product Management': [
    'agile', 'scrum', 'roadmap', 'user stories', 'prds', 'wireframing', 'sql',
    'market research', 'cross-functional', 'data analytics', 'customer discovery',
    'jira', 'backlog', 'prioritization', 'product lifecycle', 'metrics', 'mvp'
  ],
  'Finance & Sales': [
    'sales', 'lead generation', 'cold calling', 'negotiation', 'pipeline', 'crm',
    'forecasting', 'bookkeeping', 'excel', 'financial modeling', 'audit', 'tax',
    'budgeting', 'compliance', 'b2b', 'prospecting', 'account management'
  ]
};

// Simple Regex parsing for contact details (completely client-side)
export function parseResumeMetadata(text: string) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  
  const emails = text.match(emailRegex);
  const phones = text.match(phoneRegex);
  
  // Try to find candidate name by splitting lines and looking for a reasonable capitalized name on lines 1 & 2
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let name = 'Identified Candidate';
  
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length < 50 && /^[a-zA-Z\s.-]+$/.test(firstLine)) {
      name = firstLine;
    } else if (lines.length > 1) {
      const secondLine = lines[1];
      if (secondLine.length < 50 && /^[a-zA-Z\s.-]+$/.test(secondLine)) {
        name = secondLine;
      }
    }
  }

  return {
    name,
    email: emails ? emails[0] : 'not-found@local.internal',
    phone: phones ? phones[0] : 'N/A'
  };
}

// Client-side Resume Matching algorithm
export function analyzeResumeLocally(
  resumeText: string,
  department: string,
  targetRole: string
) {
  const normalizedText = resumeText.toLowerCase();
  const definedSkills = SKILL_DATABASE[department] || SKILL_DATABASE['Engineering'];
  
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  definedSkills.forEach(skill => {
    // Escape string for regex safety
    const safeSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const skillRegex = new RegExp(`\\b${safeSkill}\\b|\\b${safeSkill}s\\b`, 'i');
    if (skillRegex.test(normalizedText)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // Calculate matching score out of 100
  let score = 0;
  if (definedSkills.length > 0) {
    score = Math.round((matchedSkills.length / Math.min(definedSkills.length, 12)) * 100);
    if (score > 100) score = 100;
  } else {
    score = 50; // Neutral default
  }

  // Adjust score if targetRole terms are explicitly mentioned in Resume
  const roleTerms = targetRole.toLowerCase().split(/\s+/).filter(t => t.length > 3);
  let roleTermMatches = 0;
  roleTerms.forEach(term => {
    if (normalizedText.includes(term)) {
      roleTermMatches++;
    }
  });
  if (roleTerms.length > 0) {
    score += Math.round((roleTermMatches / roleTerms.length) * 15);
    if (score > 100) score = 100;
  }

  // Generate actionable, context-rich recommendations
  const recommendations: string[] = [];
  if (score >= 80) {
    recommendations.push(`Excellent fit for the "${targetRole}" position. Proceed with priority scheduling.`);
    recommendations.push('Focus technical vetting on project lead potential and team collaboration styles.');
  } else if (score >= 55) {
    recommendations.push(`Moderate potential fit. Skill gaps detected in key areas: ${missingSkills.slice(0, 3).join(', ')}.`);
    recommendations.push('We recommend administering a local screening task to verify core competency.');
  } else {
    recommendations.push(`Weak correlation to predefined skills checklist for "${department}".`);
    recommendations.push(`Recommend screening for alternative roles or reviewing candidate portfolio for alternative evidence.`);
  }

  if (missingSkills.length > 0) {
    recommendations.push(`Explore candidate understanding of: ${missingSkills.slice(0, 2).join(', ')} in introductory screening.`);
  }

  const parsedContact = parseResumeMetadata(resumeText);

  return {
    candidateName: parsedContact.name,
    email: parsedContact.email,
    phone: parsedContact.phone,
    score,
    matchedSkills: matchedSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    missingSkills: missingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    recommendations
  };
}

// Redact or mask sensitive information to enforce HR confidentiality
export function maskSensitiveValue(value: string | number, type: 'email' | 'salary' | 'phone', isMasked: boolean): string {
  if (!isMasked) {
    if (type === 'salary') {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(Number(value));
    }
    return String(value);
  }

  const str = String(value);
  if (type === 'salary') {
    return '£**,***';
  }
  if (type === 'phone') {
    return '***-***-****';
  }
  if (type === 'email') {
    const [user, domain] = str.split('@');
    if (!user || !domain) return '***@***.***';
    const maskedUser = user.slice(0, 2) + '*'.repeat(Math.max(2, user.length - 2));
    const [domainName, ext] = domain.split('.');
    const maskedDomain = domainName.slice(0, 1) + '*'.repeat(Math.max(1, domainName.length - 1)) + '.' + (ext || '***');
    return `${maskedUser}@${maskedDomain}`;
  }
  return '*****';
}

// Generate secure printable view helper
export function generatePrintableText(title: string, content: string): string {
  return `==========================================\n${title.toUpperCase()}\n==========================================\n\n${content}\n\nGenerated Securely 100% Offline via Private HR Assistant\nTimestamp: ${new Date().toLocaleString()}\n==========================================`;
}

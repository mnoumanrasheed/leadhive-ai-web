export const primaryLead = {
  name: 'Amelia Carter',
  initials: 'AC',
  role: 'Operations Director',
  company: 'Northstar Retail',
  message: "We're planning a 20-site rollout next month. Can you share enterprise pricing?",
  purchaseIntent: 'High',
  deployment: '20 locations',
  region: 'UK',
  timeline: 'Next month',
  score: 92,
}

export const additionalLeads = [
  { name: 'Daniel Brooks', initials: 'DB', role: 'Procurement Lead', company: 'Vertex Commercial', note: 'Pricing requested · WhatsApp', score: 84 },
  { name: 'Priya Shah',    initials: 'PS', role: 'Growth Director',   company: 'Meridian Group',   note: 'Demo requested · Instagram',  score: 78 },
]

export const salesRepresentative = {
  name: 'Jordan Blake',
  initials: 'JB',
  role: 'Enterprise Sales',
}

export const qualificationSignals = [
  ['Purchase Intent', primaryLead.purchaseIntent],
  ['Deployment', primaryLead.deployment],
  ['Region', primaryLead.region],
  ['Timeline', primaryLead.timeline],
]
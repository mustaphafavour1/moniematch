import type { NavLink, FeatureCard, ProblemPair, HowItWorksStep, FAQItem, AlgoRow } from './types'

export const NAV_LINKS: NavLink[] = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features',     href: '/features' },
  { label: 'About',        href: '/about' },
  { label: 'Contact Us',   href: '/contact' },
  { label: 'FAQ',          href: '#faq' },
  { label: 'Sign In',      href: '/signin' },
]

export const TICKER_PHRASES = [
  'Sow your 100k, pluck 20k fruits monthly',
  'We\'re the Tinder for Investors and Investees',
  'Plug your business to the right socket',
  'Latest Solopportunity for SoloPreneurs',
  'You\'re 1 Match away from the hottest business in town',
  'Funds to let — Self-con, 2-man, 3-man businesses accepted',
  'Eat the fruit of your labour like a King',
  'We perform matchmaking miracles for small businesses',
]

export const FEATURE_CARDS: FeatureCard[] = [
  {
    num: '01',
    title: 'Smart Algorithm Matching',
    description: 'A 5-factor engine scores every investor-business pair out of 99. The higher the score, the stronger the match — surfaced automatically.',
    visual: 'score',
  },
  {
    num: '02',
    title: 'Verified Businesses',
    description: 'Every business is verified before going live. Real names, real categories, real locations. No ghost listings, no bad surprises when you get there.',
    visual: 'pills-verified',
  },
  {
    num: '03',
    title: 'In-App Deal Negotiation',
    description: 'Propose, counter-propose, and close entirely on MonieMatch. Chat, agree terms, sign the deal. No WhatsApp confusion, no lost agreements.',
    visual: 'chat',
  },
  {
    num: '04',
    title: 'Monthly Revenue Reports',
    description: 'Business owners submit monthly reports in various formats — voice, text, images. Investors stay informed. Trust is built in, not assumed.',
    visual: 'report',
  },
  {
    num: '05',
    title: 'Live Portfolio Tracking',
    description: 'All your active deals, pending returns, and performance in one clean dashboard. Know exactly where every naira is working.',
    visual: 'portfolio',
  },
  {
    num: '06',
    title: 'Flexible Return Structures',
    description: 'Fixed monthly, revenue share, or profit split — you negotiate what works for both sides. Every deal is custom-built for your situation.',
    visual: 'pills-return',
  },
]

export const PROBLEM_PAIRS: ProblemPair[] = [
  {
    left: {
      icon: 'landmark',
      tag: 'The old way',
      title: 'Banks turned small businesses away.',
      desc: 'No collateral, no connections, no credit history — formal lenders weren\'t built for the informal economy. Bakers, tailors, and barbers were locked out.',
    },
    right: {
      icon: 'badge-check',
      tag: 'MonieMatch',
      title: 'We connect you with people, not institutions.',
      desc: 'Everyday investors who believe in your hustle. No paperwork gatekeepers. Verified profiles, smart matching, and a handshake backed by a signed digital deal.',
    },
  },
  {
    flip: true,
    left: {
      icon: 'trending-down',
      tag: 'The old way',
      title: 'Savings accounts earned 4% while inflation ran wild.',
      desc: 'Your ₦500k sat in a savings account doing nothing. Meanwhile, verified businesses in your city were growing and needed exactly that amount to scale.',
    },
    right: {
      icon: 'sprout',
      tag: 'MonieMatch',
      title: 'Sow your seeds in the right spots. Pluck monthly.',
      desc: 'Invest in a verified bakery, fashion designer, or photographer. Set your terms. Receive monthly reports. Earn structured returns — not as a promise, as a signed deal.',
    },
  },
  {
    left: {
      icon: 'handshake',
      tag: 'The old way',
      title: 'Handshake deals with no structure went wrong.',
      desc: 'You lent money to a cousin\'s business. No agreement. No reports. Six months later, nothing. Good relationship, bad deal. The informal economy needed structure.',
    },
    right: {
      icon: 'file-text',
      tag: 'MonieMatch',
      title: 'Digital deal. Monthly report. Paper trail for everything.',
      desc: 'Every deal is signed in-app. Every month, the business submits a revenue report. Every naira is accounted for. Trust is built in — not just assumed.',
    },
  },
]

export const HOW_IT_WORKS_INVESTOR: HowItWorksStep[] = [
  { num: '01', icon: 'user-round',    title: 'Set Up Your Profile',     desc: 'Tell us your investment range, preferred industries, and how you want returns. Takes 3 minutes.' },
  { num: '02', icon: 'target',        title: 'Browse Your Matches',     desc: 'Our algorithm surfaces businesses that score highest against your exact preferences. No irrelevant listings.' },
  { num: '03', icon: 'handshake',     title: 'Propose & Close the Deal',desc: 'Initiate a deal, negotiate terms via chat, sign the agreement, and send funds. All on MonieMatch.' },
  { num: '04', icon: 'leaf',          title: 'Pluck Your Returns',      desc: 'Receive monthly revenue reports. Watch your portfolio grow. Eat the fruit of your labour like a king.' },
]

export const HOW_IT_WORKS_BUSINESS: HowItWorksStep[] = [
  { num: '01', icon: 'store',         title: 'List Your Business',      desc: 'Describe your business, state your funding need, and explain how you\'ll use and repay the investment.' },
  { num: '02', icon: 'zap',           title: 'Get Auto-Matched',        desc: 'Our engine matches you instantly with investors whose goals align with yours. No cold pitching required.' },
  { num: '03', icon: 'file-signature',title: 'Review Offers & Sign',    desc: 'Check investor offers, counter if needed, sign the digital agreement, and receive your funds.' },
  { num: '04', icon: 'bar-chart-2',   title: 'Report. Grow. Repeat.',   desc: 'Submit monthly revenue updates with voice-to-text. Keep investors informed. Build trust. Raise more.' },
]

export const INVESTOR_BENEFITS = [
  { strong: 'AI-powered matching',      rest: ' — only businesses that fit your exact criteria reach you.' },
  { strong: 'Monthly revenue reports',  rest: ' — every business owner sends verified updates. No ghosting.' },
  { strong: 'Flexible structures',      rest: ' — monthly fixed, revenue share, or profit split. You negotiate what works.' },
  { strong: 'Any amount',               rest: ' — from ₦50k to ₦5M, there\'s a matching business waiting for you.' },
]

export const BUSINESS_CATEGORIES = [
  { icon: 'scissors',    label: 'Fashion & Tailoring' },
  { icon: 'cake',        label: 'Bakeries & Food' },
  { icon: 'scissors',    label: 'Barbers & Salons' },
  { icon: 'camera',      label: 'Photography' },
  { icon: 'shopping-bag',label: 'Retail & Trading' },
  { icon: 'monitor',     label: 'Tech & Digital' },
]

export const ALGO_ROWS: AlgoRow[] = [
  { icon: 'banknote',    label: 'Amount Match',     pct: 100, points: 30 },
  { icon: 'bar-chart-2', label: 'Return Structure', pct: 83,  points: 25 },
  { icon: 'tag',         label: 'Category Match',   pct: 67,  points: 20 },
  { icon: 'calendar',    label: 'Report Cadence',   pct: 50,  points: 15 },
  { icon: 'map-pin',     label: 'Location',         pct: 33,  points: 10 },
]

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How does MonieMatch match me with the right businesses?',
    answer:   'Our algorithm scores every investor-business pair across 5 factors: investment amount overlap (30pts), return structure preference (25pts), reporting cadence (15pts), business category (20pts), and location (10pts). The result is a compatibility score out of 99. We surface your top matches automatically.',
  },
  {
    question: 'What kinds of businesses are on MonieMatch?',
    answer:   'Fashion designers, bakers, barbers, photographers, retailers, tech freelancers — any Nigerian small business that\'s real and has a funding need. We support 80+ business categories with smart fuzzy matching.',
  },
  {
    question: 'How much can I invest? Is there a minimum?',
    answer:   'No platform minimum. Investors set their own range — from ₦50,000 upwards. The matching engine only connects you with businesses whose funding needs overlap with your range.',
  },
  {
    question: 'How are returns structured and paid?',
    answer:   'You negotiate the structure before signing — fixed monthly payments, revenue-share percentages, or profit splits. Terms are per-deal. For MVP, fund movement happens directly between parties. MonieMatch handles matching, deal agreements, and reporting. Escrow is coming.',
  },
  {
    question: 'Is my money safe? What if the business defaults?',
    answer:   'MonieMatch facilitates and documents deals — we don\'t hold your money. Every business signs a digital agreement and all terms are on record. As with any investment, returns are not guaranteed. Invest amounts you\'re comfortable with.',
  },
  {
    question: 'I don\'t have a CAC-registered business. Can I still list?',
    answer:   'Yes. MonieMatch was built for the informal economy. Your business doesn\'t need formal registration to list — we verify basic business info and auto-activate your listing. Solopreneurs fully welcome.',
  },
  {
    question: 'When is the mobile app dropping?',
    answer:   'We\'re building it now. Join the waitlist below and we\'ll email you the moment it goes live. The full platform is already live at moniematch.com/app — fully optimised for your phone.',
  },
]

export const GOOGLE_FORMS = {
  contact: {
    url:    'https://docs.google.com/forms/d/e/1FAIpQLSfc9KSB-AtK3NkKuKgWMcC7opEUyYEMmMICY_1FrR7F6xYHSA/formResponse',
    fields: {
      name:    'entry.1110611512',
      email:   'entry.272099443',
      role:    'entry.1462487102',
      message: 'entry.891114078',
    },
  },
  waitlist: {
    url:    'https://docs.google.com/forms/d/e/1FAIpQLScMduQI5K_WOSm3-9UN3MchcPwLIZMNv597nkCDeiJ2SciubA/formResponse',
    fields: {
      name:  'entry.1110611512',
      email: 'entry.272099443',
    },
  },
}

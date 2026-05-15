export interface NavLink {
  label: string
  href: string
}

export interface FeatureCard {
  num: string
  title: string
  description: string
  visual: 'score' | 'pills-verified' | 'chat' | 'report' | 'portfolio' | 'pills-return'
}

export interface ProblemPair {
  flip?: boolean
  left: {
    icon: string
    tag: string
    title: string
    desc: string
  }
  right: {
    icon: string
    tag: string
    title: string
    desc: string
  }
}

export interface HowItWorksStep {
  num: string
  icon: string
  title: string
  desc: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface AlgoRow {
  icon: string
  label: string
  pct: number
  points: number
}

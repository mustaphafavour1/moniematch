'use client'
import { useState } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'
import { HOW_IT_WORKS_INVESTOR, HOW_IT_WORKS_BUSINESS } from '@/lib/constants'
import type { HowItWorksStep } from '@/lib/types'

// Simple inline icon component using lucide path data
const STEP_ICONS: Record<string, string> = {
  'user-round':     'M18 20a6 6 0 0 0-12 0M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'target':         'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  'handshake':      'M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l1.06 1.06L12 21.23l7.36-7.94 1.06-1.06a5.4 5.4 0 0 0 0-7.65z',
  'leaf':           'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12',
  'store':          'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
  'zap':            'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  'file-signature': 'M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L18 5.5M15 3v4h4M8 13h1M8 17h1M12 13h4M12 17h4',
  'bar-chart-2':    'M18 20V10M12 20V4M6 20v-6',
}

function StepIcon({ name }: { name: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d={STEP_ICONS[name] ?? ''} />
    </svg>
  )
}

function StepCard({ step, index }: { step: HowItWorksStep; index: number }) {
  return (
    <div className={`hs rv d${index + 1}`}>
      <span className="hn">{step.num}</span>
      <div className="h-ico"><StepIcon name={step.icon} /></div>
      <div className="htit">{step.title}</div>
      <p className="hdesc">{step.desc}</p>
    </div>
  )
}

export default function HowItWorks() {
  const [tab, setTab] = useState<'inv' | 'biz'>('inv')

  return (
    <section id="how-it-works" style={{ padding: '96px 0', background: 'var(--cream)' }}>
      <div className="section-w">
        <div className="rv" style={{ textAlign: 'center', marginBottom: 52 }}>
          <SectionLabel>How It Works</SectionLabel>
          <h2 className="sh2" style={{ marginTop: 16 }}>
            As simple as sow, match, <em className="em">earn.</em>
          </h2>
        </div>

        <div className="htabs rv">
          <button className={`ht ${tab === 'inv' ? 'on' : ''}`} onClick={() => setTab('inv')}>
            I&apos;m an Investor
          </button>
          <button className={`ht ${tab === 'biz' ? 'on' : ''}`} onClick={() => setTab('biz')}>
            I&apos;m a Business Owner
          </button>
        </div>

        <div className="hsteps">
          {(tab === 'inv' ? HOW_IT_WORKS_INVESTOR : HOW_IT_WORKS_BUSINESS).map((step, i) => (
            <StepCard key={step.num} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

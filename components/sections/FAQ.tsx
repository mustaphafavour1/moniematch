'use client'
import { useState } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'
import { FAQ_ITEMS } from '@/lib/constants'

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" style={{ padding: '96px 0', background: 'var(--cream)' }}>
      <div className="section-w">
        <div className="rv" style={{ textAlign: 'center', marginBottom: 60 }}>
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="sh2" style={{ marginTop: 16 }}>Questions? We got you.</h2>
        </div>

        <div className="fq-list" style={{ maxWidth: 700, margin: '0 auto' }}>
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div key={i} className={`fq-item ${isOpen ? 'o' : ''}`}>
                <button className="fq-q" onClick={() => setOpenIndex(isOpen ? null : i)}>
                  {item.question}
                  <span className="fq-ico"><PlusIcon /></span>
                </button>
                <div className="fq-a">
                  <p>{item.answer}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

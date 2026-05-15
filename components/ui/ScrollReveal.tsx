'use client'
import { useEffect } from 'react'

export default function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.rv, .rl, .rr')
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('v') }),
      { threshold: 0.1, rootMargin: '0px 0px -36px 0px' }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return null
}

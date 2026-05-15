'use client'
import { useEffect } from 'react'

export default function ProgressBar() {
  useEffect(() => {
    const bar = document.getElementById('progress-bar')
    if (!bar) return
    const onScroll = () => {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      bar.style.width = pct + '%'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return <div id="progress-bar" aria-hidden="true" />
}

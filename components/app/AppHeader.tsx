import React from 'react'

export function AppHeader({ title, leading, trailing, sticky=false }: {
  title: string
  leading?: React.ReactNode
  trailing?: React.ReactNode
  sticky?: boolean
}) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'10px 16px', gap:8,
      background:'var(--cream)',
      ...(sticky ? { position:'sticky', top:0, zIndex:10, backdropFilter:'blur(10px)' } : {}),
    }}>
      <div style={{width:38, display:'flex', alignItems:'center'}}>{leading}</div>
      <div style={{flex:1, textAlign:'center', fontFamily:'var(--font-display)', fontSize:17, fontWeight:600, color:'var(--ink)'}}>
        {title}
      </div>
      <div style={{width:38, display:'flex', alignItems:'center', justifyContent:'flex-end'}}>{trailing}</div>
    </div>
  )
}

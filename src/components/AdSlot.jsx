import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase.js'

const LAYOUTS = {
  sidebar: {
    width: '100%', maxWidth: 280, padding: 20, fontSize: 14, stack: true
  },
  horizontal: {
    width: '100%', maxWidth: 900, padding: 18, fontSize: 14, stack: false
  },
  inline: {
    width: '100%', padding: 16, fontSize: 13, stack: false
  }
}

export default function AdSlot({ layout = 'horizontal' }) {
  const [ad, setAd] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const impressionLogged = useRef(false)

  useEffect(() => {
    let active = true
    async function fetchAd() {
      try {
        const now = new Date().toISOString()
        const { data } = await supabase
          .from('business_ads')
          .select('id, business_name, headline, description, cta_text, cta_url, image_url, category')
          .eq('status', 'active')
          .gt('expires_at', now)
          .limit(10)

        if (!active) return
        if (data && data.length > 0) {
          const random = data[Math.floor(Math.random() * data.length)]
          setAd(random)
        }
        setLoaded(true)
      } catch {
        if (active) setLoaded(true)
      }
    }
    fetchAd()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!ad || impressionLogged.current) return
    impressionLogged.current = true
    supabase.from('ad_interactions').insert({
      ad_id: ad.id, interaction_type: 'impression'
    }).then(() => {}, () => {})
  }, [ad])

  async function handleClick() {
    if (!ad) return
    try {
      await supabase.from('ad_interactions').insert({
        ad_id: ad.id, interaction_type: 'click'
      })
    } catch {}
  }

  // Hide the slot entirely if no ads
  if (!loaded) return null
  if (!ad) return null

  const cfg = LAYOUTS[layout] || LAYOUTS.horizontal
  const stack = cfg.stack

  return (
    <aside style={{
      position: 'relative',
      background: 'var(--white)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-lg)',
      padding: cfg.padding,
      width: cfg.width,
      maxWidth: cfg.maxWidth,
      display: 'flex',
      flexDirection: stack ? 'column' : 'row',
      alignItems: stack ? 'stretch' : 'center',
      gap: 16,
      overflow: 'hidden'
    }}>
      <span style={{
        position: 'absolute', top: 8, right: 10,
        fontSize: 10, color: 'var(--ink-muted)',
        textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600
      }}>Sponsored</span>

      {ad.image_url && (
        <div style={{
          width: stack ? '100%' : 120,
          height: stack ? 140 : 80,
          background: `url(${ad.image_url}) center/cover`,
          borderRadius: 10, flexShrink: 0
        }} />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        {ad.business_name && (
          <div style={{ fontSize: 11, color: 'var(--ink-muted)', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {ad.business_name}
          </div>
        )}
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: layout === 'sidebar' ? 17 : 16, color: 'var(--ink)',
          marginBottom: 4, lineHeight: 1.25
        }}>
          {ad.headline}
        </div>
        {ad.description && (
          <div style={{ fontSize: cfg.fontSize, color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: 10 }}>
            {ad.description}
          </div>
        )}
        {ad.cta_url && (
          <a
            href={ad.cta_url}
            target="_blank"
            rel="noopener sponsored"
            onClick={handleClick}
            className="btn btn-ghost"
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            {ad.cta_text || 'Learn more'} →
          </a>
        )}
      </div>
    </aside>
  )
}

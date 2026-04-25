import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

// Hardcoded fallback for the 7 most diverse suburbs in case the
// suburb_guides table isn't populated yet.
const FALLBACK = [
  { suburb: 'Lakemba',    state: 'NSW', median_rent_weekly: 480, hero_image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900', cultural_tags: ['🕌 Halal-friendly', '🇱🇧 Lebanese community', '🚆 Rail link'] },
  { suburb: 'Cabramatta', state: 'NSW', median_rent_weekly: 520, hero_image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900', cultural_tags: ['🥢 Vietnamese hub', '🛍 Asian markets', '🌏 Multilingual'] },
  { suburb: 'Newtown',    state: 'NSW', median_rent_weekly: 720, hero_image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900', cultural_tags: ['🏳️‍🌈 LGBTQIA+ inclusive', '🎨 Arts & cafés', '🚆 Inner West rail'] },
  { suburb: 'Eastwood',   state: 'NSW', median_rent_weekly: 650, hero_image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=900', cultural_tags: ['👨‍🏫 Mandarin schools', '🥟 Asian dining', '👨‍👩‍👧 Family-oriented'] },
  { suburb: 'Harris Park',state: 'NSW', median_rent_weekly: 540, hero_image_url: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=900', cultural_tags: ['🇮🇳 Indian community', '🍛 Indian dining', '🚆 Parramatta rail'] },
  { suburb: 'Auburn',     state: 'NSW', median_rent_weekly: 510, hero_image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900', cultural_tags: ['🕌 Mosques nearby', '🥙 Middle Eastern food', '🌏 Multicultural'] },
  { suburb: 'Blacktown',  state: 'NSW', median_rent_weekly: 470, hero_image_url: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=900', cultural_tags: ['👨‍👩‍👧 Family-friendly', '🌏 Diverse community', '🚆 T1 line'] }
]

function slugify(s, st) {
  return `${(s || '').toLowerCase().replace(/\s+/g, '-')}-${(st || '').toLowerCase()}`
}

export default function SuburbShowcase() {
  const [suburbs, setSuburbs] = useState([])
  const trackRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data } = await supabase
          .from('suburb_guides')
          .select('suburb, state, summary, hero_image_url, median_rent_weekly, cultural_tags, featured, display_order')
          .order('display_order', { ascending: true })
          .limit(7)
        if (cancelled) return
        if (data && data.length >= 3) {
          // Patch missing fields from fallback so cards always look polished
          const merged = data.map(d => {
            const fb = FALLBACK.find(f => f.suburb.toLowerCase() === (d.suburb || '').toLowerCase()) || FALLBACK[0]
            return {
              ...fb,
              ...d,
              hero_image_url: d.hero_image_url || fb.hero_image_url,
              median_rent_weekly: d.median_rent_weekly || fb.median_rent_weekly,
              cultural_tags: (Array.isArray(d.cultural_tags) && d.cultural_tags.length > 0) ? d.cultural_tags : fb.cultural_tags
            }
          })
          setSuburbs(merged)
        } else {
          setSuburbs(FALLBACK)
        }
      } catch {
        if (!cancelled) setSuburbs(FALLBACK)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Scroll-driven parallax on each card's background image
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf
    function update() {
      const cards = track.querySelectorAll('.suburb-card')
      const trackRect = track.getBoundingClientRect()
      const trackCenter = trackRect.left + trackRect.width / 2
      cards.forEach(card => {
        const r = card.getBoundingClientRect()
        const cardCenter = r.left + r.width / 2
        const delta = cardCenter - trackCenter
        const bg = card.querySelector('.suburb-card-bg')
        if (bg) bg.style.transform = `translate3d(${delta * -0.07}px, 0, 0) scale(1.08)`
      })
    }
    function onScroll() {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    track.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      track.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [suburbs])

  if (suburbs.length === 0) return null

  return (
    <section className="suburb-showcase">
      <div className="suburb-showcase-head">
        <h2>Where newcomers <em>thrive.</em></h2>
        <p>Suburbs hand-picked for cultural community, transport, and the quiet things that matter when you're starting fresh.</p>
      </div>
      <div className="suburb-showcase-track" ref={trackRef}>
        {suburbs.map(s => (
          <Link
            key={`${s.suburb}-${s.state}`}
            to={`/suburbs/${slugify(s.suburb, s.state)}`}
            className="suburb-card"
          >
            <div className="suburb-card-bg" style={{ backgroundImage: `url(${s.hero_image_url})` }} />
            <div className="suburb-card-overlay" />
            <div className="suburb-card-content">
              <h3>{s.suburb}</h3>
              <div className="suburb-tags">
                {(s.cultural_tags || []).slice(0, 3).map((tag, i) => (
                  <span className="suburb-tag" key={i}>{tag}</span>
                ))}
              </div>
              <p className="suburb-rent">
                {s.median_rent_weekly ? <>From <strong>${s.median_rent_weekly}</strong>/wk</> : 'Explore listings'}
              </p>
              <span className="suburb-link">Explore →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

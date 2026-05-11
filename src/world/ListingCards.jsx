import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { geoToWorld } from './coords.js'
import { STATE_CENTERS, jitterFromString } from './data/state-centers.js'
import { CITIES } from './data/cities.js'
import PhotoCard from './PhotoCard.jsx'

const MAX_CARDS = 14
const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80&auto=format'

function firstPhoto(listing) {
  const imgs = listing.image_urls
  if (Array.isArray(imgs) && typeof imgs[0] === 'string' && imgs[0].length > 0) return imgs[0]
  return FALLBACK_PHOTO
}

function projectListing(listing) {
  const center = STATE_CENTERS[listing.state] || STATE_CENTERS.NSW
  const [jx, jz] = jitterFromString(String(listing.id || listing.suburb || ''), 1)
  const [x, z] = geoToWorld(center.lat, center.lng)
  return [x + jx * 1.4, z + jz * 1.0]
}

function formatPrice(l) {
  if (l.mode === 'sale') return l.price ? `$${Math.round(l.price / 1000)}k` : ''
  if (l.price_weekly) return `$${l.price_weekly}/wk`
  return ''
}

function Anchor({ x, y, z }) {
  return (
    <>
      <mesh position={[x, y / 2, z]}>
        <cylinderGeometry args={[0.012, 0.012, y, 6]} />
        <meshStandardMaterial color="#ffe6c8" emissive="#ffb878" emissiveIntensity={1.4} transparent opacity={0.85} />
      </mesh>
      <mesh position={[x, 0.1, z]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#fff6e6" emissive="#ffb878" emissiveIntensity={3} />
      </mesh>
    </>
  )
}

export default function ListingCards() {
  const [listings, setListings] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    supabase
      .from('properties')
      .select('id, suburb, state, mode, price_weekly, price, image_urls, bedrooms')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(MAX_CARDS)
      .then(({ data, error }) => {
        if (!active) return
        if (error || !Array.isArray(data)) {
          setListings([])
        } else {
          setListings(data)
        }
      })
    return () => { active = false }
  }, [])

  // Loading state — render nothing (HDRI sky + continent are enough)
  if (listings === null) return null

  // If we have real listings, render them as photo cards
  if (listings.length > 0) {
    return (
      <group>
        {listings.map((l, i) => {
          const [x, z] = projectListing(l)
          const y = 1.4 + (i % 3) * 0.32
          const rotY = -x / 22 // gentle face-toward-centre rotation
          return (
            <group key={l.id}>
              <Anchor x={x} y={y} z={z} />
              <PhotoCard
                position={[x, y, z]}
                rotationY={rotY}
                width={1.1}
                height={0.72}
                photo={firstPhoto(l)}
                label={l.suburb || 'Listing'}
                sublabel={[l.state, formatPrice(l)].filter(Boolean).join(' · ')}
                tilt={-0.08}
                onClick={() => navigate(`/property/${l.id}`)}
              />
            </group>
          )
        })}
      </group>
    )
  }

  // No active listings yet — fall back to city anchors so the world
  // isn't bare. These cards link to the city's state search.
  return (
    <group>
      {CITIES.map((c, i) => {
        const [x, z] = geoToWorld(c.lat, c.lng)
        const y = 1.5 + (i % 3) * 0.32
        const rotY = -x / 22
        return (
          <group key={c.slug}>
            <Anchor x={x} y={y} z={z} />
            <PhotoCard
              position={[x, y, z]}
              rotationY={rotY}
              width={1.1}
              height={0.72}
              photo={c.photo}
              label={c.name}
              sublabel={c.state}
              tilt={-0.08}
              onClick={() => navigate(`/search?state=${c.state}`)}
            />
          </group>
        )
      })}
    </group>
  )
}

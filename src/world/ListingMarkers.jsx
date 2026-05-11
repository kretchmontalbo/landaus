import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { geoToWorld } from './coords.js'
import { STATE_CENTERS, jitterFromString } from './data/state-centers.js'
import PhotoCard from './PhotoCard.jsx'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80&auto=format'

function projectListing(listing) {
  const center = STATE_CENTERS[listing.state] || STATE_CENTERS.NSW
  const [jx, jz] = jitterFromString(listing.id || listing.suburb || '', 0)
  const [x, z] = geoToWorld(center.lat, center.lng)
  return [x + jx * 1.6, z + jz * 1.6]
}

function firstPhoto(images) {
  if (Array.isArray(images) && images.length > 0 && typeof images[0] === 'string') return images[0]
  return PLACEHOLDER
}

export default function ListingMarkers() {
  const [listings, setListings] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    supabase
      .from('properties')
      .select('id, suburb, state, mode, price_weekly, price, image_urls, bedrooms')
      .eq('status', 'active')
      .limit(40)
      .then(({ data }) => {
        if (!active) return
        setListings(Array.isArray(data) ? data : [])
      })
    return () => { active = false }
  }, [])

  return (
    <group>
      {listings.map((l, i) => {
        const [x, z] = projectListing(l)
        const y = 0.7 + (i % 4) * 0.18
        const rotY = Math.atan2(-x, -z)
        const photo = firstPhoto(l.image_urls)
        const price = l.mode === 'sale'
          ? (l.price ? `$${Math.round(l.price / 1000)}k` : '')
          : (l.price_weekly ? `$${l.price_weekly}/wk` : '')
        const sub = [l.suburb, price].filter(Boolean).join(' · ')
        return (
          <PhotoCard
            key={l.id}
            position={[x, y, z]}
            rotationY={rotY}
            width={0.95}
            height={0.65}
            photo={photo}
            label={l.bedrooms ? `${l.bedrooms} bed` : 'Rental'}
            sublabel={sub}
            onClick={() => navigate(`/property/${l.id}`)}
            tilt={-0.05}
            hoverScale={1.08}
          />
        )
      })}
    </group>
  )
}

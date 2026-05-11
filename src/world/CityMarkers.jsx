import { useNavigate } from 'react-router-dom'
import { geoToWorld } from './coords.js'
import { CITIES } from './data/cities.js'
import PhotoCard from './PhotoCard.jsx'

export default function CityMarkers() {
  const navigate = useNavigate()
  return (
    <group>
      {CITIES.map((c, i) => {
        const [x, z] = geoToWorld(c.lat, c.lng)
        // Vary card heights so they don't all sit at the same y
        const y = 1.2 + (i % 3) * 0.35
        const rotY = Math.atan2(-x, -z) + 0.04 * (i % 2 === 0 ? 1 : -1)
        return (
          <PhotoCard
            key={c.slug}
            position={[x, y, z]}
            rotationY={rotY}
            width={1.7}
            height={1.1}
            photo={c.photo}
            label={c.name}
            sublabel={c.state}
            onClick={() => navigate(`/search?state=${c.state}`)}
          />
        )
      })}
    </group>
  )
}

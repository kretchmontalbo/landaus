import { useNavigate } from 'react-router-dom'
import { geoToWorld } from './coords.js'
import { LANDMARKS } from './data/cities.js'
import PhotoCard from './PhotoCard.jsx'

export default function Landmarks() {
  const navigate = useNavigate()
  return (
    <group>
      {LANDMARKS.map((lm, i) => {
        const [x, z] = geoToWorld(lm.lat, lm.lng)
        const y = 2.4 + (i % 2) * 0.4
        const rotY = Math.atan2(-x, -z) - 0.06
        const width = lm.tall ? 1.6 : 2.0
        const height = lm.tall ? 1.9 : 1.1
        return (
          <PhotoCard
            key={lm.slug}
            position={[x, y, z]}
            rotationY={rotY}
            width={width}
            height={height}
            photo={lm.photo}
            label={lm.name}
            tilt={-0.06}
            onClick={() => navigate('/suburbs')}
            emissive
          />
        )
      })}
    </group>
  )
}

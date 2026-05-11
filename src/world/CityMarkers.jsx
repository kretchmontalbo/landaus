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
        const y = 2.2 + (i % 3) * 0.3
        const rotY = Math.atan2(-x, -z) * 0.45 + 0.04 * (i % 2 === 0 ? 1 : -1)
        return (
          <group key={c.slug}>
            {/* anchor line from card down to the city */}
            <mesh position={[x, y / 2, z]}>
              <cylinderGeometry args={[0.012, 0.012, y, 6]} />
              <meshStandardMaterial color="#ffe6c8" emissive="#ffb878" emissiveIntensity={1.4} transparent opacity={0.85} />
            </mesh>
            <mesh position={[x, 0.1, z]}>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshStandardMaterial color="#fff6e6" emissive="#ffb878" emissiveIntensity={3} />
            </mesh>
            <PhotoCard
              position={[x, y, z]}
              rotationY={rotY}
              width={1.2}
              height={0.78}
              photo={c.photo}
              label={c.name}
              sublabel={c.state}
              tilt={-0.10}
              onClick={() => navigate(`/search?state=${c.state}`)}
            />
          </group>
        )
      })}
    </group>
  )
}

import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useWorldStore } from './store.js'
import PocketContinent from './pockets/PocketContinent.jsx'

function routeToPocket(pathname) {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/search')) return 'search'
  if (pathname === '/about') return 'about'
  return 'continent'
}

export default function PocketSlot() {
  const location = useLocation()
  const setPocket = useWorldStore((s) => s.setPocket)
  useEffect(() => {
    setPocket(routeToPocket(location.pathname))
  }, [location.pathname, setPocket])
  return <PocketContinent />
}

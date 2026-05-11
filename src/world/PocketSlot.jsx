import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useWorldStore } from './store.js'
import PocketContinent from './pockets/PocketContinent.jsx'

function routeToPocket(pathname) {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/search')) return 'search'
  if (pathname === '/about') return 'about'
  if (pathname === '/for-tenants') return 'for-tenants'
  if (pathname === '/for-landlords') return 'for-landlords'
  if (pathname === '/suburbs') return 'suburbs'
  if (pathname.startsWith('/suburbs/')) return 'suburb'
  if (pathname.startsWith('/property/')) return 'property'
  if (pathname === '/dashboard') return 'dashboard'
  if (pathname === '/account') return 'account'
  if (pathname === '/admin') return 'admin'
  if (pathname === '/login') return 'login'
  if (pathname === '/signup') return 'signup'
  if (pathname === '/forgot-password' || pathname === '/reset-password') return 'login'
  if (pathname === '/affordability') return 'affordability'
  if (pathname === '/map') return 'map'
  if (pathname === '/pricing') return 'pricing'
  if (pathname === '/advertise') return 'advertise'
  if (pathname === '/contact') return 'contact'
  return 'default'
}

export default function PocketSlot() {
  const location = useLocation()
  const setPocket = useWorldStore((s) => s.setPocket)
  useEffect(() => {
    setPocket(routeToPocket(location.pathname))
  }, [location.pathname, setPocket])
  return <PocketContinent />
}

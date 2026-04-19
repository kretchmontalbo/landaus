import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../lib/auth.jsx'

export default function Layout() {
  return (
    <>
      <Nav />
      <main><Outlet /></main>
      <Footer />
    </>
  )
}

function Nav() {
  const { user, profile, signOut, isAdmin, isLandlord } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">🏡</span>
          LandAus
        </Link>
        <div className="nav-links">
          <Link to="/search" className="nav-link">Browse</Link>
          <Link to="/for-landlords" className="nav-link">For Landlords</Link>
          <Link to="/for-tenants" className="nav-link">For Tenants</Link>
          <Link to="/suburbs" className="nav-link">Suburb Guides</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              {isAdmin && <Link to="/admin" className="nav-link">Admin</Link>}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--mint)', color: 'var(--accent)',
                    fontWeight: 600, fontSize: 14, cursor: 'pointer'
                  }}
                >
                  {(profile?.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                </button>
                {menuOpen && (
                  <div style={{
                    position: 'absolute', top: 44, right: 0, minWidth: 200,
                    background: 'var(--white)', border: '1px solid var(--line)',
                    borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 8, zIndex: 200
                  }}>
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)', marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{profile?.full_name || 'User'}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{user.email}</div>
                    </div>
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                      style={{ display: 'block', padding: '8px 12px', borderRadius: 8, fontSize: 14 }}>
                      My Dashboard
                    </Link>
                    <Link to="/list-property" onClick={() => setMenuOpen(false)}
                      style={{ display: 'block', padding: '8px 12px', borderRadius: 8, fontSize: 14 }}>
                      + List a Property
                    </Link>
                    <Link to="/account" onClick={() => setMenuOpen(false)}
                      style={{ display: 'block', padding: '8px 12px', borderRadius: 8, fontSize: 14 }}>
                      Account Settings
                    </Link>
                    <button onClick={handleLogout}
                      style={{ width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, fontSize: 14, color: 'var(--ink)' }}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Log in</Link>
              <Link to="/signup" className="btn btn-primary">List for Free →</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div className="logo" style={{ marginBottom: 12 }}>
              <span className="logo-mark">🏡</span>
              LandAus
            </div>
            <p style={{ color: 'var(--ink-soft)', fontSize: 14, maxWidth: 340, lineHeight: 1.6 }}>
              Australia's rental portal built for newcomers. Because finding home shouldn't mean proving you belong.
            </p>
          </div>
          <div>
            <h4>Browse</h4>
            <Link to="/search">All Properties</Link>
            <Link to="/search?state=NSW">NSW</Link>
            <Link to="/search?state=VIC">VIC</Link>
            <Link to="/search?state=QLD">QLD</Link>
            <Link to="/search?state=WA">WA</Link>
            <Link to="/search?state=SA">SA</Link>
            <Link to="/search?state=TAS">TAS</Link>
            <Link to="/search?state=ACT">ACT</Link>
            <Link to="/search?state=NT">NT</Link>
          </div>
          <div>
            <h4>For Renters</h4>
            <Link to="/search">Find a home</Link>
            <Link to="/suburbs">Suburb Guides</Link>
            <Link to="/signup">Sign up</Link>
            <Link to="/for-tenants">How it works</Link>
          </div>
          <div>
            <h4>For Landlords</h4>
            <Link to="/list-property">List property</Link>
            <Link to="/signup">Landlord signup</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/for-landlords">Why LandAus</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 LandAus. Made with 💚 in Sydney.</span>
          <span>Find home, not rejection.</span>
        </div>
      </footer>
    </>
  )
}

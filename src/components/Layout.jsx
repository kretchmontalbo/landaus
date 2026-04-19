import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../lib/auth.jsx'
import { getTheme, toggleTheme } from '../lib/theme.js'

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
  const { user, profile, signOut, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setThemeState] = useState(() => getTheme())
  const navigate = useNavigate()

  function flipTheme() {
    setThemeState(toggleTheme())
  }

  async function handleLogout() {
    await signOut()
    setMenuOpen(false)
    setMobileOpen(false)
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
          <Link to="/map" className="nav-link">🗺 Map</Link>
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

        {/* Theme toggle */}
        <button
          className="theme-toggle"
          onClick={flipTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2" x2="12" y2="4" />
              <line x1="12" y1="20" x2="12" y2="22" />
              <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
              <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
              <line x1="2" y1="12" x2="4" y2="12" />
              <line x1="20" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
              <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Hamburger (mobile only) */}
        <button
          className="hamburger"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <span /><span /><span />
        </button>
      </div>

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        profile={profile}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={flipTheme}
      />
    </nav>
  )
}

function MobileDrawer({ open, onClose, user, profile, isAdmin, onLogout, theme, onToggleTheme }) {
  const closeBtnRef = useRef(null)
  const drawerRef = useRef(null)

  // Focus management + body scroll lock + Escape key
  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus the close button when opened
    const focusTimer = setTimeout(() => closeBtnRef.current?.focus(), 50)

    function onKey(e) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab' || !drawerRef.current) return

      // Simple focus trap
      const focusable = drawerRef.current.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [open, onClose])

  return (
    <>
      <div
        className={`mobile-backdrop ${open ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        ref={drawerRef}
        className={`mobile-drawer ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
      >
        <div className="mobile-drawer-head">
          <span className="logo" style={{ fontSize: 20 }}>
            <span className="logo-mark" style={{ width: 28, height: 28, fontSize: 16 }}>🏡</span>
            LandAus
          </span>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close menu"
            className="mobile-drawer-close"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        {user && (
          <div className="mobile-drawer-user">
            <div className="mobile-drawer-avatar">
              {(profile?.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.full_name || 'User'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        <nav className="mobile-drawer-links">
          <Link to="/search" onClick={onClose} className="mobile-link">Browse</Link>
          <Link to="/for-landlords" onClick={onClose} className="mobile-link">For Landlords</Link>
          <Link to="/for-tenants" onClick={onClose} className="mobile-link">For Tenants</Link>
          <Link to="/map" onClick={onClose} className="mobile-link">🗺 Map</Link>
          <Link to="/suburbs" onClick={onClose} className="mobile-link">Suburb Guides</Link>
          {user && (
            <>
              <div className="mobile-divider" />
              <Link to="/dashboard" onClick={onClose} className="mobile-link">Dashboard</Link>
              <Link to="/account" onClick={onClose} className="mobile-link">Account Settings</Link>
              {isAdmin && <Link to="/admin" onClick={onClose} className="mobile-link">Admin</Link>}
            </>
          )}
          {!user && (
            <>
              <div className="mobile-divider" />
              <Link to="/login" onClick={onClose} className="mobile-link">Log in</Link>
              <Link to="/signup" onClick={onClose} className="mobile-link">Sign up</Link>
            </>
          )}
        </nav>

        <div className="mobile-drawer-foot">
          <button
            onClick={onToggleTheme}
            className="mobile-link"
            style={{ width: '100%', justifyContent: 'space-between', marginBottom: 10 }}
            aria-label="Toggle theme"
          >
            <span>Theme</span>
            <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </span>
          </button>
          {user ? (
            <button onClick={onLogout} className="btn btn-ghost btn-block">
              Log out
            </button>
          ) : (
            <Link to="/signup" onClick={onClose} className="btn btn-primary btn-block">
              List for Free →
            </Link>
          )}
        </div>
      </aside>
    </>
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
            <Link to="/map">Interactive map</Link>
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
            <Link to="/affordability">Affordability calculator</Link>
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
            <Link to="/advertise">Advertise</Link>
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

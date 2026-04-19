import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export default function EmailConfirmedPage() {
  const { user, profile } = useAuth()
  const name = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'friend'

  return (
    <>
      <style>{`
        @keyframes confirmCirclePop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes confirmCheckDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes confirmRise {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .confirm-circle {
          animation: confirmCirclePop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .confirm-check-path {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: confirmCheckDraw 0.45s 0.4s ease-out forwards;
        }
        .confirm-rise-1 { animation: confirmRise 0.5s 0.6s both ease-out; }
        .confirm-rise-2 { animation: confirmRise 0.5s 0.75s both ease-out; }
        .confirm-rise-3 { animation: confirmRise 0.5s 0.9s both ease-out; }
        .confirm-rise-4 { animation: confirmRise 0.5s 1.05s both ease-out; }
        .confirm-rise-5 { animation: confirmRise 0.5s 1.2s both ease-out; }
      `}</style>

      <section style={{
        background: 'linear-gradient(135deg, var(--mint-soft) 0%, var(--mint) 100%)',
        minHeight: 'calc(100vh - 160px)',
        display: 'grid', placeItems: 'center',
        padding: '48px 24px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: -140, right: -140,
          width: 420, height: 420,
          background: 'radial-gradient(circle, rgba(255,255,255,0.55), transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: -100, left: -100,
          width: 320, height: 320,
          background: 'radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none'
        }} />

        <div style={{
          maxWidth: 600, width: '100%',
          textAlign: 'center', position: 'relative'
        }}>
          {/* Animated check circle */}
          <div className="confirm-circle" style={{
            width: 104, height: 104,
            margin: '0 auto 28px',
            background: 'var(--accent)',
            borderRadius: '50%',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 12px 32px rgba(11, 93, 59, 0.25)'
          }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline className="confirm-check-path" points="5 12 10 17 19 7" />
            </svg>
          </div>

          <h1 className="confirm-rise-1" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5vw, 52px)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: 'var(--ink)',
            marginBottom: 12
          }}>
            You're in! 🎉
          </h1>

          <p className="confirm-rise-2" style={{
            fontSize: 18,
            color: 'var(--ink-soft)',
            marginBottom: 24,
            lineHeight: 1.5
          }}>
            Your email is confirmed and your LandAus account is active.
          </p>

          <p className="confirm-rise-3" style={{
            fontSize: 16,
            color: 'var(--ink)',
            lineHeight: 1.7,
            maxWidth: 520, margin: '0 auto 36px',
            background: 'rgba(255, 255, 255, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
            padding: '18px 24px',
            borderRadius: 16,
            backdropFilter: 'blur(4px)'
          }}>
            Welcome to LandAus, <strong>{name}</strong>! You're now part of a growing community of
            newcomers finding homes without rental history barriers. We're so glad you're here. 💚
          </p>

          <div className="confirm-rise-4" style={{
            display: 'flex', gap: 12, justifyContent: 'center',
            flexWrap: 'wrap', marginBottom: 28
          }}>
            <Link to="/dashboard" className="btn btn-dark" style={{ padding: '14px 28px', fontSize: 15 }}>
              Go to my dashboard →
            </Link>
            <Link to="/search" className="btn btn-ghost" style={{
              padding: '14px 28px', fontSize: 15,
              background: 'var(--white)', borderColor: 'var(--white)'
            }}>
              Browse properties
            </Link>
          </div>

          <p className="confirm-rise-5" style={{
            fontSize: 13,
            color: 'var(--ink-soft)',
            marginTop: 20
          }}>
            Questions? Reach us at <a href="mailto:kretch.montalbo@gmail.com" style={{ color: 'var(--accent)', fontWeight: 600 }}>hello@landaus.com.au</a>
          </p>
        </div>
      </section>
    </>
  )
}

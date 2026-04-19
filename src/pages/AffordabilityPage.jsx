import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import Arrow from '../components/Arrow.jsx'

const ALL_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']

export default function AffordabilityPage() {
  const [income, setIncome] = useState('')
  const [deposit, setDeposit] = useState('')
  const [employment, setEmployment] = useState('full_time')
  const [rentPct, setRentPct] = useState(30)
  const [states, setStates] = useState(new Set(['NSW', 'VIC', 'QLD']))
  const [suburbs, setSuburbs] = useState([])
  const [loading, setLoading] = useState(false)

  const numIncome = parseFloat(income) || 0
  const maxAnnualRent = (numIncome * rentPct) / 100
  const maxWeekly = maxAnnualRent / 52
  const maxMonthly = maxWeekly * 4.33

  const statesArr = useMemo(() => Array.from(states), [states])

  useEffect(() => {
    if (!numIncome || maxWeekly <= 0 || statesArr.length === 0) {
      setSuburbs([])
      return
    }
    let cancelled = false
    async function run() {
      setLoading(true)
      const { data } = await supabase
        .from('properties')
        .select('suburb, state, price_per_week')
        .eq('status', 'active')
        .lte('price_per_week', Math.round(maxWeekly))
        .in('state', statesArr)
        .limit(500)
      if (cancelled) return
      const grouped = {}
      for (const p of data || []) {
        const key = `${p.suburb}|${p.state}`
        if (!grouped[key]) grouped[key] = { suburb: p.suburb, state: p.state, count: 0, min: Infinity }
        grouped[key].count += 1
        if (p.price_per_week < grouped[key].min) grouped[key].min = p.price_per_week
      }
      const list = Object.values(grouped).sort((a, b) => b.count - a.count)
      setSuburbs(list)
      setLoading(false)
    }
    const t = setTimeout(run, 250) // debounce
    return () => { cancelled = true; clearTimeout(t) }
  }, [numIncome, maxWeekly, statesArr.join(',')])

  function toggleState(s) {
    setStates(prev => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })
  }

  const canCalc = numIncome > 0

  return (
    <>
      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, var(--mint-soft) 0%, var(--mint) 100%)',
        padding: '80px 24px 72px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <span className="eyebrow">Free tool</span>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 56px)',
            fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.03em',
            color: 'var(--ink)', marginBottom: 14
          }}>
            Can I <em style={{ fontStyle: 'italic', color: 'var(--accent)', fontWeight: 500 }}>afford</em> this?
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-soft)', lineHeight: 1.55, maxWidth: 560, margin: '0 auto' }}>
            Enter your income. We'll show you which Australian suburbs fit your budget.
          </p>
        </div>
      </section>

      {/* CALCULATOR */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 24px' }}>
        <div style={{
          background: 'var(--white)', border: '1px solid var(--line)',
          borderRadius: 'var(--radius-lg)', padding: 32, boxShadow: 'var(--shadow-md)'
        }}>
          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div className="form-field">
              <label>Annual income (AUD) *</label>
              <input
                type="number"
                placeholder="e.g. 80000"
                value={income}
                onChange={e => setIncome(e.target.value)}
                min="0"
              />
            </div>
            <div className="form-field">
              <label>Deposit available (optional)</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={deposit}
                onChange={e => setDeposit(e.target.value)}
                min="0"
              />
            </div>
            <div className="form-field">
              <label>Employment type</label>
              <select value={employment} onChange={e => setEmployment(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="casual">Casual</option>
                <option value="student">Student</option>
                <option value="visa_holder">Visa holder</option>
              </select>
            </div>
          </div>

          {/* Row 2: rent slider */}
          <div style={{ marginTop: 8 }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
              <span>Max % of income for rent</span>
              <span style={{ color: 'var(--accent)' }}>{rentPct}%</span>
            </label>
            <input
              type="range" min="20" max="40" step="1"
              value={rentPct}
              onChange={e => setRentPct(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-muted)', marginTop: 4 }}>
              <span>20% (comfortable)</span>
              <span>30% (Australian fair-housing guideline)</span>
              <span>40% (stretched)</span>
            </div>
          </div>

          {/* States */}
          <div style={{ marginTop: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
              Preferred states
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ALL_STATES.map(s => {
                const active = states.has(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleState(s)}
                    style={{
                      padding: '8px 16px', borderRadius: 999,
                      border: `1.5px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
                      background: active ? 'var(--mint-soft)' : 'var(--white)',
                      color: active ? 'var(--accent)' : 'var(--ink-soft)',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Result */}
          <div style={{
            marginTop: 28, padding: 24,
            background: canCalc ? 'var(--mint-soft)' : 'var(--line-soft)',
            border: `1px solid ${canCalc ? 'var(--mint-deep)' : 'var(--line)'}`,
            borderRadius: 14, textAlign: 'center'
          }}>
            {canCalc ? (
              <>
                <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 8, fontWeight: 500 }}>
                  You can comfortably afford
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 40px)',
                  fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em'
                }}>
                  ${Math.round(maxWeekly).toLocaleString()} <span style={{ color: 'var(--ink-muted)', fontSize: '0.6em', fontWeight: 400 }}>/ week</span>
                  <span style={{ margin: '0 14px', color: 'var(--mint-deep)' }}>·</span>
                  ${Math.round(maxMonthly).toLocaleString()} <span style={{ color: 'var(--ink-muted)', fontSize: '0.6em', fontWeight: 400 }}>/ month</span>
                </div>
                {deposit && (
                  <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 10 }}>
                    With ${parseFloat(deposit).toLocaleString()} deposit, most 4-week bond requirements covered.
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: 14, color: 'var(--ink-muted)' }}>
                Enter your annual income to see what you can afford.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SUBURB MATCHES */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500,
          letterSpacing: '-0.02em', marginBottom: 16
        }}>
          Suburb matches{canCalc && suburbs.length > 0 ? ` (${suburbs.length})` : ''}
        </h2>

        {!canCalc ? (
          <div className="empty-state" style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)' }}>
            <p>Enter your income above to see matching suburbs.</p>
          </div>
        ) : loading ? (
          <div style={{ color: 'var(--ink-muted)', padding: 20, textAlign: 'center' }}>Crunching numbers…</div>
        ) : suburbs.length === 0 ? (
          <div className="empty-state" style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)' }}>
            <h3>No matches yet</h3>
            <p>Try widening your price or adding more states.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {suburbs.map(s => (
              <Link
                key={`${s.suburb}-${s.state}`}
                to={`/search?suburb=${encodeURIComponent(s.suburb)}&state=${s.state}&maxPrice=${Math.round(maxWeekly)}`}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'var(--white)', border: '1px solid var(--line)',
                  borderRadius: 'var(--radius)', padding: '16px 20px',
                  transition: 'border-color 0.15s, box-shadow 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--mint-deep)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 16 }}>
                    {s.suburb}, {s.state}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>
                    {s.count} affordable {s.count === 1 ? 'home' : 'homes'} · from <strong>${s.min}/wk</strong>
                  </div>
                </div>
                <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                  View homes<Arrow />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* TIPS */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500,
          letterSpacing: '-0.02em', marginBottom: 20, textAlign: 'center'
        }}>
          What else to consider
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <Tip icon="💰" title="Budget for bond">
            In Australia, bond is usually 4 weeks rent upfront — paid into the state's rental bond board.
          </Tip>
          <Tip icon="⚡" title="Include utilities">
            Rent often excludes water, gas, and electricity — expect $200–400/month extra.
          </Tip>
          <Tip icon="📄" title="Rental applications">
            Prepare payslips, ID, references, and your LandAus profile before applying.
          </Tip>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{
        background: 'linear-gradient(135deg, var(--mint-soft) 0%, var(--mint) 100%)',
        padding: '64px 24px 80px', textAlign: 'center'
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 14
          }}>
            Ready to start your search?
          </h2>
          <Link to="/search" className="btn btn-dark" style={{ padding: '14px 28px', fontSize: 15 }}>
            Browse welcoming homes<Arrow />
          </Link>
        </div>
      </section>
    </>
  )
}

function Tip({ icon, title, children }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--line)',
      borderRadius: 'var(--radius-lg)', padding: 24
    }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
        {title}
      </h3>
      <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6 }}>{children}</p>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import ReportCard from '../components/ReportCard.jsx'
import VerificationCard from '../components/VerificationCard.jsx'
import { clearFlagCache } from '../lib/featureFlags.js'

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [allProps, setAllProps] = useState([])
  const [allInqs, setAllInqs] = useState([])
  const [contactMsgs, setContactMsgs] = useState([])
  const [reports, setReports] = useState([])
  const [verifications, setVerifications] = useState([])
  const [flags, setFlags] = useState([])
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [usersRes, propsRes, inqsRes, contactRes, reportsRes, vfRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('properties').select('*, profiles(full_name, email), property_images(image_url)').order('created_at', { ascending: false }),
      supabase.from('inquiries').select('*, properties(title)').order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('reports').select('*').order('created_at', { ascending: false }),
      supabase.from('verification_submissions').select('*').order('created_at', { ascending: false })
    ])

    const { data: flagData } = await supabase.from('feature_flags').select('*').order('key')
    setFlags(flagData || [])
    setUsers(usersRes.data || [])
    setAllProps(propsRes.data || [])
    setAllInqs(inqsRes.data || [])
    setContactMsgs(contactRes.data || [])

    // Enrich reports with target details
    const reportsList = reportsRes.data || []
    const propIds = reportsList.filter(r => r.target_type === 'property').map(r => r.target_id)
    const guideIds = reportsList.filter(r => r.target_type === 'suburb_guide').map(r => r.target_id)
    const profIds = reportsList.filter(r => r.target_type === 'profile').map(r => r.target_id)

    const [propTargets, guideTargets, profTargets] = await Promise.all([
      propIds.length ? supabase.from('properties').select('id, title, suburb, state').in('id', propIds) : { data: [] },
      guideIds.length ? supabase.from('suburb_guides').select('id, suburb, state').in('id', guideIds) : { data: [] },
      profIds.length ? supabase.from('profiles').select('id, full_name, email').in('id', profIds) : { data: [] }
    ])
    const byId = {}
    for (const p of propTargets.data || []) byId[p.id] = p
    for (const g of guideTargets.data || []) byId[g.id] = g
    for (const pr of profTargets.data || []) byId[pr.id] = pr
    setReports(reportsList.map(r => ({ ...r, target: byId[r.target_id] || null })))

    // Enrich verification submissions with profile info
    const vfList = vfRes.data || []
    const vfById = {}
    for (const u of usersRes.data || []) vfById[u.id] = u
    setVerifications(vfList.map(v => ({ ...v, profile: vfById[v.user_id] || null })))
    setStats({
      users: usersRes.data?.length || 0,
      landlords: (usersRes.data || []).filter(u => u.user_type === 'landlord').length,
      tenants: (usersRes.data || []).filter(u => u.user_type === 'tenant').length,
      properties: propsRes.data?.length || 0,
      active: (propsRes.data || []).filter(p => p.status === 'active').length,
      inquiries: inqsRes.data?.length || 0,
      newInquiries: (inqsRes.data || []).filter(i => i.status === 'new').length
    })
    setLoading(false)
  }

  async function setUserType(id, type) {
    await supabase.from('profiles').update({ user_type: type }).eq('id', id)
    load()
  }

  async function setPropertyStatus(id, status) {
    await supabase.from('properties').update({ status }).eq('id', id)
    load()
  }

  async function toggleFlag(key, current) {
    await supabase.from('feature_flags').update({ enabled: !current }).eq('key', key)
    clearFlagCache()
    load()
  }

  async function confirmDeleteProperty() {
    if (!deleteModal) return
    setDeleting(true)
    const prop = allProps.find(p => p.id === deleteModal.id)
    if (prop?.property_images?.length > 0) {
      const paths = prop.property_images
        .map(img => {
          try { return new URL(img.image_url).pathname.split('/property-images/')[1] } catch { return null }
        })
        .filter(Boolean)
      if (paths.length > 0) await supabase.storage.from('property-images').remove(paths)
    }
    await supabase.from('properties').delete().eq('id', deleteModal.id)
    setDeleteModal(null)
    setDeleting(false)
    setToast('✓ Listing deleted')
    setTimeout(() => setToast(null), 3000)
    load()
  }

  const pendingProps = allProps.filter(p => p.status === 'pending_review')
  const newReports = reports.filter(r => !r.status || r.status === 'new')
  const pendingVfs = verifications.filter(v => v.status === 'pending' || v.status === 'under_review' || v.status === 'needs_more_info' || !v.status)

  if (loading) return <div style={{ padding: 64, textAlign: 'center' }}>Loading admin panel…</div>

  return (
    <section className="section">
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'inline-block', padding: '4px 12px',
          background: 'var(--ink)', color: 'var(--mint)',
          borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 8
        }}>ADMIN MODE</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em' }}>
          Command Center
        </h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 17, marginTop: 6 }}>
          Oversee everything happening on LandAus.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
        <Stat label="Users" value={stats.users} icon="👥" />
        <Stat label="Landlords" value={stats.landlords} icon="🏠" />
        <Stat label="Tenants" value={stats.tenants} icon="🔍" />
        <Stat label="Active listings" value={stats.active} icon="✨" />
        <Stat label="Total listings" value={stats.properties} icon="📋" />
        <Stat label="New inquiries" value={stats.newInquiries} icon="✉️" highlight={stats.newInquiries > 0} />
      </div>

      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--line)', marginBottom: 24, flexWrap: 'wrap' }}>
        {['reports', 'verifications', 'pending', 'overview', 'users', 'properties', 'inquiries', 'contact', 'settings'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`search-tab ${tab === t ? 'active' : ''}`}
            style={
              t === 'pending' ? { background: pendingProps.length > 0 ? '#FEF3C7' : undefined, color: pendingProps.length > 0 ? '#92400E' : undefined }
              : t === 'reports' && newReports.length > 0 ? { background: '#FEE2E2', color: '#991B1B' }
              : t === 'verifications' && pendingVfs.length > 0 ? { background: '#FEE2E2', color: '#991B1B' }
              : {}
            }>
            {t === 'pending' ? `Pending Review (${pendingProps.length})`
              : t === 'reports' ? (<>Reports{newReports.length > 0 && <span style={{
                  marginLeft: 8, background: 'var(--accent-hot)', color: 'white',
                  borderRadius: 999, padding: '1px 8px', fontSize: 11, fontWeight: 700
                }}>{newReports.length}</span>}</>)
              : t === 'verifications' ? (<>Verifications{pendingVfs.length > 0 && <span style={{
                  marginLeft: 8, background: 'var(--accent-hot)', color: 'white',
                  borderRadius: 999, padding: '1px 8px', fontSize: 11, fontWeight: 700
                }}>{pendingVfs.length}</span>}</>)
              : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'reports' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {reports.length === 0 ? (
            <div className="empty-state">
              <h3>No reports yet</h3>
              <p>User-submitted reports will appear here for review.</p>
            </div>
          ) : (
            reports.map(r => <ReportCard key={r.id} report={r} onSaved={load} />)
          )}
        </div>
      )}

      {tab === 'verifications' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {verifications.length === 0 ? (
            <div className="empty-state">
              <h3>No verification submissions yet</h3>
              <p>Landlords submitting ID and ownership docs will appear here.</p>
            </div>
          ) : (
            verifications.map(v => <VerificationCard key={v.id} submission={v} onUpdated={load} />)
          )}
        </div>
      )}

      {tab === 'pending' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {pendingProps.length === 0 ? (
            <div className="empty-state">
              <h3>No pending listings</h3>
              <p>All caught up! New first-time listings will appear here for review.</p>
            </div>
          ) : (
            pendingProps.map(p => (
              <div key={p.id} style={{
                background: 'var(--white)', border: '1px solid #F59E0B',
                borderRadius: 'var(--radius-lg)', padding: 20
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div>
                    <strong style={{ fontSize: 18 }}>{p.title}</strong>
                    <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>
                      {p.suburb}, {p.state} · ${p.price_per_week}/wk · 🛏 {p.bedrooms} 🛁 {p.bathrooms}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>
                      by {p.profiles?.full_name || p.profiles?.email || 'Anonymous'} · {new Date(p.created_at).toLocaleDateString('en-AU')}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 12 }}>
                  {p.description}
                </p>
                {p.property_images?.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
                    {p.property_images.map((img, i) => (
                      <img key={i} src={img.image_url} alt="" style={{
                        width: 120, height: 90, objectFit: 'cover', borderRadius: 8, flexShrink: 0
                      }} />
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setPropertyStatus(p.id, 'active')} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}>
                    ✓ Approve
                  </button>
                  <button onClick={() => setPropertyStatus(p.id, 'archived')} className="btn btn-ghost" style={{ padding: '8px 20px', fontSize: 14, color: '#B91C1C' }}>
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'overview' && (
        <div style={{ background: 'var(--mint-pale)', padding: 24, borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
            📈 Recent activity
          </h3>
          <div style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.8 }}>
            <div>📝 {allProps.filter(p => daysSince(p.created_at) < 7).length} new listings this week</div>
            <div>✉️ {allInqs.filter(i => daysSince(i.created_at) < 7).length} new inquiries this week</div>
            <div>👤 {users.filter(u => daysSince(u.created_at) < 7).length} new users this week</div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div style={{ display: 'grid', gap: 8 }}>
          {users.map(u => (
            <div key={u.id} style={{
              background: 'var(--white)', border: '1px solid var(--line)',
              borderRadius: 'var(--radius)', padding: 16,
              display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, alignItems: 'center'
            }}>
              <div>
                <strong>{u.full_name || 'Unnamed'}</strong>
                <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{u.email}</div>
              </div>
              <span style={{
                fontSize: 11, padding: '2px 10px', borderRadius: 999,
                background: u.user_type === 'admin' ? 'var(--ink)' : 'var(--mint-soft)',
                color: u.user_type === 'admin' ? 'var(--mint)' : 'var(--accent)',
                fontWeight: 600
              }}>{u.user_type}</span>
              <select value={u.user_type} onChange={e => setUserType(u.id, e.target.value)}
                style={{ padding: '6px 10px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13 }}>
                <option value="tenant">Tenant</option>
                <option value="landlord">Landlord</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {tab === 'properties' && (
        <div style={{ display: 'grid', gap: 8 }}>
          {allProps.map(p => (
            <div key={p.id} style={{
              background: 'var(--white)', border: '1px solid var(--line)',
              borderRadius: 'var(--radius)', padding: 16,
              display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 12, alignItems: 'center'
            }}>
              <div>
                <strong>{p.title}</strong>
                <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                  {p.suburb}, {p.state} · ${p.price_per_week}/wk
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>
                  by {p.profiles?.full_name || p.profiles?.email || 'Anonymous'}
                </div>
              </div>
              <span style={{
                fontSize: 11, padding: '2px 10px', borderRadius: 999,
                background: p.status === 'active' ? 'var(--mint-soft)' : 'var(--line-soft)',
                color: p.status === 'active' ? 'var(--accent)' : 'var(--ink-muted)',
                fontWeight: 600
              }}>{p.status}</span>
              <select value={p.status} onChange={e => setPropertyStatus(p.id, e.target.value)}
                style={{ padding: '6px 10px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13 }}>
                <option value="active">Active</option>
                <option value="pending_review">Pending Review</option>
                <option value="archived">Archived</option>
                <option value="leased">Leased</option>
                <option value="draft">Draft</option>
              </select>
              <button onClick={() => setDeleteModal({ id: p.id, title: p.title })}
                className="btn btn-ghost"
                style={{ padding: '6px 12px', fontSize: 13, color: '#B91C1C' }}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'inquiries' && (
        <div style={{ display: 'grid', gap: 8 }}>
          {allInqs.map(i => (
            <div key={i.id} style={{
              background: i.status === 'new' ? 'var(--mint-pale)' : 'var(--white)',
              border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong>{i.name} → {i.properties?.title}</strong>
                <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                  {new Date(i.created_at).toLocaleDateString('en-AU')}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                {i.email} · {i.phone || 'no phone'}
              </div>
              <p style={{ fontSize: 14, marginTop: 8, color: 'var(--ink)' }}>"{i.message}"</p>
            </div>
          ))}
        </div>
      )}
      {deleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 32, maxWidth: 480, width: '100%', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>Delete listing?</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 24 }}>
              Delete <strong>{deleteModal.title}</strong>? This permanently removes the listing, all photos, and any inquiries. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteModal(null)} className="btn btn-ghost" disabled={deleting}>Cancel</button>
              <button onClick={confirmDeleteProperty} className="btn" disabled={deleting}
                style={{ background: '#B91C1C', color: 'white', padding: '10px 20px' }}>
                {deleting ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}

      {tab === 'settings' && (
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>Feature flags</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {flags.length === 0 ? (
              <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>No flags configured.</p>
            ) : flags.map(f => (
              <FlagToggle key={f.key} flag={f} onToggle={() => toggleFlag(f.key, f.enabled)} />
            ))}
          </div>
        </div>
      )}

      {tab === 'contact' && (
        <div style={{ display: 'grid', gap: 8 }}>
          {contactMsgs.length === 0 ? (
            <div className="empty-state">
              <h3>No contact messages</h3>
              <p>Messages from the contact form will appear here.</p>
            </div>
          ) : (
            contactMsgs.map(m => (
              <div key={m.id} style={{
                background: 'var(--white)', border: '1px solid var(--line)',
                borderRadius: 'var(--radius)', padding: 16
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong>{m.name}</strong>
                  <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                    {new Date(m.created_at).toLocaleDateString('en-AU')}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8 }}>
                  <a href={`mailto:${m.email}`} style={{ color: 'var(--accent)' }}>{m.email}</a>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6 }}>{m.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  )
}

const FLAG_META = {
  featured_listings_enabled: { label: 'Featured listings (paid boosts)', desc: 'Allow landlords to pay to pin their listing to the top of search.' },
  premium_subscriptions_enabled: { label: 'Premium subscriptions', desc: 'Monthly plans for landlords with multiple properties.' },
  paid_verification_enabled: { label: 'Paid verification', desc: 'Charge a fee for expedited verification review.' },
  partner_commissions_enabled: { label: 'Partner commissions', desc: 'Referral commissions for agents.' },
  tenant_application_fees_enabled: { label: 'Tenant application fees', desc: 'NOT RECOMMENDED — fees charged to tenants on application.', warn: true }
}

function FlagToggle({ flag, onToggle }) {
  const meta = FLAG_META[flag.key] || { label: flag.key, desc: flag.description || '' }
  return (
    <div style={{
      background: 'var(--white)', border: `1px solid ${meta.warn ? '#FCA5A5' : 'var(--line)'}`,
      borderRadius: 'var(--radius)', padding: 16,
      display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <strong style={{ fontSize: 14 }}>{meta.label}</strong>
          {meta.warn && <span style={{ fontSize: 10, padding: '1px 6px', background: '#FEE2E2', color: '#991B1B', borderRadius: 4, fontWeight: 700 }}>NOT RECOMMENDED</span>}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 2 }}>{meta.desc}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2, fontFamily: 'monospace' }}>{flag.key}</div>
      </div>
      <button onClick={onToggle} style={{
        width: 52, height: 28, borderRadius: 999,
        background: flag.enabled ? 'var(--accent)' : 'var(--line)',
        position: 'relative', transition: 'background 0.15s',
        border: 'none', cursor: 'pointer', flexShrink: 0
      }} aria-label={`Toggle ${meta.label}`}>
        <span style={{
          position: 'absolute', top: 3, left: flag.enabled ? 27 : 3,
          width: 22, height: 22, borderRadius: '50%', background: 'white',
          transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }} />
      </button>
    </div>
  )
}

function Stat({ label, value, icon, highlight }) {
  return (
    <div style={{
      background: highlight ? 'var(--mint-soft)' : 'var(--white)',
      border: `1px solid ${highlight ? 'var(--mint-deep)' : 'var(--line)'}`,
      padding: 16, borderRadius: 'var(--radius)'
    }}>
      <div style={{ fontSize: 20, marginBottom: 2 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{label}</div>
    </div>
  )
}

function daysSince(date) {
  return (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
}

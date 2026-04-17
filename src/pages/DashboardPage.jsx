import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [properties, setProperties] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('properties')
  const [deleteModal, setDeleteModal] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    setLoading(true)
    const { data: props } = await supabase
      .from('properties')
      .select('*, property_images(id, image_url)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    const { data: inqs } = await supabase
      .from('inquiries')
      .select('*, properties(title, suburb, state)')
      .in('property_id', (props || []).map(p => p.id))
      .order('created_at', { ascending: false })

    setProperties(props || [])
    setInquiries(inqs || [])
    setLoading(false)
  }

  async function confirmDelete() {
    if (!deleteModal) return
    setDeleting(true)
    const prop = properties.find(p => p.id === deleteModal)
    if (prop?.property_images?.length > 0) {
      const paths = prop.property_images
        .map(img => {
          try { return new URL(img.image_url).pathname.split('/property-images/')[1] } catch { return null }
        })
        .filter(Boolean)
      if (paths.length > 0) await supabase.storage.from('property-images').remove(paths)
    }
    await supabase.from('properties').delete().eq('id', deleteModal)
    setDeleteModal(null)
    setDeleting(false)
    load()
  }

  async function toggleStatus(id, currentStatus) {
    const next = currentStatus === 'active' ? 'archived' : 'active'
    await supabase.from('properties').update({ status: next }).eq('id', id)
    load()
  }

  async function markRead(id) {
    await supabase.from('inquiries').update({ status: 'read' }).eq('id', id)
    load()
  }

  const newInquiries = inquiries.filter(i => i.status === 'new').length
  const activeListings = properties.filter(p => p.status === 'active').length

  return (
    <section className="section">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em' }}>
          Hi {profile?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 17, marginTop: 6 }}>
          Manage your listings and inquiries here.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Active listings" value={activeListings} icon="🏠" />
        <StatCard label="Total listings" value={properties.length} icon="📋" />
        <StatCard label="New inquiries" value={newInquiries} icon="✉️" highlight={newInquiries > 0} />
        <StatCard label="Total inquiries" value={inquiries.length} icon="📨" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--line)', marginBottom: 24 }}>
        <button onClick={() => setTab('properties')} className={`search-tab ${tab === 'properties' ? 'active' : ''}`}>
          My Properties ({properties.length})
        </button>
        <button onClick={() => setTab('inquiries')} className={`search-tab ${tab === 'inquiries' ? 'active' : ''}`}>
          Inquiries {newInquiries > 0 && <span style={{ background: 'var(--accent-hot)', color: 'white', borderRadius: 999, padding: '1px 7px', fontSize: 11, marginLeft: 6 }}>{newInquiries}</span>}
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-muted)' }}>Loading…</div>
      ) : tab === 'properties' ? (
        <>
          <button onClick={() => navigate('/list-property')} className="btn btn-primary" style={{ marginBottom: 20 }}>
            + Add new listing
          </button>
          {properties.length === 0 ? (
            <div className="empty-state">
              <h3>No listings yet</h3>
              <p style={{ marginBottom: 20 }}>Add your first property to start welcoming tenants.</p>
              <button onClick={() => navigate('/list-property')} className="btn btn-dark">List your first property →</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {properties.map(p => (
                <div key={p.id} style={{
                  background: 'var(--white)', border: '1px solid var(--line)',
                  borderRadius: 'var(--radius)', padding: 16,
                  display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 16, alignItems: 'center'
                }}>
                  <div style={{
                    width: 100, height: 80,
                    background: `url(${p.property_images?.[0]?.image_url || ''}) center/cover var(--line-soft)`,
                    borderRadius: 10
                  }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 16 }}>{p.title}</strong>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 999,
                        background: p.status === 'active' ? 'var(--mint-soft)' : p.status === 'pending_review' ? '#FEF3C7' : 'var(--line-soft)',
                        color: p.status === 'active' ? 'var(--accent)' : p.status === 'pending_review' ? '#92400E' : 'var(--ink-muted)',
                        fontWeight: 600
                      }}>{p.status === 'pending_review' ? '⏳ Awaiting review' : p.status}</span>
                      {p.status === 'pending_review' && (
                        <span style={{ fontSize: 12, color: '#92400E' }}>(usually within 24 hours)</span>
                      )}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
                      {p.suburb}, {p.state} · ${p.price_per_week}/wk · 🛏 {p.bedrooms} 🛁 {p.bathrooms}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Link to={`/property/${p.id}`} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }}>View</Link>
                    <Link to={`/edit-property/${p.id}`} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }}>Edit</Link>
                    <button onClick={() => toggleStatus(p.id, p.status)} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }}>
                      {p.status === 'active' ? 'Archive' : 'Activate'}
                    </button>
                    <button onClick={() => setDeleteModal(p.id)} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 13, color: '#B91C1C' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {inquiries.length === 0 ? (
            <div className="empty-state">
              <h3>No inquiries yet</h3>
              <p>When tenants reach out, you'll see them here.</p>
            </div>
          ) : (
            inquiries.map(i => (
              <div key={i.id} style={{
                background: i.status === 'new' ? 'var(--mint-pale)' : 'var(--white)',
                border: `1px solid ${i.status === 'new' ? 'var(--mint-deep)' : 'var(--line)'}`,
                borderRadius: 'var(--radius)', padding: 20
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <div>
                    <strong style={{ fontSize: 16 }}>{i.name}</strong>
                    {i.status === 'new' && (
                      <span style={{
                        marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 999,
                        background: 'var(--accent-hot)', color: 'white', fontWeight: 600
                      }}>NEW</span>
                    )}
                    <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>
                      📧 <a href={`mailto:${i.email}`} style={{ color: 'var(--accent)' }}>{i.email}</a>
                      {i.phone && <> · 📞 <a href={`tel:${i.phone}`} style={{ color: 'var(--accent)' }}>{i.phone}</a></>}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                    {new Date(i.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 8 }}>
                  Re: <Link to={`/property/${i.property_id}`} style={{ color: 'var(--accent)', fontWeight: 500 }}>
                    {i.properties?.title || 'Property'}
                  </Link>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.5, margin: '8px 0' }}>
                  "{i.message}"
                </p>
                {i.move_in_date && (
                  <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                    🗓 Preferred move-in: {new Date(i.move_in_date).toLocaleDateString('en-AU')}
                  </div>
                )}
                {i.status === 'new' && (
                  <button onClick={() => markRead(i.id)} className="btn btn-ghost" style={{ marginTop: 12, padding: '6px 12px', fontSize: 13 }}>
                    Mark as read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
      {deleteModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'grid', placeItems: 'center', zIndex: 1000, padding: 20
        }}>
          <div style={{
            background: 'var(--white)', borderRadius: 'var(--radius-lg)',
            padding: 32, maxWidth: 440, width: '100%', boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>Delete this listing?</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 24 }}>
              This will permanently remove the listing, all photos, and any inquiries received. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteModal(null)} className="btn btn-ghost" disabled={deleting}>Cancel</button>
              <button onClick={confirmDelete} className="btn" disabled={deleting}
                style={{ background: '#B91C1C', color: 'white', padding: '10px 20px' }}>
                {deleting ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function StatCard({ label, value, icon, highlight }) {
  return (
    <div style={{
      background: highlight ? 'var(--mint-soft)' : 'var(--white)',
      border: `1px solid ${highlight ? 'var(--mint-deep)' : 'var(--line)'}`,
      padding: 20, borderRadius: 'var(--radius-lg)'
    }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ink)' }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{label}</div>
    </div>
  )
}

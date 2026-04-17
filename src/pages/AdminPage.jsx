import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [allProps, setAllProps] = useState([])
  const [allInqs, setAllInqs] = useState([])
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [usersRes, propsRes, inqsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('properties').select('*, profiles(full_name, email)').order('created_at', { ascending: false }),
      supabase.from('inquiries').select('*, properties(title)').order('created_at', { ascending: false })
    ])
    setUsers(usersRes.data || [])
    setAllProps(propsRes.data || [])
    setAllInqs(inqsRes.data || [])
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

      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--line)', marginBottom: 24 }}>
        {['overview', 'users', 'properties', 'inquiries'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`search-tab ${tab === t ? 'active' : ''}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

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
              display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, alignItems: 'center'
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
                <option value="archived">Archived</option>
                <option value="leased">Leased</option>
                <option value="draft">Draft</option>
              </select>
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
    </section>
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

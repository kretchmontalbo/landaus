import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name, email: form.email, message: form.message
    })
    setSubmitting(false)
    if (error) {
      setToast('Something went wrong. Try again.')
    } else {
      setToast("Thanks! We'll get back to you within 48 hours.")
      setForm({ name: '', email: '', message: '' })
    }
    setTimeout(() => setToast(null), 5000)
  }

  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 80px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>
        Contact us
      </h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 16, marginBottom: 32 }}>
        Have a question, feedback, or partnership inquiry? We'd love to hear from you.
      </p>

      <div style={{
        background: 'var(--white)', padding: 32, borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)'
      }}>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Name</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Message</label>
            <textarea required rows={5} placeholder="How can we help?"
              value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-dark btn-block" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send message →'}
          </button>
        </form>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </section>
  )
}

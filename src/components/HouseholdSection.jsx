import { Home, Heart, UserRound, Accessibility } from 'lucide-react'
import {
  ROOM_TYPES, HOUSEHOLD_GENDER, SMOKING_OPTIONS, DRINKING_OPTIONS,
  DIETARY_OPTIONS, RELIGION_OPTIONS, LANGUAGE_OPTIONS, ACCEPT_TOGGLES,
  INCLUSIVITY_TOGGLES
} from '../lib/householdOptions.js'

const INCL_ICONS = {
  lgbtqia: Heart,
  women: UserRound,
  accessible: Accessibility
}

/**
 * Household & Flatmate Preferences form section.
 * Shared between ListPropertyPage and EditPropertyPage.
 *
 * Props:
 *   form          — form state object with all household columns
 *   setForm       — setter
 *   toggleArray(key, value) — helper to toggle a value into form[key] array
 */
export default function HouseholdSection({ form, setForm, toggleArray }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--mint-deep)',
      padding: 24, borderRadius: 12, margin: '24px 0'
    }}>
      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="icon-inline"><Home size={20} strokeWidth={1.7} /></span>
        Household & Flatmate Preferences
      </h4>
      <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 20 }}>
        All fields optional. The more you share, the better we can match the right flatmates.
      </p>

      {/* Room details */}
      <h5 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: 'var(--ink)' }}>Room details</h5>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="form-field">
          <label>Room type</label>
          <select value={form.room_type || ''} onChange={e => setForm({ ...form, room_type: e.target.value })}
            style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
            <option value="">Select…</option>
            {ROOM_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Minimum stay (months)</label>
          <input type="number" min="1" value={form.minimum_stay_months || ''}
            onChange={e => setForm({ ...form, minimum_stay_months: e.target.value })} />
        </div>
        <div className="form-field">
          <label>Maximum stay (months) — optional</label>
          <input type="number" min="1" value={form.maximum_stay_months || ''}
            onChange={e => setForm({ ...form, maximum_stay_months: e.target.value })} />
        </div>
        <div className="form-field" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" checked={!!form.bills_included}
              onChange={e => setForm({ ...form, bills_included: e.target.checked })} />
            Bills included
          </label>
          {form.bills_included && (
            <input type="number" placeholder="Est. $/week" value={form.bills_estimated_weekly || ''}
              onChange={e => setForm({ ...form, bills_estimated_weekly: e.target.value })}
              style={{ marginTop: 8, padding: '9px 12px', borderRadius: 8, border: '1px solid var(--line)' }} />
          )}
        </div>
      </div>

      {/* Household */}
      <h5 style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 10 }}>Your household</h5>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="form-field">
          <label>Household size (people already living there)</label>
          <input type="number" min="0" value={form.household_size || ''}
            onChange={e => setForm({ ...form, household_size: e.target.value })} />
        </div>
        <div className="form-field">
          <label>Household gender mix</label>
          <select value={form.household_gender || ''} onChange={e => setForm({ ...form, household_gender: e.target.value })}
            style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
            <option value="">Prefer not to say</option>
            {HOUSEHOLD_GENDER.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      <div className="form-field">
        <label>Short description (optional, 500 chars)</label>
        <textarea maxLength={500} rows={3} value={form.household_description || ''}
          onChange={e => setForm({ ...form, household_description: e.target.value })}
          placeholder="e.g. Two Filipina students, quiet and tidy, work-from-home during weekdays." />
      </div>

      <div className="form-field">
        <label>Languages spoken in household</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {LANGUAGE_OPTIONS.map(l => {
            const on = (form.languages_spoken_in_household || []).includes(l.value)
            return (
              <button
                type="button" key={l.value}
                onClick={() => toggleArray('languages_spoken_in_household', l.value)}
                style={{
                  padding: '6px 12px', borderRadius: 999,
                  border: `1.5px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
                  background: on ? 'var(--mint-soft)' : 'var(--white)',
                  color: on ? 'var(--accent)' : 'var(--ink-soft)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}
              >{l.label}</button>
            )
          })}
        </div>
      </div>

      {/* Accepting */}
      <h5 style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 10 }}>Accepting applications from</h5>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 6 }}>
        {ACCEPT_TOGGLES.map(({ key, label }) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 6 }}>
            <input type="checkbox" checked={!!form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.checked })} />
            <span>{label}</span>
          </label>
        ))}
      </div>

      {/* Inclusivity */}
      <h5 style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 4 }}>Inclusivity & safe space</h5>
      <p style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--ink-muted)', marginBottom: 10 }}>
        Only tick if this genuinely applies — misrepresentation isn't fair to applicants.
      </p>
      <div style={{ display: 'grid', gap: 4 }}>
        {INCLUSIVITY_TOGGLES.map(({ key, iconKey, label }) => {
          const Icon = INCL_ICONS[iconKey]
          return (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 6 }}>
              <input type="checkbox" checked={!!form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.checked })} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {Icon && <span className="icon-inline"><Icon size={16} strokeWidth={1.7} /></span>}
                {label}
              </span>
            </label>
          )
        })}
      </div>

      {/* Lifestyle */}
      <h5 style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 10 }}>Household lifestyle</h5>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="form-field">
          <label>Smoking policy</label>
          <select value={form.smoking_location || ''} onChange={e => setForm({ ...form, smoking_location: e.target.value })}
            style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
            <option value="">Not specified</option>
            {SMOKING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Drinking culture</label>
          <select value={form.drinking_culture || ''} onChange={e => setForm({ ...form, drinking_culture: e.target.value })}
            style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
            <option value="">Not specified</option>
            {DRINKING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="form-field">
        <label>Dietary household (optional)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {DIETARY_OPTIONS.map(o => {
            const on = (form.dietary_preferences || []).includes(o.value)
            return (
              <button type="button" key={o.value}
                onClick={() => toggleArray('dietary_preferences', o.value)}
                style={{
                  padding: '6px 12px', borderRadius: 999,
                  border: `1.5px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
                  background: on ? 'var(--mint-soft)' : 'var(--white)',
                  color: on ? 'var(--accent)' : 'var(--ink-soft)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}
              >{o.label}</button>
            )
          })}
        </div>
      </div>

      <div className="form-field">
        <label>Religious/cultural observance (optional)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {RELIGION_OPTIONS.map(o => {
            const on = (form.religious_observance || []).includes(o.value)
            return (
              <button type="button" key={o.value}
                onClick={() => toggleArray('religious_observance', o.value)}
                style={{
                  padding: '6px 12px', borderRadius: 999,
                  border: `1.5px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
                  background: on ? 'var(--mint-soft)' : 'var(--white)',
                  color: on ? 'var(--accent)' : 'var(--ink-soft)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}
              >{o.label}</button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

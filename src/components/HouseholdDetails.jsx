import { Heart, UserRound, Accessibility } from 'lucide-react'
import {
  ROOM_TYPES, HOUSEHOLD_GENDER, SMOKING_OPTIONS, DRINKING_OPTIONS,
  DIETARY_OPTIONS, RELIGION_OPTIONS, LANGUAGE_OPTIONS,
  labelFromOptions, labelsFromArray, isRoomish
} from '../lib/householdOptions.js'

export default function HouseholdDetails({ property }) {
  const p = property || {}

  // Determine which groups have any data
  const whoLivesHere = p.household_size || p.household_gender || p.household_description ||
    (Array.isArray(p.languages_spoken_in_household) && p.languages_spoken_in_household.length > 0)

  const acceptKeys = [
    ['accepts_students', 'Students'],
    ['accepts_professionals', 'Professionals'],
    ['accepts_backpackers', 'Backpackers'],
    ['accepts_couples', 'Couples'],
    ['accepts_families_with_children', 'Families with children'],
    ['accepts_pets', 'Pet-friendly']
  ]
  const anyAccepts = acceptKeys.some(([k]) => p[k] !== undefined && p[k] !== null)

  const inclusivity = [
    p.lgbtqia_friendly && { Icon: Heart, text: 'LGBTQIA+ friendly' },
    p.women_safe_space && { Icon: UserRound, text: 'Women-safe space' },
    p.disability_accessible && { Icon: Accessibility, text: 'Disability accessible' }
  ].filter(Boolean)

  const roomish = isRoomish(p.property_type)
  const roomSection = roomish && (p.room_type || p.minimum_stay_months || p.bills_included !== undefined)

  const lifestyle = p.smoking_location || p.drinking_culture ||
    (Array.isArray(p.dietary_preferences) && p.dietary_preferences.length > 0) ||
    (Array.isArray(p.religious_observance) && p.religious_observance.length > 0)

  if (!whoLivesHere && !anyAccepts && inclusivity.length === 0 && !roomSection && !lifestyle) {
    return null
  }

  return (
    <div className="detail-section">
      <h3>Household & Lifestyle</h3>

      {whoLivesHere && (
        <Sub title="Who lives here">
          {p.household_size && <p><strong>{p.household_size}</strong> {p.household_size === 1 ? 'person' : 'people'}{p.household_gender ? `, ${labelFromOptions(p.household_gender, HOUSEHOLD_GENDER)} household` : ''}</p>}
          {p.household_description && <p style={{ marginTop: 4 }}>{p.household_description}</p>}
          {Array.isArray(p.languages_spoken_in_household) && p.languages_spoken_in_household.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 6 }}>Languages spoken</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {p.languages_spoken_in_household.map(l => (
                  <Pill key={l}>{labelFromOptions(l, LANGUAGE_OPTIONS)}</Pill>
                ))}
              </div>
            </div>
          )}
        </Sub>
      )}

      {anyAccepts && (
        <Sub title="Accepting applications from">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {acceptKeys.map(([key, label]) => (
              <Pill key={key} active={!!p[key]} muted={!p[key]}>
                {p[key] ? '✓ ' : ''}{label}
              </Pill>
            ))}
          </div>
        </Sub>
      )}

      {inclusivity.length > 0 && (
        <Sub title="Inclusivity">
          <div style={{ display: 'grid', gap: 6 }}>
            {inclusivity.map(i => (
              <div key={i.text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: 'var(--ink)' }}>
                <span className="icon-inline"><i.Icon size={18} strokeWidth={1.7} /></span>
                {i.text}
              </div>
            ))}
          </div>
        </Sub>
      )}

      {roomSection && (
        <Sub title="Room details">
          {p.room_type && <p><strong>Room type:</strong> {labelFromOptions(p.room_type, ROOM_TYPES)}</p>}
          {p.minimum_stay_months && <p><strong>Minimum stay:</strong> {p.minimum_stay_months} months{p.maximum_stay_months ? ` (max ${p.maximum_stay_months})` : ''}</p>}
          {p.bills_included !== undefined && p.bills_included !== null && (
            <p><strong>Bills:</strong> {p.bills_included
              ? (p.bills_estimated_weekly ? `Included (~$${p.bills_estimated_weekly}/wk estimated)` : 'Included')
              : 'Not included'}</p>
          )}
        </Sub>
      )}

      {lifestyle && (
        <Sub title="Household lifestyle">
          {p.smoking_location && <p><strong>Smoking:</strong> {labelFromOptions(p.smoking_location, SMOKING_OPTIONS)}</p>}
          {p.drinking_culture && <p><strong>Drinking:</strong> {labelFromOptions(p.drinking_culture, DRINKING_OPTIONS)}</p>}
          {Array.isArray(p.dietary_preferences) && p.dietary_preferences.length > 0 && (
            <div style={{ margin: '6px 0' }}>
              <strong>Dietary:</strong>{' '}
              {labelsFromArray(p.dietary_preferences, DIETARY_OPTIONS).map(l => <Pill key={l}>{l}</Pill>)}
            </div>
          )}
          {Array.isArray(p.religious_observance) && p.religious_observance.length > 0 && (
            <div style={{ margin: '6px 0' }}>
              <strong>Observance:</strong>{' '}
              {labelsFromArray(p.religious_observance, RELIGION_OPTIONS).map(l => <Pill key={l}>{l}</Pill>)}
            </div>
          )}
        </Sub>
      )}
    </div>
  )
}

function Sub({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h4 style={{
        fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600,
        color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.01em'
      }}>{title}</h4>
      <div style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.65 }}>{children}</div>
    </div>
  )
}

function Pill({ children, active = true, muted = false }) {
  return (
    <span style={{
      display: 'inline-block', marginRight: 6, marginBottom: 4,
      padding: '3px 11px', borderRadius: 999,
      background: muted ? 'var(--line-soft)' : 'var(--mint-soft)',
      color: muted ? 'var(--ink-muted)' : 'var(--accent)',
      fontSize: 13, fontWeight: 600,
      border: `1px solid ${muted ? 'var(--line)' : 'var(--mint-deep)'}`
    }}>{children}</span>
  )
}

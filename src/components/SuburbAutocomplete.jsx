import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase.js'

/**
 * Lightweight suburb autocomplete powered by suburb_guides.
 * - Shows up to 8 matches on each keystroke (debounced 180ms)
 * - Each suggestion renders as "Suburb, STATE"
 * - Clicking a suggestion calls onPick({ suburb, state })
 * - Keyboard arrows + Enter supported
 * - Falls back to free-text (input value) if nothing picked
 */
export default function SuburbAutocomplete({
  value, onChange, onPickState, placeholder = 'e.g. Parramatta', ...rest
}) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const wrapRef = useRef(null)

  useEffect(() => {
    const trimmed = (value || '').trim()
    if (trimmed.length < 2) { setSuggestions([]); return }
    let cancelled = false
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('suburb_guides')
        .select('suburb, state')
        .ilike('suburb', `${trimmed}%`)
        .order('suburb')
        .limit(8)
      if (!cancelled) setSuggestions(data || [])
    }, 180)
    return () => { cancelled = true; clearTimeout(t) }
  }, [value])

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  function pick(s) {
    onChange({ target: { value: s.suburb } })
    if (onPickState) onPickState(s.state)
    setOpen(false)
    setActive(-1)
  }

  function onKey(e) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, suggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(suggestions[active]) }
    else if (e.key === 'Escape') { setOpen(false); setActive(-1) }
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1 }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        autoComplete="off"
        {...rest}
      />
      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
            background: 'var(--white)', border: '1px solid var(--line)',
            borderRadius: 12, boxShadow: 'var(--shadow-lg)',
            padding: 4, margin: 0, listStyle: 'none', zIndex: 50,
            maxHeight: 280, overflowY: 'auto'
          }}
        >
          {suggestions.map((s, i) => (
            <li key={`${s.suburb}-${s.state}`}>
              <button
                type="button"
                role="option"
                aria-selected={i === active}
                onClick={() => pick(s)}
                onMouseEnter={() => setActive(i)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 12px', borderRadius: 8,
                  background: i === active ? 'var(--mint-soft)' : 'transparent',
                  color: 'var(--ink)', fontSize: 14, cursor: 'pointer', border: 'none'
                }}
              >
                <strong>{s.suburb}</strong>
                <span style={{ marginLeft: 6, color: 'var(--ink-muted)', fontSize: 12, fontWeight: 600 }}>
                  {s.state}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

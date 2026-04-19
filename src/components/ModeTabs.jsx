import { Link } from 'react-router-dom'

const TABS = [
  { key: 'rent',      label: 'Rent',       href: '/search?type=rent' },
  { key: 'buy',       label: 'Buy',        href: '/search?type=buy',       soon: true },
  { key: 'flatmates', label: 'Flatmates',  href: '/search?type=flatmates' },
  { key: 'suburbs',   label: 'Suburbs',    href: '/suburbs' }
]

export default function ModeTabs({ activeTab = 'rent', centered = true, className = '' }) {
  return (
    <div
      className={`search-tabs ${className}`}
      role="tablist"
      style={{ marginBottom: 0, justifyContent: centered ? 'center' : 'flex-start' }}
    >
      {TABS.map(t => (
        <Link
          key={t.key}
          to={t.href}
          role="tab"
          aria-selected={activeTab === t.key}
          className={`search-tab ${activeTab === t.key ? 'active' : ''}`}
        >
          {t.label}
          {t.soon && (
            <span className="tab-soon" aria-label="Coming soon">soon</span>
          )}
        </Link>
      ))}
    </div>
  )
}

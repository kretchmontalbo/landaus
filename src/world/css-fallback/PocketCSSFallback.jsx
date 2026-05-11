import styles from './styles.module.css'

export default function PocketCSSFallback({ pocket }) {
  const pocketClass = styles[pocket] || styles.default
  return <div className={`${styles.fallback} ${pocketClass}`} aria-hidden="true" />
}

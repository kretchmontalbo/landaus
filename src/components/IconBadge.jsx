/**
 * IconBadge — mint rounded-square wrapper around a Lucide icon.
 * Use `size="sm"` (40px) for inline lists, default (56px) for feature cards.
 *
 *   <IconBadge icon={Sparkles} />
 *   <IconBadge icon={ShieldCheck} size="sm" />
 */
export default function IconBadge({ icon: Icon, size = 'md', className = '', strokeWidth = 1.5 }) {
  if (!Icon) return null
  const px = size === 'sm' ? 20 : 26
  const cls = size === 'sm' ? 'feature-icon-bg-sm' : 'feature-icon-bg'
  return (
    <span className={`${cls} ${className}`} aria-hidden="true">
      <Icon size={px} strokeWidth={strokeWidth} />
    </span>
  )
}

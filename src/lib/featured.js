import { supabase } from './supabase.js'

// Returns a Set of property_ids that currently have an active feature boost.
// Active means: boost_starts_at <= now < boost_ends_at.
export async function getActiveFeaturedIds() {
  const now = new Date().toISOString()
  try {
    const { data, error } = await supabase
      .from('featured_boosts')
      .select('property_id')
      .lte('boost_starts_at', now)
      .gt('boost_ends_at', now)
    if (error) return new Set()
    return new Set((data || []).map(b => b.property_id))
  } catch {
    return new Set()
  }
}

// Apply the featured flag to properties and sort featured ones first.
export function applyFeaturedMerge(properties, featuredIds) {
  if (!Array.isArray(properties)) return properties
  const withFlag = properties.map(p =>
    featuredIds.has(p.id) ? { ...p, is_featured: true } : p
  )
  withFlag.sort((a, b) => Number(b.is_featured || false) - Number(a.is_featured || false))
  return withFlag
}

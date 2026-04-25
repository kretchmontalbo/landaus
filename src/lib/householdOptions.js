// Shared option sets and label maps for flatmate / household attributes.
// Keep values aligned with the properties columns added in the 2026-04-21 migration.

export const ROOM_TYPES = [
  { value: 'private_bedroom_shared_bathroom', label: 'Private bedroom (shared bathroom)' },
  { value: 'private_bedroom_private_bathroom', label: 'Private bedroom (private bathroom)' },
  { value: 'ensuite', label: 'Ensuite' },
  { value: 'shared_bedroom', label: 'Shared bedroom' },
  { value: 'master_with_ensuite', label: 'Master with ensuite' },
  { value: 'studio', label: 'Studio' }
]

export const HOUSEHOLD_GENDER = [
  { value: 'women_only', label: 'Women only' },
  { value: 'men_only', label: 'Men only' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'non_binary_inclusive', label: 'Non-binary inclusive' }
]

export const SMOKING_OPTIONS = [
  { value: 'no_smoking', label: 'No smoking anywhere' },
  { value: 'outdoor_only', label: 'Outdoor only' },
  { value: 'balcony_only', label: 'Balcony only' },
  { value: 'allowed', label: 'Allowed' }
]

export const DRINKING_OPTIONS = [
  { value: 'no_alcohol', label: 'Alcohol-free household' },
  { value: 'occasional', label: 'Occasional' },
  { value: 'social', label: 'Social' },
  { value: 'not_specified', label: 'Prefer not to specify' }
]

export const DIETARY_OPTIONS = [
  { value: 'halal_household', label: 'Halal household' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'vegetarian_only', label: 'Vegetarian only' },
  { value: 'vegan_friendly', label: 'Vegan-friendly' },
  { value: 'no_preference', label: 'No preference' }
]

export const RELIGION_OPTIONS = [
  { value: 'quiet_prayer_times', label: 'Quiet during prayer times' },
  { value: 'shared_faith_welcome', label: 'Shared faith welcome' },
  { value: 'secular', label: 'Secular household' }
]

export const LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English', code: 'EN' },
  { value: 'tagalog', label: 'Tagalog / Filipino', code: 'TL' },
  { value: 'mandarin', label: 'Mandarin', code: '中' },
  { value: 'cantonese', label: 'Cantonese', code: '粤' },
  { value: 'korean', label: 'Korean', code: 'KO' },
  { value: 'japanese', label: 'Japanese', code: 'JP' },
  { value: 'hindi', label: 'Hindi', code: 'HI' },
  { value: 'tamil', label: 'Tamil', code: 'TA' },
  { value: 'arabic', label: 'Arabic', code: 'عر' },
  { value: 'spanish', label: 'Spanish', code: 'ES' },
  { value: 'vietnamese', label: 'Vietnamese', code: 'VI' },
  { value: 'indonesian', label: 'Indonesian', code: 'ID' },
  { value: 'thai', label: 'Thai', code: 'TH' }
]

export const ACCEPT_TOGGLES = [
  { key: 'accepts_students', label: 'Students', defaultOn: true },
  { key: 'accepts_professionals', label: 'Working professionals', defaultOn: true },
  { key: 'accepts_backpackers', label: 'Backpackers (short-term)', defaultOn: false },
  { key: 'accepts_couples', label: 'Couples', defaultOn: true },
  { key: 'accepts_families_with_children', label: 'Families with children', defaultOn: false },
  { key: 'accepts_pets', label: 'Pets allowed', defaultOn: false }
]

// `iconKey` is a string key — consumers map it to a Lucide component
// (kept here as data, not as JSX, so this remains a pure JS module).
export const INCLUSIVITY_TOGGLES = [
  { key: 'lgbtqia_friendly', iconKey: 'lgbtqia', label: 'LGBTQIA+ friendly household' },
  { key: 'women_safe_space', iconKey: 'women', label: 'Women-safe space' },
  { key: 'disability_accessible', iconKey: 'accessible', label: 'Disability accessible' }
]

export function labelFromOptions(value, options) {
  return options.find(o => o.value === value)?.label || value
}

export function labelsFromArray(arr, options) {
  if (!Array.isArray(arr)) return []
  return arr.map(v => labelFromOptions(v, options))
}

export function isRoomish(propertyType) {
  return propertyType === 'room' || propertyType === 'studio' || propertyType === 'shared'
}

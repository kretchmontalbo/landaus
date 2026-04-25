import { useEffect, useRef, useState } from 'react'

/**
 * Stripe-style photo gallery for property detail pages.
 * Desktop: hero image LEFT (60%) + 2x2 thumbnail grid RIGHT (40%, up to 4 thumbs).
 *   "+N more" overlay on the last thumb when there are >5 images.
 * Click anything → fullscreen lightbox with arrow-key nav, swipe gestures, Esc close.
 */
export default function PropertyGallery({ images, alt = '' }) {
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(0)
  const touchStartX = useRef(null)

  const list = Array.isArray(images) && images.length > 0 ? images : []
  if (list.length === 0) return null

  function openAt(i) {
    setIdx(i)
    setOpen(true)
  }
  function close() { setOpen(false) }
  function next() { setIdx(i => (i + 1) % list.length) }
  function prev() { setIdx(i => (i - 1 + list.length) % list.length) }

  // Keyboard nav + body scroll lock while open
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e) {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, list.length])

  function onTouchStart(e) { touchStartX.current = e.touches?.[0]?.clientX ?? null }
  function onTouchEnd(e) {
    if (touchStartX.current == null) return
    const endX = e.changedTouches?.[0]?.clientX
    if (endX == null) return
    const dx = endX - touchStartX.current
    if (Math.abs(dx) > 50) {
      if (dx < 0) next()
      else prev()
    }
    touchStartX.current = null
  }

  const hero = list[0]
  const thumbs = list.slice(1, 5) // up to 4 thumbnails
  const remaining = Math.max(0, list.length - 5)

  return (
    <>
      <div className="pg-grid">
        <button
          type="button"
          className="pg-hero"
          onClick={() => openAt(0)}
          aria-label={`Open photo 1 of ${list.length}`}
        >
          <img src={hero} alt={alt || 'Property hero photo'} />
        </button>

        {thumbs.length > 0 && (
          <div className="pg-thumbs">
            {thumbs.map((src, i) => {
              const realIndex = i + 1
              const isLast = i === thumbs.length - 1 && remaining > 0
              return (
                <button
                  type="button"
                  key={`${src}-${realIndex}`}
                  className="pg-thumb"
                  onClick={() => openAt(realIndex)}
                  aria-label={`Open photo ${realIndex + 1} of ${list.length}`}
                >
                  <img src={src} alt={`${alt} photo ${realIndex + 1}`} loading="lazy" />
                  {isLast && (
                    <span className="pg-thumb-more" aria-hidden="true">
                      +{remaining} more
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {open && (
        <div
          className="pg-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            className="pg-close"
            aria-label="Close gallery"
            onClick={(e) => { e.stopPropagation(); close() }}
          >×</button>

          {list.length > 1 && (
            <>
              <button
                type="button"
                className="pg-nav pg-nav-prev"
                aria-label="Previous photo"
                onClick={(e) => { e.stopPropagation(); prev() }}
              >‹</button>
              <button
                type="button"
                className="pg-nav pg-nav-next"
                aria-label="Next photo"
                onClick={(e) => { e.stopPropagation(); next() }}
              >›</button>
            </>
          )}

          <div className="pg-stage" onClick={e => e.stopPropagation()}>
            <img
              key={idx}
              src={list[idx]}
              alt={`${alt} photo ${idx + 1} of ${list.length}`}
              className="pg-image"
            />
          </div>

          <div className="pg-counter">
            {idx + 1} / {list.length}
          </div>
        </div>
      )}
    </>
  )
}

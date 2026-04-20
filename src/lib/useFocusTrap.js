import { useEffect, useRef } from 'react'

/**
 * Trap keyboard focus inside a modal-like element.
 * - On mount: remember the previously focused element and move focus into the trap
 * - Tab / Shift+Tab cycle within the focusable descendants
 * - Escape fires onEscape()
 * - On unmount: restore focus to the previously focused element
 *
 * Usage:
 *   const ref = useFocusTrap({ active: open, onEscape: close })
 *   <div ref={ref}>...</div>
 */
export function useFocusTrap({ active = true, onEscape } = {}) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!active || !containerRef.current) return
    const container = containerRef.current
    const previouslyFocused = typeof document !== 'undefined' ? document.activeElement : null

    const SELECTOR = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',')

    function getFocusable() {
      return Array.from(container.querySelectorAll(SELECTOR))
        .filter(el => !el.hasAttribute('aria-hidden') && el.offsetParent !== null)
    }

    // Move focus in on mount
    const focusables = getFocusable()
    if (focusables.length) focusables[0].focus()

    function onKey(e) {
      if (e.key === 'Escape') {
        if (onEscape) { e.stopPropagation(); onEscape() }
        return
      }
      if (e.key !== 'Tab') return
      const items = getFocusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus()
      }
    }

    container.addEventListener('keydown', onKey)
    return () => {
      container.removeEventListener('keydown', onKey)
      if (previouslyFocused instanceof HTMLElement) {
        try { previouslyFocused.focus() } catch {}
      }
    }
  }, [active, onEscape])

  return containerRef
}

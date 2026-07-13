import { useCallback, useRef } from "react"

type RefValidation = (node: HTMLFormElement | null) => void

/**
 * Returns a callback ref that wires a `<form>` with rapid-form's `refValidation`
 * and keeps it wired as the DOM changes.
 *
 * rapid-form attaches its `input` listeners only to the elements present (and
 * `required`) at the moment `refValidation` runs. Fields mounted later in a
 * descendant-only render — or fields that become `required` after mount — would
 * never be wired: user changes on them update the DOM but are silently ignored
 * by form state. A MutationObserver re-runs `refValidation` whenever named
 * fields are added or a `required` attribute changes. Re-running is safe:
 * rapid-form skips elements that already have a listener attached.
 */
export function useFormWiring(refValidation: RefValidation): RefValidation {
  const observerRef = useRef<MutationObserver | null>(null)

  return useCallback(
    (node: HTMLFormElement | null) => {
      observerRef.current?.disconnect()
      observerRef.current = null
      refValidation(node)
      if (node == null) return

      const observer = new MutationObserver((mutations) => {
        const needsRewire = mutations.some((mutation) =>
          mutation.type === "attributes"
            ? (mutation.target as Element).getAttribute("name") != null
            : Array.from(mutation.addedNodes).some(
                (added) =>
                  added instanceof Element &&
                  (added.hasAttribute("name") || added.querySelector("[name]") != null)
              )
        )
        if (needsRewire) refValidation(node)
      })
      observer.observe(node, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["required"],
      })
      observerRef.current = observer
    },
    [refValidation]
  )
}

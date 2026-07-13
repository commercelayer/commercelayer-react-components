/**
 * Tests for useFormWiring using the REAL rapid-form (no mock).
 *
 * rapid-form wires listeners only to the elements present (and required) when
 * refValidation runs. useFormWiring must keep the form wired when:
 * - a field mounts later in a descendant-only render (parent holding the form
 *   ref does not re-render, so the callback ref is not re-invoked)
 * - a field becomes `required` after mount (attribute change, no childList
 *   mutation)
 * In both cases the failure mode without the observer is "change silently
 * ignored": the input event fires on the DOM but never reaches values.
 */
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useRapidForm } from "rapid-form"
import { type JSX, useEffect, useState } from "react"
import { useFormWiring } from "#hooks/useFormWiring"

function LateMountedField(): JSX.Element | null {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // Mounts the field in a commit triggered by this component's own state,
    // so the component holding the form ref does not re-render.
    const timer = setTimeout(() => {
      setMounted(true)
    }, 5)
    return () => {
      clearTimeout(timer)
    }
  }, [])
  if (!mounted) return null
  return <input type="text" name="nickname" required data-testid="late-field" />
}

function LateRequiredField(): JSX.Element {
  const [required, setRequired] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      setRequired(true)
    }, 5)
    return () => {
      clearTimeout(timer)
    }
  }, [])
  return <input type="text" name="nickname" required={required} data-testid="field" />
}

function Harness({ children }: { children: JSX.Element }): JSX.Element {
  const { refValidation, values } = useRapidForm()
  const wireForm = useFormWiring(refValidation)
  return (
    <form ref={wireForm}>
      {children}
      <output data-testid="values">{JSON.stringify(values)}</output>
    </form>
  )
}

function readValues(): Record<string, { value?: string } | undefined> {
  return JSON.parse(screen.getByTestId("values").textContent ?? "{}")
}

describe("useFormWiring (real rapid-form)", () => {
  it("wires fields mounted after the form ref attached (descendant-only render)", async () => {
    render(
      <Harness>
        <LateMountedField />
      </Harness>
    )

    expect(screen.queryByTestId("late-field")).toBeNull()
    const input = await screen.findByTestId("late-field")

    await act(async () => {
      fireEvent.input(input, { target: { value: "Ale" } })
    })

    await waitFor(() => {
      expect(readValues().nickname?.value).toBe("Ale")
    })
  })

  it("wires fields that become required after mount (attribute change only)", async () => {
    render(
      <Harness>
        <LateRequiredField />
      </Harness>
    )

    const input = screen.getByTestId("field") as HTMLInputElement
    await waitFor(() => {
      expect(input.required).toBe(true)
    })

    await act(async () => {
      fireEvent.input(input, { target: { value: "Ale" } })
    })

    await waitFor(() => {
      expect(readValues().nickname?.value).toBe("Ale")
    })
  })
})

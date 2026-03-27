import { render } from "@testing-library/react"
import { vi } from "vitest"
import AvailabilityContext from "#context/AvailabilityContext"
import useCustomContext from "#utils/hooks/useCustomContext"

function ContextChecker({ keyProp }: { keyProp: string | null }) {
  useCustomContext({
    context: AvailabilityContext,
    contextComponentName: "AvailabilityContainer",
    currentComponentName: "TestComponent",
    key: keyProp as string,
  })
  return null
}

describe("useCustomContext hook", () => {
  it("returns context when key is present in context object", () => {
    render(
      <AvailabilityContext.Provider value={{ parent: true, quantity: 5 }}>
        <ContextChecker keyProp="parent" />
      </AvailabilityContext.Provider>,
    )
  })

  it("returns context when key is null and context is non-null", () => {
    render(
      <AvailabilityContext.Provider value={{ quantity: 5 }}>
        <ContextChecker keyProp={null} />
      </AvailabilityContext.Provider>,
    )
  })

  it("throws when key is not found in context (used outside provider)", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => render(<ContextChecker keyProp="parent" />)).toThrow(
      "Cannot use <TestComponent/> outside of <AvailabilityContainer/>",
    )
    consoleError.mockRestore()
  })

  it("logs console.error in production when key is not found", () => {
    vi.stubEnv("NODE_ENV", "production")
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    render(<ContextChecker keyProp="parent" />)
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("Cannot use <TestComponent/>"),
    )
    consoleError.mockRestore()
    vi.unstubAllEnvs()
  })
})

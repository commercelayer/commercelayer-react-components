import { render } from "@testing-library/react"
import type { JSX } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useDeprecatedContainer } from "#utils/useDeprecatedContainer"

function Deprecated(): JSX.Element {
  useDeprecatedContainer("SomethingContainer", "`<Something>`")
  return <div />
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe("useDeprecatedContainer", () => {
  it("names the container, the replacement and when it goes away", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    render(<Deprecated />)

    expect(warn).toHaveBeenCalledWith(
      "[commercelayer-react-components] <SomethingContainer> is deprecated and will be removed in the next major version. Use `<Something>` instead."
    )
  })

  it("says nothing in production", () => {
    vi.stubEnv("NODE_ENV", "production")
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    render(<Deprecated />)

    expect(warn).not.toHaveBeenCalled()
  })

  it("warns again on a second mount", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    render(<Deprecated />)
    render(<Deprecated />)

    expect(warn).toHaveBeenCalledTimes(2)
  })
})

import { render, screen } from "@testing-library/react"
import { useContext } from "react"
import { describe, expect, it } from "vitest"
import { ExternalFunction } from "#components/ExternalFunction"
import { SubmitButton } from "#components/SubmitButton"
import ExternalFunctionContext from "#context/ExternalFunctionContext"
import { getCustomerIdByToken } from "#utils/getCustomerIdByToken"
import { sortAscIcon, sortDescIcon } from "#utils/icons"
import { isGuestToken } from "#utils/isGuestToken"

/** Builds an unsigned JWT whose payload decodes to `payload`. */
function makeToken(payload: Record<string, unknown>): string {
  const encode = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")

  return `${encode({ alg: "RS512", typ: "JWT" })}.${encode(payload)}.signature`
}

describe("getCustomerIdByToken", () => {
  it("extracts the owner id from a customer token", () => {
    const token = makeToken({ owner: { id: "cust_1", type: "Customer" } })

    expect(getCustomerIdByToken(token)).toBe("cust_1")
  })

  it("returns undefined for a token with no owner", () => {
    expect(getCustomerIdByToken(makeToken({}))).toBeUndefined()
  })
})

describe("isGuestToken", () => {
  it("is true when the token carries no owner", () => {
    expect(isGuestToken(makeToken({}))).toBe(true)
  })

  it("is false when the token has an owner", () => {
    expect(isGuestToken(makeToken({ owner: { id: "cust_1", type: "Customer" } }))).toBe(false)
  })
})

describe("icons", () => {
  it("renders the sort icons as svg elements", () => {
    const { container } = render(
      <div>
        {sortAscIcon}
        {sortDescIcon}
      </div>
    )

    expect(container.querySelectorAll("svg")).toHaveLength(2)
  })
})

describe("SubmitButton", () => {
  it("renders a submit button with the default label", () => {
    render(<SubmitButton />)

    const button = screen.getByRole("button")
    expect(button.textContent).toBe("Submit")
    expect(button.getAttribute("type")).toBe("submit")
  })

  it("renders a string label", () => {
    render(<SubmitButton label="Place order" />)

    expect(screen.getByRole("button").textContent).toBe("Place order")
  })

  it("calls a function label", () => {
    render(<SubmitButton label={() => <span data-testid="node">Go</span>} />)

    expect(screen.getByTestId("node").textContent).toBe("Go")
  })

  it("hands props to a children function", () => {
    render(
      <SubmitButton label="Place order">
        {({ label }) => <button type="button" data-testid="custom">{`${label}!`}</button>}
      </SubmitButton>
    )

    expect(screen.getByTestId("custom").textContent).toBe("Place order!")
  })
})

describe("ExternalFunction", () => {
  it("publishes the url and caller on context", () => {
    let captured: { url?: string; callExternalFunction?: unknown } = {}

    function Consumer() {
      captured = useContext(ExternalFunctionContext)
      return null
    }

    render(
      <ExternalFunction url="https://fn.test/hook">
        <Consumer />
      </ExternalFunction>
    )

    expect(captured.url).toBe("https://fn.test/hook")
    expect(typeof captured.callExternalFunction).toBe("function")
  })
})

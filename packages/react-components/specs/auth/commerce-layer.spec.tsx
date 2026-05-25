import { render, screen } from "@testing-library/react"
import { useContext } from "react"
import CommerceLayer from "#components/auth/CommerceLayer"
import CommerceLayerContext, { type CommerceLayerConfig } from "#context/CommerceLayerContext"

function ContextInspector({ onContext }: { onContext: (ctx: CommerceLayerConfig) => void }) {
  const ctx = useContext(CommerceLayerContext)
  onContext(ctx)
  return null
}

function makeFakeToken(slug: string): string {
  const header = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
  const payload = btoa(JSON.stringify({ organization: { slug } }))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
  return `${header}.${payload}.fakesig`
}

describe("CommerceLayer component", () => {
  it("renders children", () => {
    const token = makeFakeToken("test-org")
    render(
      <CommerceLayer accessToken={token}>
        <span data-testid="child">hello</span>
      </CommerceLayer>
    )
    expect(screen.getByTestId("child").textContent).toBe("hello")
  })

  it("provides accessToken to context", () => {
    const token = makeFakeToken("my-org")
    let captured: CommerceLayerConfig = {}
    render(
      <CommerceLayer accessToken={token}>
        <ContextInspector
          onContext={(ctx) => {
            captured = ctx
          }}
        />
      </CommerceLayer>
    )
    expect(captured.accessToken).toBe(token)
  })

  it("does not expose endpoint in context", () => {
    const token = makeFakeToken("my-org")
    let captured: CommerceLayerConfig = {}
    render(
      <CommerceLayer accessToken={token}>
        <ContextInspector
          onContext={(ctx) => {
            captured = ctx
          }}
        />
      </CommerceLayer>
    )
    expect("endpoint" in captured).toBe(false)
  })

  it("re-renders with same props (cache-hit path)", () => {
    const token = makeFakeToken("my-org")
    const child = <span data-testid="stable-child">stable</span>
    const { rerender } = render(<CommerceLayer accessToken={token}>{child}</CommerceLayer>)
    rerender(<CommerceLayer accessToken={token}>{child}</CommerceLayer>)
    expect(screen.getByTestId("stable-child").textContent).toBe("stable")
  })
})

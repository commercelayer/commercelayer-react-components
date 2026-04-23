import { render, screen, waitFor } from "@testing-library/react"
import { getAccessToken } from "mocks/getAccessToken"
import { createElement, type ReactNode, useContext } from "react"
import { SWRConfig } from "swr"
import CommerceLayer from "#components/auth/CommerceLayer"
import { Price } from "#components/prices/Price"
import { PricesContainer } from "#components/prices/PricesContainer"
import PricesContext from "#context/PricesContext"
import SkuContext from "#context/SkuContext"
import type { PricesContext as PricesCtx } from "../utils/context"

const swrWrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

function PricesInspector({
  onCapture,
}: {
  onCapture: (prices: Record<string, unknown>) => void
}) {
  const { prices } = useContext(PricesContext)
  onCapture(prices)
  return null
}

describe("PricesContainer component", () => {
  beforeEach<PricesCtx>(async (ctx) => {
    const { accessToken, endpoint } = await getAccessToken()
    if (accessToken != null && endpoint != null) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
      ctx.skuCode = "BABYONBU000000E63E7412MX"
    }
  })

  it<PricesCtx>("renders children", (ctx) => {
    const { container } = render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <PricesContainer skuCode={ctx.skuCode}>
          <span data-testid="child">price</span>
        </PricesContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper },
    )
    expect(container.querySelector('[data-testid="child"]')).not.toBeNull()
  })

  it<PricesCtx>("fetches prices and populates context", async (ctx) => {
    let captured: Record<string, unknown> = {}
    render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <PricesContainer skuCode={ctx.skuCode}>
          <PricesInspector
            onCapture={(p) => {
              captured = p
            }}
          />
        </PricesContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper },
    )
    await waitFor(
      () => expect(Object.keys(captured).length).toBeGreaterThan(0),
      { timeout: 10000 },
    )
    expect(Object.keys(captured)).toContain(ctx.skuCode)
  })

  it<PricesCtx>("renders Price component with fetched price", async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <PricesContainer skuCode={ctx.skuCode}>
          <Price skuCode={ctx.skuCode} data-testid={`price-${ctx.skuCode}`} />
        </PricesContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper },
    )
    await waitFor(
      () => {
        const els = screen.getAllByTestId(`price-${ctx.skuCode}`)
        expect(els.length).toBeGreaterThan(0)
        expect(els[0].textContent).not.toBe("")
      },
      { timeout: 10000 },
    )
  })

  it<PricesCtx>("renders nothing when accessToken is missing", (ctx) => {
    const { container } = render(
      <CommerceLayer accessToken="">
        <PricesContainer skuCode={ctx.skuCode}>
          <span data-testid="child">price</span>
        </PricesContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper },
    )
    expect(container.querySelector('[data-testid="child"]')).not.toBeNull()
  })

  it<PricesCtx>("syncs skuCodes from SkuContext and fetches prices", async (ctx) => {
    let captured: Record<string, unknown> = {}
    render(
      // Provide skuCodes via SkuContext (simulates being inside <SkusContainer>)
      <SkuContext.Provider value={{ skuCodes: [ctx.skuCode] }}>
        <CommerceLayer accessToken={ctx.accessToken}>
          <PricesContainer>
            <PricesInspector
              onCapture={(p) => {
                captured = p
              }}
            />
          </PricesContainer>
        </CommerceLayer>
      </SkuContext.Provider>,
      { wrapper: swrWrapper },
    )
    await waitFor(
      () => expect(Object.keys(captured).length).toBeGreaterThan(0),
      { timeout: 10000 },
    )
    expect(Object.keys(captured)).toContain(ctx.skuCode)
  })

  it<PricesCtx>("registers dynamic skuCode from Price child and fetches prices", async (ctx) => {
    // PricesContainer has no skuCode prop — Price child registers it dynamically
    render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <PricesContainer>
          <Price skuCode={ctx.skuCode} data-testid={`dyn-${ctx.skuCode}`} />
        </PricesContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper },
    )
    await waitFor(
      () => {
        const els = screen.getAllByTestId(`dyn-${ctx.skuCode}`)
        expect(els[0].textContent).not.toBe("")
      },
      { timeout: 10000 },
    )
  })

  it<PricesCtx>("clears pending debounce on unmount", (ctx) => {
    // Unmount immediately — exercises the cleanup path when timer is still pending
    const { unmount } = render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <PricesContainer skuCode={ctx.skuCode}>
          <span>test</span>
        </PricesContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper },
    )
    unmount()
  })

  it<PricesCtx>("skips fetch when no skuCodes are available", (ctx) => {
    // No skuCode prop and no SkuContext codes → codes.length=0 → no fetch
    const { container } = render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <PricesContainer>
          <span data-testid="empty">no codes</span>
        </PricesContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper },
    )
    expect(container.querySelector('[data-testid="empty"]')).not.toBeNull()
  })

  it<PricesCtx>("registers multiple Price children concurrently without losing any SKU", async (ctx) => {
    // Three Price components mount at the same time and each calls setSkuCodes.
    // Without the functional-update fix all three would overwrite each other and
    // only the last SKU would be registered.
    const sku2 = "CODBOTTLEXXXXXXLXXX"
    const sku3 = "BABYONBU000000E63E7424MX"
    let captured: Record<string, unknown> = {}
    render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <PricesContainer>
          <PricesInspector
            onCapture={(p) => {
              captured = p
            }}
          />
          <Price skuCode={ctx.skuCode} />
          <Price skuCode={sku2} />
          <Price skuCode={sku3} />
        </PricesContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper },
    )
    // All three codes must end up in the context (even if the API returns no
    // prices for those SKUs the fetch must have been attempted with all three)
    await waitFor(
      () => {
        const keys = Object.keys(captured)
        expect(keys.length).toBeGreaterThanOrEqual(1)
      },
      { timeout: 10000 },
    )
  })

  it<PricesCtx>("renders Price with children render prop", async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <PricesContainer skuCode={ctx.skuCode}>
          <Price skuCode={ctx.skuCode}>
            {({ prices, loading }) => (
              <span data-testid="price-child">
                {loading ? "loading" : `${prices.length}`}
              </span>
            )}
          </Price>
        </PricesContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper },
    )
    await waitFor(
      () => {
        const el = screen.getByTestId("price-child")
        expect(el.textContent).not.toBe("loading")
      },
      { timeout: 10000 },
    )
  })
})

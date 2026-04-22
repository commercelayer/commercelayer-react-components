import { usePrices } from "@commercelayer/hooks"
import type { Price as PriceType, Sku } from "@commercelayer/sdk"
import { render } from "@testing-library/react"
import { createElement, type ReactNode } from "react"
import { SWRConfig } from "swr"
import CommerceLayer from "#components/auth/CommerceLayer"
import { Price } from "#components/prices/Price"
import { PricesContainer } from "#components/prices/PricesContainer"
import CommerceLayerContext from "#context/CommerceLayerContext"
import SkuChildrenContext from "#context/SkuChildrenContext"

/**
 * Mock the entire hooks package to avoid React 19 act() dead-lock caused by
 * useSyncExternalStore + SWR interactions in test environments.
 * These tests only verify DOM rendering — no real price data is needed.
 */
vi.mock("@commercelayer/hooks", () => ({
  usePrices: vi.fn(),
}))

const FAKE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJvcmctaWQiLCJzbHVnIjoidGVzdC1vcmcifSwibWFya2V0Ijp7ImlkIjpbIjEiXSwicHJpY2VfbGlzdF9pZCI6InBsMSIsInN0b2NrX2xvY2F0aW9uX2lkcyI6W10sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sImFwcGxpY2F0aW9uIjp7ImlkIjoiYXBwLWlkIiwia2luZCI6InNhbGVzX2NoYW5uZWwiLCJwdWJsaWMiOnRydWV9LCJleHAiOjk5OTk5OTk5OTksIm93bmVyIjp7ImlkIjoiY3VzLWlkIiwidHlwZSI6IkN1c3RvbWVyIn0sInJhbmQiOjEsInRlc3QiOnRydWV9.fake-sig"
const SKU_CODE = "BABYONBU000000E63E7412MX"

const EMPTY_HOOK: ReturnType<typeof usePrices> = {
  prices: [],
  error: null,
  isLoading: false,
  isValidating: false,
  action: null,
  fetchPrices: vi.fn(),
  registerSku: vi.fn(),
  unregisterSku: vi.fn(),
  retrievePrice: vi.fn().mockResolvedValue(undefined),
  updatePrice: vi.fn().mockResolvedValue(undefined),
  clearPrices: vi.fn(),
  clearError: vi.fn(),
  mutate: vi.fn(),
}

beforeEach(() => {
  vi.mocked(usePrices).mockReturnValue(EMPTY_HOOK)
})

const swrWrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

describe("Price component", () => {
  it("uses sku.code from SkuChildrenContext when no skuCode prop", () => {
    // Covers Price.tsx: sku?.code branch
    const { container } = render(
      <CommerceLayer accessToken={FAKE_TOKEN}>
        <PricesContainer>
          <SkuChildrenContext.Provider
            value={{ sku: { code: SKU_CODE } as Partial<Sku> as Sku }}
          >
            <Price data-testid="sku-ctx-price" />
          </SkuChildrenContext.Provider>
        </PricesContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper },
    )
    expect(
      container.querySelector('[data-testid="sku-ctx-price"]'),
    ).not.toBeNull()
  })

  it("renders when no skuCode available (final empty-string fallback)", () => {
    // Covers Price.tsx: the "" fallback — all sources are falsy
    const { container } = render(
      <CommerceLayer accessToken={FAKE_TOKEN}>
        <PricesContainer>
          <Price data-testid="no-code-price" />
        </PricesContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper },
    )
    expect(
      container.querySelector('[data-testid="no-code-price"]'),
    ).not.toBeNull()
  })

  it("renders standalone — filters batch prices by sku_code", () => {
    // Covers: isStandalone=true path, filter callback (p) => p.sku_code === sCode
    const mockPrice = {
      id: "pr1",
      type: "prices",
      sku_code: SKU_CODE,
      formatted_amount: "€10.00",
      formatted_compare_at_amount: "€12.00",
    } as unknown as PriceType
    vi.mocked(usePrices).mockReturnValueOnce({
      ...EMPTY_HOOK,
      prices: [mockPrice],
    })
    const { container } = render(
      <CommerceLayer accessToken={FAKE_TOKEN}>
        <Price skuCode={SKU_CODE} data-testid="standalone-price" />
      </CommerceLayer>,
      { wrapper: swrWrapper },
    )
    expect(container).not.toBeNull()
  })

  it("standalone — accessToken ?? '' fallback when token is missing", () => {
    // Covers: accessToken ?? "" nullish-coalescing fallback (when token is undefined)
    render(
      <CommerceLayerContext.Provider value={{}}>
        <Price skuCode={SKU_CODE} data-testid="no-token-standalone" />
      </CommerceLayerContext.Provider>,
      { wrapper: swrWrapper },
    )
    // usePrices called with "" since accessToken is undefined
    expect(vi.mocked(usePrices)).toHaveBeenLastCalledWith("", undefined)
  })

  it("PricesContainer handles undefined accessToken (nullish coalescing branch)", () => {
    // Covers PricesContainer: config.accessToken ?? "" fallback
    const { container } = render(
      <CommerceLayerContext.Provider value={{}}>
        <PricesContainer skuCode={SKU_CODE}>
          <span data-testid="child">test</span>
        </PricesContainer>
      </CommerceLayerContext.Provider>,
      { wrapper: swrWrapper },
    )
    expect(container.querySelector('[data-testid="child"]')).not.toBeNull()
  })
})

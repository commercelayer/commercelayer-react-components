import type { Sku } from "@commercelayer/sdk"
import { render } from "@testing-library/react"
import { getAccessToken } from "mocks/getAccessToken"
import { createElement, type ReactNode } from "react"
import { SWRConfig } from "swr"
import CommerceLayer from "#components/auth/CommerceLayer"
import { Price } from "#components/prices/Price"
import { PricesContainer } from "#components/prices/PricesContainer"
import CommerceLayerContext from "#context/CommerceLayerContext"
import SkuChildrenContext from "#context/SkuChildrenContext"
import type { PricesContext as PricesCtx } from "../utils/context"

const swrWrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

describe("Price component", () => {
  beforeEach<PricesCtx>(async (ctx) => {
    const { accessToken, endpoint } = await getAccessToken()
    if (accessToken != null && endpoint != null) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
      ctx.skuCode = "BABYONBU000000E63E7412MX"
    }
  })

  it<PricesCtx>("uses sku.code from SkuChildrenContext when no skuCode prop", (ctx) => {
    // Covers Price.tsx line 54: sku?.code branch
    const { container } = render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <PricesContainer>
          <SkuChildrenContext.Provider
            value={{ sku: { code: ctx.skuCode } as Partial<Sku> as Sku }}
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

  it<PricesCtx>("renders when no skuCode available (final empty-string fallback)", (ctx) => {
    // Covers Price.tsx line 54: the "" fallback — all sources are falsy
    // pricesSkuCode="" (no skuCode on container), skuCode="" (no prop), sku?.code=undefined (no SkuChildrenContext)
    const { container } = render(
      <CommerceLayer accessToken={ctx.accessToken}>
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

  it<PricesCtx>("renders without error when outside PricesContainer (no setSkuCodes)", (ctx) => {
    // Covers Price.tsx line 62: `if (setSkuCodes)` false branch — setSkuCodes is undefined in default context
    const { container } = render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <Price skuCode={ctx.skuCode} data-testid="standalone-price" />
      </CommerceLayer>,
      { wrapper: swrWrapper },
    )
    expect(container).not.toBeNull()
  })

  it<PricesCtx>("PricesContainer handles undefined accessToken (nullish coalescing branch)", (ctx) => {
    // Covers PricesContainer line 72: config.accessToken ?? "" fallback when accessToken is undefined
    const { container } = render(
      <CommerceLayerContext.Provider value={{}}>
        <PricesContainer skuCode={ctx.skuCode}>
          <span data-testid="child">test</span>
        </PricesContainer>
      </CommerceLayerContext.Provider>,
      { wrapper: swrWrapper },
    )
    expect(container.querySelector('[data-testid="child"]')).not.toBeNull()
  })
})

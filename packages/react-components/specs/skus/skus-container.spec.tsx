import { render, screen, waitFor } from "@testing-library/react"
import { getAccessToken } from "mocks/getAccessToken"
import { createElement, type ReactNode } from "react"
import { SWRConfig } from "swr"
import CommerceLayer from "#components/auth/CommerceLayer"
import SkuField from "#components/skus/SkuField"
import Skus from "#components/skus/Skus"
import { SkusContainer } from "#components/skus/SkusContainer"
import type { SkusContext } from "../utils/context"

const swrWrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

describe("SkusContainer component", () => {
  beforeEach<SkusContext>(async (ctx) => {
    const { accessToken, endpoint } = await getAccessToken()
    if (accessToken != null && endpoint != null) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
      ctx.sku = "BABYONBU000000E63E7412MX"
      ctx.skus = ["BABYONBU000000E63E7412MX", "BABYONBU000000FFFFFF12MX"]
    }
  })

  it<SkusContext>("renders SKU code fields for all skus", async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <SkusContainer skus={ctx.skus}>
          <Skus>
            <SkuField attribute="code" tagElement="p" />
          </Skus>
        </SkusContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper }
    )
    for await (const sku of ctx.skus) {
      await waitFor(() => screen.getByTestId(sku), { timeout: 10000 })
      expect(screen.getByTestId(sku).textContent).toBe(sku)
    }
  })

  it<SkusContext>("renders correct number of SKU items", async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <SkusContainer skus={ctx.skus}>
          <Skus>
            <SkuField attribute="code" tagElement="p" />
          </Skus>
        </SkusContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper }
    )
    await waitFor(() => expect(screen.getAllByTestId(/^BABY/)).toHaveLength(ctx.skus.length), {
      timeout: 10000,
    })
  })

  it<SkusContext>("renders SKU name field", async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <SkusContainer skus={[ctx.sku]}>
          <Skus>
            <SkuField attribute="name" tagElement="span" data-testid="sku-name" />
          </Skus>
        </SkusContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper }
    )
    await waitFor(() => screen.getByTestId("sku-name"), { timeout: 10000 })
    expect(screen.getByTestId("sku-name").textContent).not.toBe("")
  })

  it<SkusContext>("renders SKU image via image_url field", async (ctx) => {
    const { container } = render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <SkusContainer skus={[ctx.sku]}>
          <Skus>
            <SkuField attribute="image_url" tagElement="img" />
          </Skus>
        </SkusContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper }
    )
    await waitFor(
      () => {
        const img = container.querySelector("img")
        expect(img).not.toBeNull()
        expect(img?.getAttribute("src")).toBeTruthy()
      },
      { timeout: 10000 }
    )
  })

  it<SkusContext>("renders nothing when skus prop is empty", (ctx) => {
    const { container } = render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <SkusContainer skus={[]}>
          <Skus>
            <SkuField attribute="code" tagElement="p" />
          </Skus>
        </SkusContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper }
    )
    expect(container.querySelectorAll("p")).toHaveLength(0)
  })

  it<SkusContext>("applies queryParams alongside code_in filter", async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <SkusContainer skus={ctx.skus} queryParams={{ pageSize: 1 }}>
          <Skus>
            <SkuField attribute="code" tagElement="p" />
          </Skus>
        </SkusContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper }
    )
    await waitFor(() => expect(screen.getAllByTestId(/^BABY/).length).toBeGreaterThanOrEqual(1), {
      timeout: 10000,
    })
  })
})

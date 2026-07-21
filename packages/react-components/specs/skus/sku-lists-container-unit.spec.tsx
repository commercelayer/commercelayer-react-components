import { render, waitFor } from "@testing-library/react"
import { createElement, type ReactNode, useContext } from "react"
import { SWRConfig } from "swr"
import { vi } from "vitest"
import { SkuList } from "#components/skus/SkuList"
import { SkuListsContainer } from "#components/skus/SkuListsContainer"
import CommerceLayerContext from "#context/CommerceLayerContext"
import SkuListsContext from "#context/SkuListsContext"

vi.mock("@commercelayer/react-hooks-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@commercelayer/react-hooks-components")>()
  return {
    ...actual,
    useSkuLists: vi.fn(() => ({
      retrieveSkuList: vi.fn().mockResolvedValue({
        skus: [{ code: "SKU001", id: "1", type: "skus" }],
      }),
    })),
  }
})

const swrWrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

function SkuListsInspector({ onCapture }: { onCapture: (v: Record<string, unknown>) => void }) {
  const { skuLists } = useContext(SkuListsContext)
  onCapture(skuLists)
  return null
}

describe("SkuListsContainer – unit (mocked useSkuLists)", () => {
  it("fetches sku lists and populates skuLists context when accessToken and ids are present", async () => {
    let captured: Record<string, unknown> = {}
    render(
      <CommerceLayerContext.Provider
        value={{ accessToken: "fake-token", endpoint: "https://test.commercelayer.io" }}
      >
        <SkuListsContainer>
          <SkuList id="list-001">
            <span />
          </SkuList>
          <SkuListsInspector
            onCapture={(v) => {
              captured = v
            }}
          />
        </SkuListsContainer>
      </CommerceLayerContext.Provider>,
      { wrapper: swrWrapper }
    )
    await waitFor(() => expect(Object.keys(captured)).toContain("list-001"), { timeout: 5000 })
    expect(Array.isArray(captured["list-001"])).toBe(true)
  })
})

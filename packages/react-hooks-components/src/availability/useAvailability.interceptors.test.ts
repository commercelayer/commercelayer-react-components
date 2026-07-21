/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { createElement } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { InterceptorManager } from "../index"
import { useAvailability } from "./useAvailability"

const swrWrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

const mockAvailability = { available: true, quantity: 10 }
const mockGetSkuAvailability = vi.fn().mockResolvedValue(mockAvailability)

vi.mock("@commercelayer/core-components", () => ({
  getSkuAvailability: (...args: unknown[]) => mockGetSkuAvailability(...args),
}))

describe("useAvailability — interceptors", () => {
  const accessToken = "test-token"
  const interceptors: InterceptorManager = {
    request: { onSuccess: vi.fn((req) => req) },
  }

  beforeEach(() => {
    mockGetSkuAvailability.mockClear()
  })

  it("passes interceptors to getSkuAvailability via fetchAvailability", async () => {
    const { result } = renderHook(() => useAvailability(accessToken, interceptors), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    act(() => {
      result.current.fetchAvailability({ skuCode: "MY-SKU" })
    })

    await waitFor(() => {
      expect(mockGetSkuAvailability).toHaveBeenCalledWith(expect.objectContaining({ interceptors }))
    })
  })

  it("works without interceptors", async () => {
    const { result } = renderHook(() => useAvailability(accessToken), {
      wrapper: ({ children }) => swrWrapper({ children }),
    })

    act(() => {
      result.current.fetchAvailability({ skuCode: "MY-SKU" })
    })

    await waitFor(() => {
      expect(mockGetSkuAvailability).toHaveBeenCalledWith(expect.objectContaining({ accessToken }))
    })
  })
})

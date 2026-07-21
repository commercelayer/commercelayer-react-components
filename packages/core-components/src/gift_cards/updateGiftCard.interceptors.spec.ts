import { beforeEach, describe, expect, test, vi } from "vitest"
import type { InterceptorManager } from "#sdk"
import { updateGiftCard } from "./updateGiftCard.js"

const {
  mockAddRequestInterceptor,
  mockAddResponseInterceptor,
  mockAddRawResponseReader,
  mockSdkInstance,
} = vi.hoisted(() => {
  const mockAddRequestInterceptor = vi.fn().mockReturnValue(1)
  const mockAddResponseInterceptor = vi.fn().mockReturnValue(1)
  const mockAddRawResponseReader = vi.fn()
  return {
    mockAddRequestInterceptor,
    mockAddResponseInterceptor,
    mockAddRawResponseReader,
    mockSdkInstance: {
      addRequestInterceptor: mockAddRequestInterceptor,
      addResponseInterceptor: mockAddResponseInterceptor,
      addRawResponseReader: mockAddRawResponseReader,
    },
  }
})

vi.mock("@commercelayer/sdk/bundle", () => ({
  CommerceLayer: vi.fn().mockReturnValue(mockSdkInstance),
}))
vi.mock("@commercelayer/js-auth", () => ({
  jwtDecode: vi.fn().mockReturnValue({ payload: { organization: { slug: "my-org" } } }),
}))
vi.mock("@commercelayer/sdk", () => ({
  gift_cards: {
    update: vi.fn().mockResolvedValue({ id: "gift-card-1", reference: "test-ref" }),
  },
}))

describe("updateGiftCard interceptors", () => {
  beforeEach(() => vi.clearAllMocks())

  test("should forward request interceptors to getSdk", async () => {
    const onSuccess = vi.fn()
    const interceptors: InterceptorManager = { request: { onSuccess } }
    await updateGiftCard({
      accessToken: "fake-token",
      resource: { id: "gift-card-1", reference: "test-ref" },
      interceptors,
    })
    expect(mockAddRequestInterceptor).toHaveBeenCalledWith(onSuccess, undefined)
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
  })

  test("should forward response interceptors to getSdk", async () => {
    const onSuccess = vi.fn()
    const interceptors: InterceptorManager = { response: { onSuccess } }
    await updateGiftCard({
      accessToken: "fake-token",
      resource: { id: "gift-card-1", reference: "test-ref" },
      interceptors,
    })
    expect(mockAddResponseInterceptor).toHaveBeenCalledWith(onSuccess, undefined)
    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
  })

  test("should not call interceptor methods when no interceptors provided", async () => {
    await updateGiftCard({
      accessToken: "fake-token",
      resource: { id: "gift-card-1", reference: "test-ref" },
    })
    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
    expect(mockAddRawResponseReader).not.toHaveBeenCalled()
  })
})

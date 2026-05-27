import { beforeEach, describe, expect, test, vi } from "vitest"
import type { InterceptorManager } from "#sdk"
import { deleteLineItem } from "./deleteLineItem.js"

const {
  mockDelete,
  mockAddRequestInterceptor,
  mockAddResponseInterceptor,
  mockAddRawResponseReader,
} = vi.hoisted(() => {
  const mockDelete = vi.fn()
  const mockAddRequestInterceptor = vi.fn().mockReturnValue(1)
  const mockAddResponseInterceptor = vi.fn().mockReturnValue(1)
  const mockAddRawResponseReader = vi.fn()
  return {
    mockDelete,
    mockAddRequestInterceptor,
    mockAddResponseInterceptor,
    mockAddRawResponseReader,
  }
})

vi.mock("@commercelayer/sdk/bundle", () => ({
  CommerceLayer: vi.fn().mockReturnValue({
    addRequestInterceptor: mockAddRequestInterceptor,
    addResponseInterceptor: mockAddResponseInterceptor,
    addRawResponseReader: mockAddRawResponseReader,
    line_items: { delete: mockDelete },
  }),
}))

vi.mock("@commercelayer/js-auth", () => ({
  jwtDecode: vi.fn().mockReturnValue({ payload: { organization: { slug: "my-org" } } }),
}))

describe("deleteLineItem", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAddRequestInterceptor.mockReturnValue(1)
    mockAddResponseInterceptor.mockReturnValue(1)
    mockDelete.mockResolvedValue(undefined)
  })

  test("resolves without a return value", async () => {
    const result = await deleteLineItem({ accessToken: "fake-token", lineItemId: "li_1" })

    expect(result).toBeUndefined()
  })

  test("calls line_items.delete with the correct id", async () => {
    await deleteLineItem({ accessToken: "fake-token", lineItemId: "li_1" })

    expect(mockDelete).toHaveBeenCalledWith("li_1")
  })

  test("forwards request interceptors to getSdk", async () => {
    const onSuccess = vi.fn()
    const interceptors: InterceptorManager = { request: { onSuccess } }

    await deleteLineItem({ accessToken: "fake-token", lineItemId: "li_1", interceptors })

    expect(mockAddRequestInterceptor).toHaveBeenCalledWith(onSuccess, undefined)
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
  })

  test("forwards response interceptors to getSdk", async () => {
    const onSuccess = vi.fn()
    const interceptors: InterceptorManager = { response: { onSuccess } }

    await deleteLineItem({ accessToken: "fake-token", lineItemId: "li_1", interceptors })

    expect(mockAddResponseInterceptor).toHaveBeenCalledWith(onSuccess, undefined)
    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
  })

  test("does not register any interceptors when none are provided", async () => {
    await deleteLineItem({ accessToken: "fake-token", lineItemId: "li_1" })

    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
    expect(mockAddRawResponseReader).not.toHaveBeenCalled()
  })
})

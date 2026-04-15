import { describe, expect, vi, beforeEach } from "vitest"
import { test } from "vitest"
import { getSdk } from "./index.js"
import type { InterceptorManager } from "./index.js"

const { mockAddRequestInterceptor, mockAddResponseInterceptor, mockAddRawResponseReader, mockSdkInstance } = vi.hoisted(() => {
  const mockAddRequestInterceptor = vi.fn().mockReturnValue(1)
  const mockAddResponseInterceptor = vi.fn().mockReturnValue(1)
  const mockAddRawResponseReader = vi.fn()
  const mockSdkInstance = {
    addRequestInterceptor: mockAddRequestInterceptor,
    addResponseInterceptor: mockAddResponseInterceptor,
    addRawResponseReader: mockAddRawResponseReader,
  }
  return { mockAddRequestInterceptor, mockAddResponseInterceptor, mockAddRawResponseReader, mockSdkInstance }
})

vi.mock("@commercelayer/sdk/bundle", () => ({
  CommerceLayer: vi.fn().mockReturnValue(mockSdkInstance),
}))

vi.mock("@commercelayer/js-auth", () => ({
  jwtDecode: vi.fn().mockReturnValue({
    payload: {
      organization: { slug: "my-org" },
    },
  }),
}))

describe("getSdk", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAddRequestInterceptor.mockReturnValue(1)
    mockAddResponseInterceptor.mockReturnValue(1)
  })

  test("should return an SDK instance initialized with the org slug from JWT", async () => {
    const { CommerceLayer } = await import("@commercelayer/sdk/bundle")
    const result = getSdk({ accessToken: "fake-token" })
    expect(CommerceLayer).toHaveBeenCalledWith({
      accessToken: "fake-token",
      organization: "my-org",
    })
    expect(result).toBe(mockSdkInstance)
  })

  test("should not call any interceptor methods when no interceptors provided", () => {
    getSdk({ accessToken: "fake-token" })
    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
    expect(mockAddRawResponseReader).not.toHaveBeenCalled()
  })

  test("should register request interceptor when request interceptors provided", () => {
    const onSuccess = vi.fn()
    const onFailure = vi.fn()
    const interceptors: InterceptorManager = {
      request: { onSuccess, onFailure },
    }
    getSdk({ accessToken: "fake-token", interceptors })
    expect(mockAddRequestInterceptor).toHaveBeenCalledOnce()
    expect(mockAddRequestInterceptor).toHaveBeenCalledWith(onSuccess, onFailure)
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
    expect(mockAddRawResponseReader).not.toHaveBeenCalled()
  })

  test("should register response interceptor when response interceptors provided", () => {
    const onSuccess = vi.fn()
    const onFailure = vi.fn()
    const interceptors: InterceptorManager = {
      response: { onSuccess, onFailure },
    }
    getSdk({ accessToken: "fake-token", interceptors })
    expect(mockAddResponseInterceptor).toHaveBeenCalledOnce()
    expect(mockAddResponseInterceptor).toHaveBeenCalledWith(onSuccess, onFailure)
    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
    expect(mockAddRawResponseReader).not.toHaveBeenCalled()
  })

  test("should enable rawReader when rawReader interceptor provided", () => {
    const interceptors: InterceptorManager = {
      rawReader: { onSuccess: vi.fn() },
    }
    getSdk({ accessToken: "fake-token", interceptors })
    expect(mockAddRawResponseReader).toHaveBeenCalledOnce()
    expect(mockAddRequestInterceptor).not.toHaveBeenCalled()
    expect(mockAddResponseInterceptor).not.toHaveBeenCalled()
  })

  test("should register all interceptors when all are provided", () => {
    const interceptors: InterceptorManager = {
      request: { onSuccess: vi.fn() },
      response: { onSuccess: vi.fn() },
      rawReader: { onSuccess: vi.fn() },
    }
    getSdk({ accessToken: "fake-token", interceptors })
    expect(mockAddRequestInterceptor).toHaveBeenCalledOnce()
    expect(mockAddResponseInterceptor).toHaveBeenCalledOnce()
    expect(mockAddRawResponseReader).toHaveBeenCalledOnce()
  })

  test("should accept partial interceptor handlers (only onSuccess)", () => {
    const onSuccess = vi.fn()
    const interceptors: InterceptorManager = {
      request: { onSuccess },
    }
    getSdk({ accessToken: "fake-token", interceptors })
    expect(mockAddRequestInterceptor).toHaveBeenCalledWith(
      onSuccess,
      undefined,
    )
  })

  test("should accept partial interceptor handlers (only onFailure)", () => {
    const onFailure = vi.fn()
    const interceptors: InterceptorManager = {
      response: { onFailure },
    }
    getSdk({ accessToken: "fake-token", interceptors })
    expect(mockAddResponseInterceptor).toHaveBeenCalledWith(
      undefined,
      onFailure,
    )
  })
})

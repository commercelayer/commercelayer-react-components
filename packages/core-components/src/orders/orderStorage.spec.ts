import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { deleteLocalOrder, getLocalOrder, setLocalOrder } from "./orderStorage"

const MOCK_KEY = "cl_order_test"
const MOCK_ID = "xYzAbCdEfG"

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

describe("orderStorage", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", localStorageMock)
  })

  afterEach(() => {
    localStorageMock.clear()
    vi.unstubAllGlobals()
  })

  describe("setLocalOrder", () => {
    it("stores the order id under the given key", () => {
      setLocalOrder(MOCK_KEY, MOCK_ID)
      expect(localStorageMock.getItem(MOCK_KEY)).toBe(MOCK_ID)
    })
  })

  describe("getLocalOrder", () => {
    it("returns the stored order id", () => {
      localStorageMock.setItem(MOCK_KEY, MOCK_ID)
      expect(getLocalOrder(MOCK_KEY)).toBe(MOCK_ID)
    })

    it("returns null when key does not exist", () => {
      expect(getLocalOrder("non_existent_key")).toBeNull()
    })
  })

  describe("deleteLocalOrder", () => {
    it("removes the order id from storage", () => {
      localStorageMock.setItem(MOCK_KEY, MOCK_ID)
      deleteLocalOrder(MOCK_KEY)
      expect(localStorageMock.getItem(MOCK_KEY)).toBeNull()
    })
  })
})

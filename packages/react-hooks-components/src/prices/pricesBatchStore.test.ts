/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { EMPTY, getSnapshot, registerSku, subscribe, unregisterSku } from "./pricesBatchStore"

// The store logic is covered by createBatchStore.spec.ts in core-components.
// These tests only check that this module wires a single shared store.
describe("pricesBatchStore", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns EMPTY snapshot when no entry exists", () => {
    expect(getSnapshot("tok-empty")).toBe(EMPTY)
  })

  it("batches registered codes and keeps a shared code until its last consumer unregisters", () => {
    const listener = vi.fn()
    const unsubscribe = subscribe("tok-wiring", listener)

    registerSku("tok-wiring", "SKU-A")
    registerSku("tok-wiring", "SKU-A")
    vi.advanceTimersByTime(50)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(getSnapshot("tok-wiring")).toEqual(["SKU-A"])

    unregisterSku("tok-wiring", "SKU-A")
    registerSku("tok-wiring", "SKU-B")
    vi.advanceTimersByTime(50)
    expect(getSnapshot("tok-wiring")).toEqual(["SKU-A", "SKU-B"])

    unsubscribe()
    expect(getSnapshot("tok-wiring")).toBe(EMPTY)
  })
})

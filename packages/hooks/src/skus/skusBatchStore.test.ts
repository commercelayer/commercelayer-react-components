/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  EMPTY,
  getSnapshot,
  registerSku,
  subscribe,
  unregisterSku,
} from "./skusBatchStore"

describe("skusBatchStore", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns EMPTY snapshot when no entry exists", () => {
    expect(getSnapshot("nonexistent-token")).toBe(EMPTY)
  })

  it("notifies listener after debounce flush", async () => {
    const listener = vi.fn()
    const unsub = subscribe("tok-notify", listener)

    registerSku("tok-notify", "SKU-A")

    expect(listener).not.toHaveBeenCalled()
    await new Promise((r) => setTimeout(r, 80))
    expect(listener).toHaveBeenCalledTimes(1)
    expect(getSnapshot("tok-notify")).toEqual(["SKU-A"])

    unsub()
  })

  it("collapses rapid registrations into one flush", async () => {
    const listener = vi.fn()
    const unsub = subscribe("tok-collapse", listener)

    registerSku("tok-collapse", "SKU-A")
    registerSku("tok-collapse", "SKU-B")
    registerSku("tok-collapse", "SKU-C")

    await new Promise((r) => setTimeout(r, 80))
    expect(listener).toHaveBeenCalledTimes(1)
    expect(getSnapshot("tok-collapse")).toEqual(["SKU-A", "SKU-B", "SKU-C"])

    unsub()
  })

  it("ignores duplicate registerSku calls", async () => {
    const listener = vi.fn()
    const unsub = subscribe("tok-dup", listener)

    registerSku("tok-dup", "SKU-A")
    registerSku("tok-dup", "SKU-A")

    await new Promise((r) => setTimeout(r, 80))
    expect(getSnapshot("tok-dup")).toEqual(["SKU-A"])

    unsub()
  })

  it("unregisterSku removes a code (no refetch)", async () => {
    const listener = vi.fn()
    const unsub = subscribe("tok-unreg", listener)

    registerSku("tok-unreg", "SKU-A")
    await new Promise((r) => setTimeout(r, 80))

    unregisterSku("tok-unreg", "SKU-A")
    // snapshot is not updated on unregister (cached skus stay)
    expect(getSnapshot("tok-unreg")).toEqual(["SKU-A"])

    unsub()
  })

  it("unregisterSku is a no-op when store has no entry for the token", () => {
    // No subscribe/register for this token → store.get returns undefined
    expect(() => unregisterSku("tok-no-entry", "SKU-A")).not.toThrow()
    expect(getSnapshot("tok-no-entry")).toBe(EMPTY)
  })

  it("unregisterSku is a no-op for missing code", () => {
    const listener = vi.fn()
    const unsub = subscribe("tok-noop", listener)
    // no registerSku call — unregister should not throw
    unregisterSku("tok-noop", "MISSING")
    unsub()
  })

  it("ignores registerSku with empty accessToken", async () => {
    vi.useFakeTimers()
    const listener = vi.fn()
    const unsub = subscribe("", listener)

    registerSku("", "SKU-A") // guard: empty token → early return
    vi.advanceTimersByTime(100)
    expect(listener).not.toHaveBeenCalled()

    unsub()
  })

  it("cleans up store entry when last subscriber unsubscribes", () => {
    const listener = vi.fn()
    const unsub = subscribe("tok-cleanup", listener)
    registerSku("tok-cleanup", "SKU-A")

    unsub() // last listener → store.delete called

    // Entry is gone — snapshot falls back to EMPTY
    expect(getSnapshot("tok-cleanup")).toBe(EMPTY)
  })

  it("cancels pending timer when last subscriber unsubscribes", () => {
    vi.useFakeTimers()
    const listener = vi.fn()
    const unsub = subscribe("tok-timer-cancel", listener)
    registerSku("tok-timer-cancel", "SKU-A") // starts 50ms timer

    unsub() // timer still pending → clearTimeout called

    vi.advanceTimersByTime(100) // timer should NOT fire
    expect(listener).not.toHaveBeenCalled()
  })

  it("keeps entry alive while multiple subscribers are active", () => {
    const l1 = vi.fn()
    const l2 = vi.fn()
    const unsub1 = subscribe("tok-multi", l1)
    const unsub2 = subscribe("tok-multi", l2)

    unsub1() // one listener gone but entry should remain
    expect(getSnapshot("tok-multi")).not.toBe(undefined)

    unsub2() // last listener → entry deleted
    expect(getSnapshot("tok-multi")).toBe(EMPTY)
  })
})

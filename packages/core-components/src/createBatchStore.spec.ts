import type { ListResponse, Resource } from "@commercelayer/sdk"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { BATCH_PAGE_SIZE, createBatchStore, EMPTY, fetchInChunks } from "./createBatchStore.js"

const TOKEN = "tok"

function setup() {
  const store = createBatchStore()
  const listener = vi.fn()
  const unsubscribe = store.subscribe(TOKEN, listener)
  return { store, listener, unsubscribe }
}

function flush() {
  vi.advanceTimersByTime(50)
}

describe("createBatchStore", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test("returns EMPTY snapshot when no entry exists", () => {
    const store = createBatchStore()
    expect(store.getSnapshot(TOKEN)).toBe(EMPTY)
  })

  test("notifies listeners once the debounce elapses", () => {
    const { store, listener } = setup()
    store.registerCode(TOKEN, "A")

    vi.advanceTimersByTime(49)
    expect(listener).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(store.getSnapshot(TOKEN)).toEqual(["A"])
  })

  test("collapses rapid registrations into one flush", () => {
    const { store, listener } = setup()
    store.registerCode(TOKEN, "A")
    store.registerCode(TOKEN, "B")
    store.registerCode(TOKEN, "C")
    flush()

    expect(listener).toHaveBeenCalledTimes(1)
    expect(store.getSnapshot(TOKEN)).toEqual(["A", "B", "C"])
  })

  test("a code registered twice appears once and schedules no second flush", () => {
    const { store, listener } = setup()
    store.registerCode(TOKEN, "A")
    flush()
    store.registerCode(TOKEN, "A")
    flush()

    expect(listener).toHaveBeenCalledTimes(1)
    expect(store.getSnapshot(TOKEN)).toEqual(["A"])
  })

  test("ignores registrations with an empty access token", () => {
    const store = createBatchStore()
    const listener = vi.fn()
    store.subscribe("", listener)
    store.registerCode("", "A")
    flush()

    expect(listener).not.toHaveBeenCalled()
  })

  test("unregister does not refetch: the snapshot keeps the code until the next flush", () => {
    const { store, listener } = setup()
    store.registerCode(TOKEN, "A")
    flush()
    store.unregisterCode(TOKEN, "A")
    flush()

    expect(listener).toHaveBeenCalledTimes(1)
    expect(store.getSnapshot(TOKEN)).toEqual(["A"])
  })

  test("an unregistered code is left out of the next batch", () => {
    const { store } = setup()
    store.registerCode(TOKEN, "A")
    flush()
    store.unregisterCode(TOKEN, "A")
    store.registerCode(TOKEN, "B")
    flush()

    expect(store.getSnapshot(TOKEN)).toEqual(["B"])
  })

  test("a shared code stays in the batch until its last consumer unregisters", () => {
    const { store } = setup()
    store.registerCode(TOKEN, "A")
    store.registerCode(TOKEN, "A")
    flush()

    store.unregisterCode(TOKEN, "A")
    store.registerCode(TOKEN, "B")
    flush()
    expect(store.getSnapshot(TOKEN)).toEqual(["A", "B"])

    store.unregisterCode(TOKEN, "A")
    store.registerCode(TOKEN, "C")
    flush()
    expect(store.getSnapshot(TOKEN)).toEqual(["B", "C"])
  })

  test("unregistering an unknown code or token is a no-op", () => {
    const { store } = setup()
    store.registerCode(TOKEN, "A")
    flush()

    store.unregisterCode(TOKEN, "Z")
    store.unregisterCode("other-token", "A")
    store.registerCode(TOKEN, "B")
    flush()

    expect(store.getSnapshot(TOKEN)).toEqual(["A", "B"])
  })

  test("drops the entry when the last subscriber unsubscribes", () => {
    const { store, unsubscribe } = setup()
    const second = store.subscribe(TOKEN, vi.fn())
    store.registerCode(TOKEN, "A")
    flush()

    unsubscribe()
    expect(store.getSnapshot(TOKEN)).toEqual(["A"])

    second()
    expect(store.getSnapshot(TOKEN)).toBe(EMPTY)
  })

  test("cancels a pending flush when the last subscriber unsubscribes", () => {
    const { store, listener, unsubscribe } = setup()
    store.registerCode(TOKEN, "A")
    unsubscribe()
    flush()

    expect(listener).not.toHaveBeenCalled()
  })

  test("keeps separate batches per access token", () => {
    const { store } = setup()
    store.subscribe("other-token", vi.fn())
    store.registerCode(TOKEN, "A")
    store.registerCode("other-token", "B")
    flush()

    expect(store.getSnapshot(TOKEN)).toEqual(["A"])
    expect(store.getSnapshot("other-token")).toEqual(["B"])
  })
})

describe("fetchInChunks", () => {
  type Item = Resource & { code: string }

  const codes = (n: number) => Array.from({ length: n }, (_, i) => `SKU-${i}`)
  const items = (chunk: string[]) => chunk.map((code) => ({ id: code, type: "skus", code }) as Item)

  test("requests one page of BATCH_PAGE_SIZE codes per chunk and merges the results", async () => {
    const fetchChunk = vi.fn(async (chunk: string[], _pageSize: number) => items(chunk))
    const result = await fetchInChunks(codes(60), fetchChunk)

    expect(fetchChunk).toHaveBeenCalledTimes(3)
    expect(fetchChunk.mock.calls.map(([chunk, pageSize]) => [chunk.length, pageSize])).toEqual([
      [25, BATCH_PAGE_SIZE],
      [25, BATCH_PAGE_SIZE],
      [10, BATCH_PAGE_SIZE],
    ])
    expect(result.map((item) => item.code)).toEqual(codes(60))
  })

  test("makes a single request when the batch fits in one page", async () => {
    const fetchChunk = vi.fn(async (chunk: string[]) => items(chunk))
    await fetchInChunks(codes(BATCH_PAGE_SIZE), fetchChunk)

    expect(fetchChunk).toHaveBeenCalledTimes(1)
  })

  test("warns when a chunk has more records than one page", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const truncated = Object.assign(items(codes(25)), {
      meta: { pageCount: 2, recordCount: 30 },
    }) as unknown as ListResponse<Item>
    await fetchInChunks(codes(10), async () => truncated)

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("returned 30 records"))
    warn.mockRestore()
  })
})

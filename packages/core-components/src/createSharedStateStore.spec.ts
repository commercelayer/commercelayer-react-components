import { describe, expect, test, vi } from "vitest"
import { createSharedStateStore } from "./createSharedStateStore.js"

interface TestState {
  billingAddress: Record<string, unknown>
  isSaving: boolean
  errors: string[]
}

const initialState: TestState = {
  billingAddress: {},
  isSaving: false,
  errors: [],
}

function makeStore() {
  return createSharedStateStore<TestState>(initialState)
}

describe("createSharedStateStore — buildKey", () => {
  test("combines access token and order id", () => {
    const store = makeStore()
    expect(store.buildKey({ accessToken: "tok", orderId: "ord_1" })).toBe("tok:ord_1")
  })

  test("appends the scope when given", () => {
    const store = makeStore()
    expect(store.buildKey({ accessToken: "tok", orderId: "ord_1", scope: "b" })).toBe(
      "tok:ord_1:b"
    )
  })

  test("falls back to a token-wide key when there is no order", () => {
    const store = makeStore()
    expect(store.buildKey({ accessToken: "tok", orderId: null })).toBe("tok:no-order")
    expect(store.buildKey({ accessToken: "tok" })).toBe("tok:no-order")
  })

  test("returns null when there is no access token", () => {
    const store = makeStore()
    expect(store.buildKey({ accessToken: "", orderId: "ord_1" })).toBeNull()
    expect(store.buildKey({})).toBeNull()
  })
})

describe("createSharedStateStore — snapshots", () => {
  test("an unknown key reads the initial state", () => {
    const store = makeStore()
    expect(store.getSnapshot("tok:ord_1")).toEqual(initialState)
  })

  test("the server snapshot is always the initial state", () => {
    const store = makeStore()
    store.setState("tok:ord_1", { isSaving: true })
    expect(store.getServerSnapshot()).toEqual(initialState)
  })

  test("snapshots are frozen", () => {
    const store = makeStore()
    store.setState("tok:ord_1", { isSaving: true })
    expect(Object.isFrozen(store.getSnapshot("tok:ord_1"))).toBe(true)
  })

  test("the reference is stable until the state changes", () => {
    const store = makeStore()
    const first = store.getSnapshot("tok:ord_1")
    expect(store.getSnapshot("tok:ord_1")).toBe(first)

    store.setState("tok:ord_1", { isSaving: true })
    const second = store.getSnapshot("tok:ord_1")
    expect(second).not.toBe(first)
    expect(store.getSnapshot("tok:ord_1")).toBe(second)
  })
})

describe("createSharedStateStore — setState", () => {
  test("shallow-merges the patch and notifies subscribers", () => {
    const store = makeStore()
    const listener = vi.fn()
    store.subscribe("tok:ord_1", listener)

    store.setState("tok:ord_1", { billingAddress: { first_name: "John" } })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(store.getSnapshot("tok:ord_1")).toEqual({
      billingAddress: { first_name: "John" },
      isSaving: false,
      errors: [],
    })
  })

  test("accepts a function patch that reads the previous state", () => {
    const store = makeStore()
    store.setState("tok:ord_1", { errors: ["first"] })
    store.setState("tok:ord_1", (previous) => ({ errors: [...previous.errors, "second"] }))

    expect(store.getSnapshot("tok:ord_1").errors).toEqual(["first", "second"])
  })

  test("does not notify when no field actually changes", () => {
    const store = makeStore()
    const listener = vi.fn()
    store.subscribe("tok:ord_1", listener)

    store.setState("tok:ord_1", { isSaving: false })

    expect(listener).not.toHaveBeenCalled()
  })

  test("keeps the snapshot reference when no field actually changes", () => {
    const store = makeStore()
    store.setState("tok:ord_1", { isSaving: true })
    const snapshot = store.getSnapshot("tok:ord_1")

    store.setState("tok:ord_1", { isSaving: true })

    expect(store.getSnapshot("tok:ord_1")).toBe(snapshot)
  })
})

describe("createSharedStateStore — sharing across subscribers", () => {
  test("two subscribers on the same key observe the same state", () => {
    const store = makeStore()
    const form = vi.fn()
    const button = vi.fn()
    store.subscribe("tok:ord_1", form)
    store.subscribe("tok:ord_1", button)

    store.setState("tok:ord_1", { billingAddress: { first_name: "John" } })

    expect(form).toHaveBeenCalledTimes(1)
    expect(button).toHaveBeenCalledTimes(1)
    expect(store.getSnapshot("tok:ord_1").billingAddress).toEqual({ first_name: "John" })
  })

  test("different keys hold independent state", () => {
    const store = makeStore()
    store.setState("tok:ord_1", { isSaving: true })

    expect(store.getSnapshot("tok:ord_2").isSaving).toBe(false)
    expect(store.getSnapshot("other:ord_1").isSaving).toBe(false)
  })

  test("a scoped key is independent from the unscoped one", () => {
    const store = makeStore()
    const key = store.buildKey({ accessToken: "tok", orderId: "ord_1" })
    const scoped = store.buildKey({ accessToken: "tok", orderId: "ord_1", scope: "second" })

    store.setState(key, { billingAddress: { first_name: "John" } })

    expect(store.getSnapshot(scoped).billingAddress).toEqual({})
  })
})

describe("createSharedStateStore — lifecycle", () => {
  test("an unsubscribed listener stops being notified", () => {
    const store = makeStore()
    const listener = vi.fn()
    const unsubscribe = store.subscribe("tok:ord_1", listener)

    unsubscribe()
    store.setState("tok:ord_1", { isSaving: true })

    expect(listener).not.toHaveBeenCalled()
  })

  test("state survives the last subscriber leaving, so a remounted step finds it again", () => {
    const store = makeStore()
    const unsubscribe = store.subscribe("tok:ord_1", vi.fn())
    store.setState("tok:ord_1", { billingAddress: { first_name: "John" } })

    unsubscribe()

    expect(store.getSnapshot("tok:ord_1").billingAddress).toEqual({ first_name: "John" })
  })

  test("reset restores the initial state and notifies", () => {
    const store = makeStore()
    const listener = vi.fn()
    store.subscribe("tok:ord_1", listener)
    store.setState("tok:ord_1", { isSaving: true })
    listener.mockClear()

    store.reset("tok:ord_1")

    expect(listener).toHaveBeenCalledTimes(1)
    expect(store.getSnapshot("tok:ord_1")).toEqual(initialState)
  })

  test("resetting a pristine or unknown key does not notify", () => {
    const store = makeStore()
    const listener = vi.fn()
    store.subscribe("tok:ord_1", listener)

    store.reset("tok:ord_1")
    store.reset("tok:ord_99")

    expect(listener).not.toHaveBeenCalled()
  })
})

describe("createSharedStateStore — null key", () => {
  test("reads the initial state", () => {
    const store = makeStore()
    expect(store.getSnapshot(null)).toEqual(initialState)
  })

  test("subscribe, setState and reset are inert", () => {
    const store = makeStore()
    const listener = vi.fn()

    const unsubscribe = store.subscribe(null, listener)
    store.setState(null, { isSaving: true })
    store.reset(null)
    unsubscribe()

    expect(listener).not.toHaveBeenCalled()
    expect(store.getSnapshot(null).isSaving).toBe(false)
  })
})

describe("createSharedStateStore — clear", () => {
  test("drops every key and notifies the subscribers that had state", () => {
    const store = makeStore()
    const first = vi.fn()
    const second = vi.fn()
    store.subscribe("tok:ord_1", first)
    store.subscribe("tok:ord_2", second)
    store.setState("tok:ord_1", { isSaving: true })
    first.mockClear()
    second.mockClear()

    store.clear()

    expect(first).toHaveBeenCalledTimes(1)
    expect(second).not.toHaveBeenCalled()
    expect(store.getSnapshot("tok:ord_1")).toEqual(initialState)
  })
})

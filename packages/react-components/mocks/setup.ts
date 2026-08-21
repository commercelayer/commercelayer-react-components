import { server } from "./server"

/**
 * Restore a working `localStorage` global under jsdom.
 *
 * Node >= 22 defines its own `globalThis.localStorage`, a stub whose getter warns
 * ("localStorage is not available because --localstorage-file was not provided")
 * and returns `undefined`. Vitest's jsdom environment only copies a window key onto
 * the global when the key is absent from the global *or* listed in its internal KEYS
 * array — and `localStorage` is in neither branch, so jsdom's Storage never lands and
 * Node's stub wins. `sessionStorage` is unaffected because Node does not define it.
 *
 * This is an in-memory Storage rather than Node's file-backed one: it stays isolated
 * per worker and is cleared between tests, so order ids written by one spec cannot
 * leak into the next.
 */
function createStorage(): Storage {
  let entries = new Map<string, string>()
  return {
    get length() {
      return entries.size
    },
    key: (index) => [...entries.keys()][index] ?? null,
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => {
      entries.set(key, String(value))
    },
    removeItem: (key) => {
      entries.delete(key)
    },
    clear: () => {
      entries = new Map()
    },
  }
}

Object.defineProperty(globalThis, "localStorage", {
  value: createStorage(),
  writable: true,
  configurable: true,
})

beforeAll(async () => {
  server.listen()
})
afterAll(() => {
  server.close()
})
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
})

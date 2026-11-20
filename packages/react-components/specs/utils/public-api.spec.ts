import { describe, expect, it } from "vitest"
import * as barrel from "../../src/index"

/**
 * v5 ships a single entry point: a component that is not re-exported from
 * `src/index.ts` is unreachable for consumers and is tree-shaken out of
 * `dist` entirely. Its own spec still passes, because specs import from the
 * source file. This guard fails as soon as a component module exports
 * something the root barrel does not.
 *
 * Runtime exports only: types vanish at runtime, and `components/utils` is
 * skipped below, so the types public props rely on are listed by hand in
 * `src/index.ts`.
 */

// Internal on purpose: gateways are picked by `PaymentGateway` from the
// payment source type, the `*Payment` providers are only rendered by their
// own gateway, and `utils` are building blocks of the public components.
const INTERNAL = [
  /^\.\.\/\.\.\/src\/components\/payment_gateways\//,
  /^\.\.\/\.\.\/src\/components\/payment_source\/[A-Za-z]+Payment\.tsx$/,
  /^\.\.\/\.\.\/src\/components\/utils\//,
]

const modules = import.meta.glob<Record<string, unknown>>("../../src/components/**/*.tsx", { eager: true })

const publicModules = Object.entries(modules).filter(([path]) => !INTERNAL.some((re) => re.test(path)))

describe("public API", () => {
  it("finds the component modules", () => {
    expect(publicModules.length).toBeGreaterThan(100)
  })

  it.each(publicModules)("%s is fully exported from the root barrel", (_path, mod) => {
    const missing = Object.keys(mod).filter((name) => name !== "default" && !(name in barrel))
    expect(missing).toEqual([])
  })
})

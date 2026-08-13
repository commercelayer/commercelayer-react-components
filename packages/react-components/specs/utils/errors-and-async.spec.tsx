import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import filterChildren from "#utils/filterChildren"
import getErrors, { setErrors } from "#utils/getErrors"
import promisify from "#utils/promisify"

describe("getErrors", () => {
  it("stamps the resource onto every API error", () => {
    const error = { errors: [{ code: "VALIDATION_ERROR", detail: "bad" }] }

    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const result = getErrors({ error: error as any, resource: "orders" })

    expect(result).toEqual([{ code: "VALIDATION_ERROR", detail: "bad", resource: "orders" }])
  })

  it("adds the field when one is supplied", () => {
    const error = { errors: [{ code: "VALIDATION_ERROR" }] }

    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const result = getErrors({ error: error as any, resource: "orders", field: "email" })

    expect(result[0]?.field).toBe("email")
  })

  it("ignores an empty field", () => {
    const error = { errors: [{ code: "VALIDATION_ERROR" }] }

    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const result = getErrors({ error: error as any, resource: "orders", field: "" })

    expect(result[0]).not.toHaveProperty("field")
  })

  it("merges extra attributes", () => {
    const error = { errors: [{ code: "VALIDATION_ERROR" }] }

    const result = getErrors({
      // biome-ignore lint/suspicious/noExplicitAny: test cast
      error: error as any,
      resource: "orders",
      attributes: { extra: true },
    })

    expect(result[0]).toMatchObject({ extra: true })
  })

  it("returns undefined when the payload carries no errors", () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    expect(getErrors({ error: {} as any, resource: "orders" })).toBeUndefined()
  })
})

describe("setErrors", () => {
  const err = (code: string, field?: string) =>
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    ({ code, field, resource: "orders" }) as any

  it("returns the new errors when there are none yet", () => {
    expect(setErrors({ currentErrors: [], newErrors: [err("A")] })).toEqual([err("A")])
  })

  it("keeps existing errors that the new batch does not supersede", () => {
    const result = setErrors({ currentErrors: [err("A"), err("B")], newErrors: [err("B")] })

    expect(result.map((e) => e.code)).toEqual(["A", "B", "A"])
  })

  it("filters by a custom key", () => {
    const result = setErrors({
      currentErrors: [err("A", "email"), err("A", "city")],
      newErrors: [err("A", "email")],
      filterBy: "field",
    })

    expect(result.map((e) => e.field)).toEqual(["email", "city", "city"])
  })

  it("filters by a predicate function", () => {
    const result = setErrors({
      currentErrors: [err("A", "email"), err("B", "city")],
      newErrors: [err("A", "email")],
      filterBy: (item) => item.field,
    })

    expect(result.map((e) => e.field)).toEqual(["email", "city", "city"])
  })

  it("dispatches the merged errors when a dispatch is given", () => {
    const dispatch = vi.fn()

    const result = setErrors({ currentErrors: [], newErrors: [err("A")], dispatch })

    expect(dispatch).toHaveBeenCalledWith({ type: "setErrors", payload: { errors: result } })
  })

  it("defaults both lists to empty", () => {
    expect(setErrors({})).toEqual([])
  })
})

describe("promisify", () => {
  it("resolves a node-style callback invoked with params", async () => {
    const cb = (params: unknown, done: (err: unknown, res: unknown) => void) => {
      done(null, { echoed: params })
    }

    await expect(promisify(cb, { a: 1 })).resolves.toEqual({ echoed: { a: 1 } })
  })

  it("rejects when the params form yields an error", async () => {
    const cb = (_params: unknown, done: (err: unknown) => void) => {
      done(new Error("boom"))
    }

    await expect(promisify(cb, { a: 1 })).rejects.toThrow("boom")
  })

  it("prefers a tokenize method when no params are given", async () => {
    const cb = { tokenize: (done: (err: unknown, payload: unknown) => void) => done(null, "tok") }

    await expect(promisify(cb)).resolves.toBe("tok")
  })

  it("rejects when tokenize fails", async () => {
    const cb = { tokenize: (done: (err: unknown) => void) => done(new Error("nope")) }

    await expect(promisify(cb)).rejects.toThrow("nope")
  })

  it("calls a bare callback when there are no params and no tokenize", async () => {
    const cb = (done: (err: unknown, res: unknown) => void) => done(null, "plain")

    await expect(promisify(cb)).resolves.toBe("plain")
  })

  it("rejects when a bare callback fails", async () => {
    const cb = (done: (err: unknown) => void) => done(new Error("bare"))

    await expect(promisify(cb)).rejects.toThrow("bare")
  })
})

describe("filterChildren", () => {
  function Allowed() {
    return <span>allowed</span>
  }
  Allowed.displayName = "Allowed"

  function Other() {
    return <span>other</span>
  }
  Other.displayName = "Other"

  it("keeps only children whose displayName is listed", () => {
    const result = filterChildren({
      children: [<Allowed key="a" />, <Other key="b" />],
      filterBy: ["Allowed"],
      componentName: "Parent",
    })

    expect(Array.isArray(result) ? result : []).toHaveLength(1)
  })

  it("returns a single child untouched", () => {
    const result = filterChildren({
      children: <Allowed />,
      filterBy: ["Allowed"],
      componentName: "Parent",
    })

    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(false)
  })

  it("rejects a host element among an array of children", () => {
    expect(() =>
      filterChildren({
        children: [<Allowed key="a" />, <span key="b" />],
        filterBy: ["Allowed"],
        componentName: "Parent",
      })
    ).toThrow("Only library components are allowed into <Parent/>")
  })

  it("rejects a lone host element child", () => {
    expect(() =>
      filterChildren({ children: <span />, filterBy: ["Allowed"], componentName: "Parent" })
    ).toThrow("Only library components are allowed into <Parent/>")
  })

  it("renders the filtered output", () => {
    const result = filterChildren({
      children: [<Allowed key="a" />, <Other key="b" />],
      filterBy: ["Allowed"],
      componentName: "Parent",
    })

    const { container } = render(<div>{result}</div>)

    expect(container.textContent).toBe("allowed")
  })
})

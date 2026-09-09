import { describe, expect, it } from "vitest"
import { mapGiftCardErrors } from "./mapGiftCardErrors"

/** A refused gift card, exactly as the API sent it on 2026-08-25. */
const REFUSED = {
  errors: [
    {
      title: "doesn't match any active gift card",
      detail: "gift_card_code - doesn't match any active gift card",
      code: "VALIDATION_ERROR",
      source: { pointer: "/data/attributes/gift_card_code" },
      status: "422",
      meta: { error: "invalid_gift_card" },
    },
    {
      title: "can't be blank",
      detail: "token - can't be blank",
      code: "VALIDATION_ERROR",
      source: { pointer: "/data/attributes/token" },
      status: "422",
      meta: { error: "blank" },
    },
  ],
}

describe("mapGiftCardErrors", () => {
  // `detail` prefixes the attribute name, which is for an API client and not
  // for a shopper.
  it("uses the title rather than the attribute-prefixed detail", () => {
    expect(mapGiftCardErrors(REFUSED)).toEqual([
      {
        code: "VALIDATION_ERROR",
        message: "doesn't match any active gift card",
        field: "gift_card_code",
        meta: { error: "invalid_gift_card" },
      },
    ])
  })

  // The token error is a consequence of the session never being built, not
  // something the shopper can act on.
  it("drops the errors that are not about the code", () => {
    expect(mapGiftCardErrors(REFUSED)).toHaveLength(1)
  })

  it("reads the errors through the response wrapper too", () => {
    expect(mapGiftCardErrors({ response: { data: REFUSED } })[0]?.message).toBe(
      "doesn't match any active gift card"
    )
  })

  // Better an unattributed message than silence.
  it("keeps everything when nothing points at the code", () => {
    const mapped = mapGiftCardErrors({
      errors: [{ title: "Something else", source: { pointer: "/data" } }],
    })
    expect(mapped).toEqual([
      { code: "VALIDATION_ERROR", message: "Something else", field: "gift_card_code" },
    ])
  })

  it.each([undefined, null, "boom", new Error("boom"), {}, { errors: "nope" }])(
    "returns nothing for %s, which carries no API errors",
    (error) => {
      expect(mapGiftCardErrors(error)).toEqual([])
    }
  )
})

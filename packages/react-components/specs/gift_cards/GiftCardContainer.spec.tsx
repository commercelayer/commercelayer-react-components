import { act, render, waitFor } from "@testing-library/react"
import { useContext } from "react"
import { GiftCardContainer } from "#components/gift_cards/GiftCardContainer"
import CommerceLayerContext from "#context/CommerceLayerContext"
import GiftCardContext, {
  type GCContext,
  giftCardInitialState,
} from "#context/GiftCardContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import type { BaseError } from "#typings/errors"

const core = vi.hoisted(() => ({
  createGiftCard: vi.fn(),
  getSdk: vi.fn(),
}))

vi.mock("@commercelayer/core", () => ({
  createGiftCard: core.createGiftCard,
  getSdk: core.getSdk,
}))

const MOCK_SDK = {
  gift_card_recipients: {
    create: vi.fn(),
    update: vi.fn(),
  },
  orders: {
    relationship: vi.fn((id: string) => ({ type: "orders", id })),
  },
  gift_cards: {
    relationship: vi.fn((id: string) => ({ type: "gift_cards", id })),
  },
  line_items: {
    create: vi.fn(),
  },
}

let latestContext: GCContext | undefined

function ContextProbe(): JSX.Element {
  latestContext = useContext(GiftCardContext) as GCContext
  return null
}

function renderContainer(
  orderContextOverrides: Record<string, unknown> = {},
  commerceLayerValue: Record<string, unknown> = { accessToken: "token" }
) {
  latestContext = undefined
  return render(
    <CommerceLayerContext.Provider value={commerceLayerValue as any}>
      <OrderContext.Provider
        value={{
          ...defaultOrderContext,
          setOrderErrors: vi.fn(),
          ...orderContextOverrides,
        } as any}
      >
        <GiftCardContainer>
          <ContextProbe />
        </GiftCardContainer>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

beforeEach(() => {
  latestContext = undefined
  vi.clearAllMocks()
  vi.unstubAllEnvs()
  core.getSdk.mockReturnValue(MOCK_SDK)
  MOCK_SDK.gift_card_recipients.create.mockReset()
  MOCK_SDK.gift_card_recipients.update.mockReset()
  MOCK_SDK.orders.relationship.mockImplementation((id: string) => ({ type: "orders", id }))
  MOCK_SDK.gift_cards.relationship.mockImplementation((id: string) => ({ type: "gift_cards", id }))
  MOCK_SDK.line_items.create.mockReset()
})

describe("GiftCardContainer", () => {
  it("does not warn in production", () => {
    vi.stubEnv("NODE_ENV", "production")
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    renderContainer()

    expect(warnSpy).not.toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it("warns once in non-production environments", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    renderContainer()
    renderContainer()

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("<GiftCardContainer> is deprecated"))
    warnSpy.mockRestore()
  })

  it("updates errors and loading through the exposed setters", async () => {
    renderContainer()
    const errors = [{ code: "VALIDATION_ERROR", message: "broken" }] as BaseError[]

    await act(async () => {
      latestContext?.addGiftCardError(errors)
      latestContext?.addGiftCardLoading(true)
    })

    await waitFor(() => {
      expect(latestContext?.errors).toEqual(errors)
      expect(latestContext?.loading).toBe(true)
    })
  })

  it("creates a recipient", async () => {
    renderContainer()
    MOCK_SDK.gift_card_recipients.create.mockResolvedValue({ id: "recipient-1" })

    await act(async () => {
      await latestContext?.addGiftCardRecipient({ email: "recipient@example.com" })
    })

    expect(core.getSdk).toHaveBeenCalledWith({ accessToken: "token", interceptors: undefined })
    expect(MOCK_SDK.gift_card_recipients.create).toHaveBeenCalledWith({
      email: "recipient@example.com",
    })
    await waitFor(() => expect(latestContext?.giftCardRecipient?.id).toBe("recipient-1"))
  })

  it("falls back to an empty access token when CommerceLayer has none", async () => {
    renderContainer({ createOrder: undefined, getOrder: undefined, order: undefined }, {})
    MOCK_SDK.gift_card_recipients.create.mockResolvedValue({ id: "recipient-empty-token" })
    core.createGiftCard.mockResolvedValue({ id: "gift-card-empty-token" })

    await act(async () => {
      await latestContext?.addGiftCardRecipient({ email: "recipient@example.com" })
      await latestContext?.addGiftCard({ currencyCode: "USD", email: "gift@example.com" })
    })

    expect(core.getSdk).toHaveBeenCalledWith({ accessToken: "", interceptors: undefined })
    expect(core.createGiftCard).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "" })
    )
  })

  it("logs recipient creation failures", async () => {
    renderContainer()
    const error = new Error("recipient failed")
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined)
    MOCK_SDK.gift_card_recipients.create.mockRejectedValue(error)

    await act(async () => {
      await latestContext?.addGiftCardRecipient({ email: "recipient@example.com" })
    })

    expect(consoleError).toHaveBeenCalledWith(error)
    consoleError.mockRestore()
  })

  it("creates a gift card, updates the recipient, and adds it to an existing order", async () => {
    const createOrder = vi.fn().mockResolvedValue("order-created")
    const getOrder = vi.fn().mockResolvedValue(undefined)
    renderContainer({
      order: { id: "order-existing" },
      createOrder,
      getOrder,
    })
    core.createGiftCard.mockResolvedValue({
      id: "gift-card-1",
      gift_card_recipient: { id: "recipient-1" },
    })
    MOCK_SDK.gift_card_recipients.update.mockResolvedValue(undefined)
    MOCK_SDK.line_items.create.mockResolvedValue(undefined)

    await act(async () => {
      await latestContext?.addGiftCard({
        currencyCode: "USD",
        email: "gift@example.com",
        firstName: "Jane",
        lastName: "Doe",
      })
    })

    expect(core.createGiftCard).toHaveBeenCalledWith({
      accessToken: "token",
      interceptors: undefined,
      resource: {
        currencyCode: "USD",
        recipient_email: "gift@example.com",
      },
      params: { include: ["gift_card_recipient"] },
    })
    expect(MOCK_SDK.gift_card_recipients.update).toHaveBeenCalledWith({
      id: "recipient-1",
      first_name: "Jane",
      last_name: "Doe",
    })
    expect(createOrder).not.toHaveBeenCalled()
    expect(MOCK_SDK.orders.relationship).toHaveBeenCalledWith("order-existing")
    expect(MOCK_SDK.gift_cards.relationship).toHaveBeenCalledWith("gift-card-1")
    expect(MOCK_SDK.line_items.create).toHaveBeenCalledWith({
      quantity: 1,
      order: { type: "orders", id: "order-existing" },
      item: { type: "gift_cards", id: "gift-card-1" },
    })
    expect(getOrder).toHaveBeenCalledWith("order-existing")
    await waitFor(() => {
      expect(latestContext?.giftCardRecipient?.id).toBe("recipient-1")
      expect(latestContext?.loading).toBe(false)
      expect(latestContext?.errors).toEqual([])
    })
  })

  it("creates an order when missing and skips recipient update when names are absent", async () => {
    const createOrder = vi.fn().mockResolvedValue("order-new")
    const getOrder = vi.fn().mockResolvedValue(undefined)
    renderContainer({ createOrder, getOrder })
    core.createGiftCard.mockResolvedValue({
      id: "gift-card-2",
      gift_card_recipient: { id: "recipient-2" },
    })
    MOCK_SDK.line_items.create.mockResolvedValue(undefined)

    await act(async () => {
      await latestContext?.addGiftCard({
        currencyCode: "EUR",
        email: "gift@example.com",
      })
    })

    expect(createOrder).toHaveBeenCalledWith({})
    expect(MOCK_SDK.gift_card_recipients.update).not.toHaveBeenCalled()
    expect(MOCK_SDK.orders.relationship).toHaveBeenCalledWith("order-new")
    expect(MOCK_SDK.line_items.create).toHaveBeenCalledTimes(1)
    expect(getOrder).toHaveBeenCalledWith("order-new")
  })

  it("skips line item creation when order exists but has no id", async () => {
    const createOrder = vi.fn()
    const getOrder = vi.fn()
    renderContainer({ createOrder, getOrder, order: { id: undefined } })
    core.createGiftCard.mockResolvedValue({
      id: "gift-card-noid",
      gift_card_recipient: { id: "recipient-noid" },
    })

    await act(async () => {
      await latestContext?.addGiftCard({ currencyCode: "USD", email: "gift@example.com" })
    })

    expect(createOrder).not.toHaveBeenCalled()
    expect(MOCK_SDK.line_items.create).not.toHaveBeenCalled()
    expect(getOrder).not.toHaveBeenCalled()
  })

  it("skips line item creation when the created order id is missing", async () => {
    const createOrder = vi.fn().mockResolvedValue(undefined)
    const getOrder = vi.fn().mockResolvedValue(undefined)
    renderContainer({ createOrder, getOrder })
    core.createGiftCard.mockResolvedValue({
      id: "gift-card-3",
      gift_card_recipient: { id: "recipient-3" },
    })

    await act(async () => {
      await latestContext?.addGiftCard({
        currencyCode: "GBP",
        email: "gift@example.com",
        firstName: "Only",
      })
    })

    expect(createOrder).toHaveBeenCalledWith({})
    expect(MOCK_SDK.gift_card_recipients.update).toHaveBeenCalledWith({
      id: "recipient-3",
      first_name: "Only",
    })
    expect(MOCK_SDK.line_items.create).not.toHaveBeenCalled()
    expect(getOrder).not.toHaveBeenCalled()
  })

  it("skips order side effects when order helpers are missing and leaves recipient undefined", async () => {
    renderContainer({
      createOrder: undefined,
      getOrder: undefined,
      order: undefined,
    })
    core.createGiftCard.mockResolvedValue({
      id: "gift-card-4",
      gift_card_recipients: undefined,
    })

    await act(async () => {
      await latestContext?.addGiftCard({
        currencyCode: "CAD",
        email: "gift@example.com",
      })
    })

    expect(MOCK_SDK.gift_card_recipients.update).not.toHaveBeenCalled()
    expect(MOCK_SDK.line_items.create).not.toHaveBeenCalled()
    await waitFor(() => expect(latestContext?.giftCardRecipient).toBeUndefined())
  })

  it("skips order side effects when only one order helper is available", async () => {
    const createOrder = vi.fn().mockResolvedValue("order-ignored")
    renderContainer({
      createOrder,
      getOrder: undefined,
      order: undefined,
    })
    core.createGiftCard.mockResolvedValue({ id: "gift-card-helpers" })

    await act(async () => {
      await latestContext?.addGiftCard({ currencyCode: "USD", email: "gift@example.com" })
    })

    expect(createOrder).not.toHaveBeenCalled()
    expect(MOCK_SDK.line_items.create).not.toHaveBeenCalled()
  })

  it("stores API errors when gift card creation fails", async () => {
    renderContainer()
    core.createGiftCard.mockRejectedValue({
      errors: [{ code: "VALIDATION_ERROR", message: "Nope" }],
    })

    await act(async () => {
      await latestContext?.addGiftCard({ currencyCode: "USD", email: "gift@example.com" })
    })

    await waitFor(() => {
      expect(latestContext?.errors).toEqual([
        expect.objectContaining({
          code: "VALIDATION_ERROR",
          message: "Nope",
          resource: "gift_cards",
        }),
      ])
      expect(latestContext?.loading).toBe(false)
    })
  })
})

import { act, fireEvent, render, waitFor } from "@testing-library/react"
import { type ReactNode, useContext } from "react"
import { GiftCard } from "#components/gift_cards/GiftCard"
import CommerceLayerContext from "#context/CommerceLayerContext"
import GiftCardContext, { type GCContext, giftCardInitialState } from "#context/GiftCardContext"
import OrderContext, { defaultOrderContext } from "#context/OrderContext"
import type { BaseError } from "#typings/errors"

const core = vi.hoisted(() => ({
  createGiftCard: vi.fn(),
  getSdk: vi.fn(),
}))

vi.mock("@commercelayer/core-components", () => ({
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
  return (
    <>
      <div data-testid="loading">{String(latestContext.loading)}</div>
      <div data-testid="recipient">{latestContext.giftCardRecipient?.id ?? "none"}</div>
      <div data-testid="errors">{JSON.stringify(latestContext.errors ?? [])}</div>
    </>
  )
}

function renderStandalone(
  orderContextOverrides: Record<string, unknown> = {},
  commerceLayerValue: Record<string, unknown> = { accessToken: "token" }
) {
  latestContext = undefined
  render(
    // biome-ignore lint/suspicious/noExplicitAny: test provider cast
    <CommerceLayerContext.Provider value={commerceLayerValue as any}>
      <OrderContext.Provider
        value={
          {
            ...defaultOrderContext,
            setOrderErrors: vi.fn(),
            ...orderContextOverrides,
            // biome-ignore lint/suspicious/noExplicitAny: test provider cast
          } as any
        }
      >
        <GiftCard>
          <input name="currencyCode" defaultValue="USD" />
          <input name="balanceCents" defaultValue="1000" />
          <ContextProbe />
        </GiftCard>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )

  return {
    getContext: () => latestContext as GCContext,
  }
}

function renderWithContainerContext({
  children,
  context,
  onSubmit,
}: {
  children?: ReactNode
  context: GCContext
  onSubmit?: (values: Record<string, unknown>) => void
}) {
  return render(
    <CommerceLayerContext.Provider value={{ accessToken: "token" }}>
      {/* biome-ignore lint/suspicious/noExplicitAny: test provider cast */}
      <OrderContext.Provider value={{ ...defaultOrderContext, setOrderErrors: vi.fn() } as any}>
        <GiftCardContext.Provider value={context}>
          {/* biome-ignore lint/suspicious/noExplicitAny: test provider cast */}
          <GiftCard onSubmit={onSubmit as any}>{children ?? <ContextProbe />}</GiftCard>
        </GiftCardContext.Provider>
      </OrderContext.Provider>
    </CommerceLayerContext.Provider>
  )
}

beforeEach(() => {
  latestContext = undefined
  vi.clearAllMocks()
  core.getSdk.mockReturnValue(MOCK_SDK)
  MOCK_SDK.gift_card_recipients.create.mockReset()
  MOCK_SDK.gift_card_recipients.update.mockReset()
  MOCK_SDK.orders.relationship.mockImplementation((id: string) => ({ type: "orders", id }))
  MOCK_SDK.gift_cards.relationship.mockImplementation((id: string) => ({ type: "gift_cards", id }))
  MOCK_SDK.line_items.create.mockReset()
})

describe("GiftCard", () => {
  it("submits valid data through the outer container context", () => {
    const addGiftCard = vi.fn()
    const addGiftCardError = vi.fn()
    const onSubmit = vi.fn()
    const containerContext = {
      ...giftCardInitialState,
      addGiftCard,
      addGiftCardError,
      addGiftCardLoading: vi.fn(),
      addGiftCardRecipient: vi.fn(),
    } as GCContext

    const { container } = renderWithContainerContext({
      context: containerContext,
      onSubmit,
      children: (
        <>
          <select name="currencyCode" defaultValue="USD">
            <option value="USD">USD</option>
          </select>
          <select name="balanceCents" defaultValue="1500">
            <option value="1500">1500</option>
          </select>
          <ContextProbe />
        </>
      ),
    })

    // biome-ignore lint/style/noNonNullAssertion: form always present in test
    fireEvent.submit(container.querySelector("form")!)

    expect(addGiftCard).toHaveBeenCalledWith(
      expect.objectContaining({
        currencyCode: "USD",
        balanceCents: "1500",
        metadata: {},
      })
    )
    expect(addGiftCardError).not.toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ currencyCode: "USD", balanceCents: "1500", metadata: {} })
    )
    expect(latestContext?.addGiftCard).toBe(addGiftCard)
    expect((container.querySelector("form") as HTMLFormElement).getAttribute("name")).toBe(
      "giftCardForm"
    )
  })

  it("sends validation errors to the outer container context", () => {
    const addGiftCard = vi.fn()
    const addGiftCardError = vi.fn()
    const containerContext = {
      ...giftCardInitialState,
      addGiftCard,
      addGiftCardError,
      addGiftCardLoading: vi.fn(),
      addGiftCardRecipient: vi.fn(),
    } as GCContext

    const { container } = renderWithContainerContext({
      context: containerContext,
      children: (
        <>
          <select name="currencyCode" defaultValue="">
            <option value="">Select currency</option>
            <option value="USD">USD</option>
          </select>
          <select name="balanceCents" defaultValue="">
            <option value="">Select amount</option>
            <option value="1500">1500</option>
          </select>
        </>
      ),
    })

    // biome-ignore lint/style/noNonNullAssertion: form always present in test
    fireEvent.submit(container.querySelector("form")!)

    expect(addGiftCard).not.toHaveBeenCalled()
    expect(addGiftCardError).toHaveBeenCalledWith([
      expect.objectContaining({ field: "currencyCode", resource: "gift_cards" }),
      expect.objectContaining({ field: "balanceCents", resource: "gift_cards" }),
    ])
  })

  it("updates standalone errors and loading through the exposed setters", async () => {
    const { getContext } = renderStandalone()
    const newErrors = [{ code: "VALIDATION_ERROR", message: "broken" }] as BaseError[]

    await act(async () => {
      getContext().addGiftCardError(newErrors)
      getContext().addGiftCardLoading(true)
    })

    await waitFor(() => {
      expect(getContext().errors).toEqual(newErrors)
      expect(getContext().loading).toBe(true)
    })
  })

  it("submits valid data without calling an optional onSubmit handler", () => {
    const addGiftCard = vi.fn()
    const containerContext = {
      ...giftCardInitialState,
      addGiftCard,
      addGiftCardError: vi.fn(),
      addGiftCardLoading: vi.fn(),
      addGiftCardRecipient: vi.fn(),
    } as GCContext

    const { container } = renderWithContainerContext({
      context: containerContext,
      children: (
        <>
          <select name="currencyCode" defaultValue="USD">
            <option value="USD">USD</option>
          </select>
          <select name="balanceCents" defaultValue="500">
            <option value="500">500</option>
          </select>
        </>
      ),
    })

    // biome-ignore lint/style/noNonNullAssertion: form always present in test
    expect(() => fireEvent.submit(container.querySelector("form")!)).not.toThrow()
    expect(addGiftCard).toHaveBeenCalledWith(
      expect.objectContaining({ currencyCode: "USD", balanceCents: "500", metadata: {} })
    )
  })

  it("falls back to an empty access token when CommerceLayer has none", async () => {
    const { getContext } = renderStandalone(
      { createOrder: undefined, getOrder: undefined, order: undefined },
      {}
    )
    MOCK_SDK.gift_card_recipients.create.mockResolvedValue({ id: "recipient-empty-token" })
    core.createGiftCard.mockResolvedValue({ id: "gift-card-empty-token" })

    await act(async () => {
      await getContext().addGiftCardRecipient({ email: "recipient@example.com" })
      await getContext().addGiftCard({ currencyCode: "USD", email: "gift@example.com" })
    })

    expect(core.getSdk).toHaveBeenCalledWith({ accessToken: "", interceptors: undefined })
    expect(core.createGiftCard).toHaveBeenCalledWith(expect.objectContaining({ accessToken: "" }))
  })

  it("creates a gift card recipient in standalone mode", async () => {
    const { getContext } = renderStandalone()
    MOCK_SDK.gift_card_recipients.create.mockResolvedValue({ id: "recipient-1" })

    await act(async () => {
      await getContext().addGiftCardRecipient({ email: "recipient@example.com" })
    })

    expect(core.getSdk).toHaveBeenCalledWith({ accessToken: "token", interceptors: undefined })
    expect(MOCK_SDK.gift_card_recipients.create).toHaveBeenCalledWith({
      email: "recipient@example.com",
    })
    await waitFor(() => expect(getContext().giftCardRecipient?.id).toBe("recipient-1"))
  })

  it("logs recipient creation failures in standalone mode", async () => {
    const { getContext } = renderStandalone()
    const error = new Error("recipient failed")
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined)
    MOCK_SDK.gift_card_recipients.create.mockRejectedValue(error)

    await act(async () => {
      await getContext().addGiftCardRecipient({ email: "recipient@example.com" })
    })

    expect(consoleError).toHaveBeenCalledWith(error)
    consoleError.mockRestore()
  })

  it("creates a gift card, updates the recipient, and adds it to an existing order", async () => {
    const createOrder = vi.fn().mockResolvedValue("order-created")
    const getOrder = vi.fn().mockResolvedValue(undefined)
    const { getContext } = renderStandalone({
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
      await getContext().addGiftCard({
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
      expect(getContext().giftCardRecipient?.id).toBe("recipient-1")
      expect(getContext().loading).toBe(false)
      expect(getContext().errors).toEqual([])
    })
  })

  it("creates an order when missing and skips recipient update when names are absent", async () => {
    const createOrder = vi.fn().mockResolvedValue("order-new")
    const getOrder = vi.fn().mockResolvedValue(undefined)
    const { getContext } = renderStandalone({ createOrder, getOrder })
    core.createGiftCard.mockResolvedValue({
      id: "gift-card-2",
      gift_card_recipient: { id: "recipient-2" },
    })
    MOCK_SDK.line_items.create.mockResolvedValue(undefined)

    await act(async () => {
      await getContext().addGiftCard({
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
    const { getContext } = renderStandalone({ createOrder, getOrder, order: { id: undefined } })
    core.createGiftCard.mockResolvedValue({
      id: "gift-card-noid",
      gift_card_recipient: { id: "recipient-noid" },
    })

    await act(async () => {
      await getContext().addGiftCard({ currencyCode: "USD", email: "gift@example.com" })
    })

    expect(createOrder).not.toHaveBeenCalled()
    expect(MOCK_SDK.line_items.create).not.toHaveBeenCalled()
    expect(getOrder).not.toHaveBeenCalled()
  })

  it("skips line item creation when the created order id is missing", async () => {
    const createOrder = vi.fn().mockResolvedValue(undefined)
    const getOrder = vi.fn().mockResolvedValue(undefined)
    const { getContext } = renderStandalone({ createOrder, getOrder })
    core.createGiftCard.mockResolvedValue({
      id: "gift-card-3",
      gift_card_recipient: { id: "recipient-3" },
    })

    await act(async () => {
      await getContext().addGiftCard({
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
    const { getContext } = renderStandalone({
      createOrder: undefined,
      getOrder: undefined,
      order: undefined,
    })
    core.createGiftCard.mockResolvedValue({
      id: "gift-card-4",
      gift_card_recipients: undefined,
    })

    await act(async () => {
      await getContext().addGiftCard({
        currencyCode: "CAD",
        email: "gift@example.com",
      })
    })

    expect(MOCK_SDK.gift_card_recipients.update).not.toHaveBeenCalled()
    expect(MOCK_SDK.line_items.create).not.toHaveBeenCalled()
    await waitFor(() => expect(getContext().giftCardRecipient).toBeUndefined())
  })

  it("skips order side effects when only one order helper is available", async () => {
    const createOrder = vi.fn().mockResolvedValue("order-ignored")
    const { getContext } = renderStandalone({
      createOrder,
      getOrder: undefined,
      order: undefined,
    })
    core.createGiftCard.mockResolvedValue({ id: "gift-card-helpers" })

    await act(async () => {
      await getContext().addGiftCard({ currencyCode: "USD", email: "gift@example.com" })
    })

    expect(createOrder).not.toHaveBeenCalled()
    expect(MOCK_SDK.line_items.create).not.toHaveBeenCalled()
  })

  it("stores API errors when gift card creation fails", async () => {
    const { getContext } = renderStandalone()
    core.createGiftCard.mockRejectedValue({
      errors: [{ code: "VALIDATION_ERROR", message: "Nope" }],
    })

    await act(async () => {
      await getContext().addGiftCard({ currencyCode: "USD", email: "gift@example.com" })
    })

    await waitFor(() => {
      expect(getContext().errors).toEqual([
        expect.objectContaining({
          code: "VALIDATION_ERROR",
          message: "Nope",
          resource: "gift_cards",
        }),
      ])
      expect(getContext().loading).toBe(false)
    })
  })
})

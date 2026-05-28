import { createGiftCard, getSdk } from "@commercelayer/core"
import type {
  GiftCardRecipient,
  GiftCardRecipientCreate,
  GiftCardRecipientUpdate,
} from "@commercelayer/sdk"
import { type JSX, type ReactNode, useContext, useState } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import GiftCardContext, {
  type GiftCardI,
  type GiftCardRecipientI,
  giftCardInitialState,
} from "#context/GiftCardContext"
import OrderContext from "#context/OrderContext"
import type { BaseError, TAPIError } from "#typings/errors"
import getErrors from "#utils/getErrors"

export interface GiftCardContainerProps {
  children: ReactNode
}

/** @deprecated kept for backward compatibility — remove once GiftCardContainer is no longer exported */
export interface Props extends GiftCardContainerProps {}

let _deprecationWarned = false

/**
 * @deprecated `GiftCardContainer` will be removed in a future major release.
 * Use `<GiftCard>` as a standalone component instead — it now manages its own context internally.
 *
 * **Before (deprecated):**
 * ```tsx
 * <GiftCardContainer>
 *   <GiftCard onSubmit={handleSubmit}>
 *     <GiftCardCurrencySelector />
 *     <GiftCardInput name="balanceCents" type="number" />
 *   </GiftCard>
 *   <Errors resource="gift_cards" />
 * </GiftCardContainer>
 * ```
 *
 * **After:**
 * ```tsx
 * <GiftCard onSubmit={handleSubmit}>
 *   <GiftCardCurrencySelector />
 *   <GiftCardInput name="balanceCents" type="number" />
 *   <Errors resource="gift_cards" />
 * </GiftCard>
 * ```
 */
export function GiftCardContainer(props: GiftCardContainerProps): JSX.Element {
  if (process.env.NODE_ENV !== "production" && !_deprecationWarned) {
    _deprecationWarned = true
    console.warn(
      "[commercelayer-react-components] <GiftCardContainer> is deprecated and will be removed in a future major version. Use <GiftCard> as a standalone component instead."
    )
  }
  const { children } = props
  const [errors, setErrors] = useState<BaseError[]>(giftCardInitialState.errors!)
  const [loading, setLoading] = useState<boolean>(giftCardInitialState.loading!)
  const [giftCardRecipient, setGiftCardRecipient] = useState<GiftCardRecipient | undefined>(
    undefined
  )
  const config = useContext(CommerceLayerContext)
  const { getOrder, createOrder, order } = useContext(OrderContext)
  const giftCardValue = {
    ...giftCardInitialState,
    errors,
    loading,
    giftCardRecipient,
    addGiftCardRecipient: async (values: GiftCardRecipientI & object): Promise<void> => {
      try {
        const sdk = getSdk({
          accessToken: config.accessToken ?? "",
          interceptors: config.interceptors,
        })
        const recipient = await sdk.gift_card_recipients.create(values as GiftCardRecipientCreate)
        setGiftCardRecipient(recipient)
      } catch (error) {
        console.error(error)
      }
    },
    addGiftCard: async (values: GiftCardI & object): Promise<void> => {
      try {
        const { firstName, lastName, email, ...val } = values as GiftCardI
        setLoading(true)
        setErrors([])
        const giftCard = await createGiftCard({
          accessToken: config.accessToken ?? "",
          interceptors: config.interceptors,
          // biome-ignore lint/suspicious/noExplicitAny: form values use camelCase field names at runtime
          resource: { recipient_email: email, ...val } as any,
          params: { include: ["gift_card_recipient"] },
        })
        const sdk = getSdk({
          accessToken: config.accessToken ?? "",
          interceptors: config.interceptors,
        })
        const recipientValues: GiftCardRecipientUpdate = {
          id: giftCard.gift_card_recipient?.id ?? "",
        }
        if (firstName) recipientValues.first_name = firstName
        if (lastName) recipientValues.last_name = lastName
        if (firstName != null || lastName != null) {
          await sdk.gift_card_recipients.update(recipientValues)
        }
        if (createOrder && getOrder) {
          let id: string | undefined
          if (order) {
            id = order.id
          } else {
            id = await createOrder({})
          }
          if (id) {
            const orderRel = sdk.orders.relationship(id)
            const item = sdk.gift_cards.relationship(giftCard.id)
            await sdk.line_items.create({ quantity: 1, order: orderRel, item })
            await getOrder(id)
          }
        }
        setGiftCardRecipient(giftCard.gift_card_recipient ?? undefined)
        setLoading(false)
      } catch (error: unknown) {
        const errs = getErrors({ error: error as TAPIError, resource: "gift_cards" })
        setErrors(errs)
        setLoading(false)
      }
    },
    addGiftCardError: (errs: BaseError[]): void => {
      setErrors(errs)
    },
    addGiftCardLoading: (l: boolean): void => {
      setLoading(l)
    },
  }
  return <GiftCardContext.Provider value={giftCardValue}>{children}</GiftCardContext.Provider>
}

export default GiftCardContainer

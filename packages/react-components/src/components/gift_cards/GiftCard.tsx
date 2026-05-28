import { createGiftCard, getSdk } from "@commercelayer/core"
import type {
  GiftCardRecipient,
  GiftCardRecipientCreate,
  GiftCardRecipientUpdate,
} from "@commercelayer/sdk"
import { type JSX, type RefObject, useContext, useMemo, useState } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import GiftCardContext, {
  type GCContext,
  type GiftCardI,
  type GiftCardRecipientI,
  giftCardInitialState,
} from "#context/GiftCardContext"
import OrderContext from "#context/OrderContext"
import type { BaseError, TAPIError } from "#typings/errors"
import type { DefaultChildrenType } from "#typings/globals"
import type { BaseState } from "#typings/index"
import getErrors from "#utils/getErrors"
import { isEmpty } from "#utils/isEmpty"
import validateFormFields from "#utils/validateFormFields"

type RequiredFields = "currencyCode" | "balanceCents"

export interface GiftCardProps extends Omit<JSX.IntrinsicElements["form"], "children" | "ref"> {
  children: DefaultChildrenType
  onSubmit?: (values: BaseState) => void
  ref?: RefObject<HTMLFormElement | null>
}

/**
 * Form component for creating a new gift card.
 *
 * Can be used standalone — it automatically manages its own state and context
 * without requiring a `GiftCardContainer` parent.
 * <span title='Requirements' type='warning'>
 * Must be a descendant of `<CommerceLayer>` and `<Order>`.
 * </span>
 *
 * @example Standalone (preferred):
 * ```tsx
 * <Order orderId="...">
 *   <GiftCard onSubmit={handleSubmit}>
 *     <GiftCardCurrencySelector />
 *     <GiftCardInput name="balanceCents" type="number" />
 *     <Errors resource="gift_cards" />
 *     <SubmitButton label="Create" />
 *   </GiftCard>
 * </Order>
 * ```
 */
export function GiftCard(props: GiftCardProps): JSX.Element {
  const { children, onSubmit, ref, ...formProps } = props

  // Detect standalone mode: GiftCardContainer provides addGiftCard; the default context does not.
  const containerContext = useContext(GiftCardContext)
  const isStandalone = containerContext.addGiftCard == null

  // Always initialize hooks (rules of hooks) — values only used when standalone.
  const [errors, setErrors] = useState<BaseError[]>(giftCardInitialState.errors!)
  const [loading, setLoading] = useState<boolean>(giftCardInitialState.loading!)
  const [giftCardRecipient, setGiftCardRecipient] = useState<GiftCardRecipient | undefined>(
    undefined
  )
  const config = useContext(CommerceLayerContext)
  const { getOrder, createOrder, order } = useContext(OrderContext)

  // Memoized standalone context value — only provided when not inside GiftCardContainer.
  const standaloneContextValue = useMemo<GCContext>(
    () => ({
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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [errors, loading, giftCardRecipient, config, getOrder, createOrder, order]
  )

  // In standalone mode use the internal context; in container mode re-expose the container's
  // context so all descendants (including <Errors> inside this form) stay in sync.
  const activeContext = isStandalone ? standaloneContextValue : containerContext

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>): void => {
    e.preventDefault()
    const form = e.currentTarget
    const { errors, values } = validateFormFields<RequiredFields[]>(
      form.elements,
      ["currencyCode", "balanceCents"],
      "gift_cards"
    )
    if (isEmpty(errors)) {
      activeContext.addGiftCard(values as GiftCardI)
      form.reset()
      if (onSubmit) {
        onSubmit(values)
      }
    } else {
      activeContext.addGiftCardError(errors as BaseError[])
    }
  }

  return (
    <GiftCardContext.Provider value={activeContext}>
      <form {...formProps} ref={ref} name="giftCardForm" onSubmit={handleSubmit}>
        {children}
      </form>
    </GiftCardContext.Provider>
  )
}

export default GiftCard

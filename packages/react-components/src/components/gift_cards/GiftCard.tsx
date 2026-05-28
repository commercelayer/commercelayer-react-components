import { useContext, useMemo, useReducer, type RefObject, type JSX } from "react"
import validateFormFields from "#utils/validateFormFields"
import { isEmpty } from "#utils/isEmpty"
import GiftCardContext, { type GCContext } from "#context/GiftCardContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import giftCardReducer, {
  giftCardInitialState,
  addGiftCard,
  addGiftCardError,
  addGiftCardLoading,
  addGiftCardRecipient,
  type GiftCardI,
  type GiftCardRecipientI,
} from "#reducers/GiftCardReducer"
import type { BaseError } from "#typings/errors"
import type { BaseState } from "#typings/index"
import type { DefaultChildrenType } from "#typings/globals"

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
  const [state, dispatch] = useReducer(giftCardReducer, giftCardInitialState)
  const config = useContext(CommerceLayerContext)
  const { getOrder, createOrder, order } = useContext(OrderContext)

  // Memoized standalone context value — only provided when not inside GiftCardContainer.
  const standaloneContextValue = useMemo<GCContext>(
    () => ({
      ...state,
      addGiftCardRecipient: async (values: GiftCardRecipientI & object) => {
        await addGiftCardRecipient(values as Parameters<typeof addGiftCardRecipient>[0], config, dispatch)
      },
      addGiftCard: async (values: GiftCardI & object) => {
        await addGiftCard({ ...values }, { config, dispatch, getOrder, createOrder, order })
      },
      addGiftCardError: (errors: BaseError[]): void => {
        addGiftCardError(errors, dispatch)
      },
      addGiftCardLoading: (loading: boolean): void => {
        addGiftCardLoading(loading, dispatch)
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, config, getOrder, createOrder, order]
  )

  // In standalone mode use the internal context; in container mode re-expose the container's
  // context so all descendants (including <Errors> inside this form) stay in sync.
  const activeContext = isStandalone ? standaloneContextValue : containerContext

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
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

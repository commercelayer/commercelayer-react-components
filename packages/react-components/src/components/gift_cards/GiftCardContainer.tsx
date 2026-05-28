import { useReducer, useContext, type ReactNode, type JSX } from "react"
import GiftCardContext from "#context/GiftCardContext"
import CommerceLayerContext from "#context/CommerceLayerContext"
import giftCardReducer, {
  giftCardInitialState,
  addGiftCardRecipient,
  addGiftCard,
  addGiftCardError,
  addGiftCardLoading,
} from "#reducers/GiftCardReducer"
import OrderContext from "#context/OrderContext"

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
  const [state, dispatch] = useReducer(giftCardReducer, giftCardInitialState)
  const config = useContext(CommerceLayerContext)
  const { getOrder, createOrder, order } = useContext(OrderContext)
  const giftCardValue = {
    ...state,
    addGiftCardRecipient: async (values: any) => {
      await addGiftCardRecipient(values, config, dispatch)
    },
    addGiftCard: async (values: any) => {
      await addGiftCard({ ...values }, { config, dispatch, getOrder, createOrder, order })
    },
    addGiftCardError: (errors: any): void => {
      addGiftCardError(errors, dispatch)
    },
    addGiftCardLoading: (loading: boolean): void => {
      addGiftCardLoading(loading, dispatch)
    },
  }
  return <GiftCardContext.Provider value={giftCardValue}>{children}</GiftCardContext.Provider>
}

export default GiftCardContainer

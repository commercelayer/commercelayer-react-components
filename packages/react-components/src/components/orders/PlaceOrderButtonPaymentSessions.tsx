import {
  authorizeGiftCardSessions,
  DEFAULT_GATEWAY_PLACEABLE_ATTEMPTS,
  DEFAULT_GATEWAY_PLACEABLE_INTERVAL_MS,
  DEFAULT_PLACEABLE_ATTEMPTS,
  DEFAULT_PLACEABLE_INTERVAL_MS,
  discardPaymentSession,
  placeOrderWithPaymentSessions,
} from "@commercelayer/core-components"
import type { Order } from "@commercelayer/sdk"
import {
  type JSX,
  type MouseEvent,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import Parent from "#components/utils/Parent"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import { useCollectionPermitted } from "#hooks/useCollectionPermitted"
import { usePaymentGatewayHandoff } from "#hooks/usePaymentGatewayHandoff"
import { usePaymentSessionsState } from "#hooks/usePaymentSessionsState"
import type { BaseError } from "#typings/errors"
import type { ChildrenFunction } from "#typings/index"

interface ChildrenProps extends Omit<Props, "children"> {
  handleClick: () => Promise<void>
  isLoading: boolean
}

interface Props extends Omit<JSX.IntrinsicElements["button"], "children" | "onClick"> {
  children?: ChildrenFunction<ChildrenProps>
  label?: string | ReactNode | (() => ReactNode)
  loadingLabel?: string | ReactNode
  onClick?: (response: { placed: boolean; order?: Order; errors?: BaseError[] }) => void
  /**
   * Placeability attempts before the errors are shown to the shopper.
   *
   * Defaults depend on who took the payment: a setting whose authorization is a
   * local background job needs a few hundred milliseconds, while anything
   * collected by a gateway settles on that gateway's webhook and needs an order
   * of magnitude longer. See `placeOrderWithPaymentSessions` for why retrying
   * before reporting is correct behaviour and not an optimisation.
   */
  placeableAttempts?: number
  /** Delay between placeability attempts, in milliseconds. */
  placeableIntervalMs?: number
}

/**
 * Place-order button for the `payment_sessions` model.
 *
 * Deliberately **not** a branch inside `PlaceOrderButtonPaymentSource`: that
 * component's enablement machine is built on `payment_method`,
 * `payment_source.payment_response`, `getCardDetails` and gateway `onsubmit`
 * refs, none of which exist here — and its upstream permission check hard-fails
 * every non-free order without a `payment_method`.
 *
 * **Placeability** cannot be read before clicking: `order.placeable` is
 * transient and never served on a GET, and it does not turn true until the
 * asynchronous authorization has succeeded — so using it as a gate would
 * disable the button precisely while payment is in progress. The truth arrives
 * after the click, from `_placeable`.
 *
 * **Whether anything is paying for the order**, on the other hand, is plain to
 * read from the order, and is gated here: without it a shopper who removes the
 * gift card that was covering the remainder — which deletes the session paying
 * the difference along with it — is left looking at a live button that can only
 * fail.
 *
 * **This button is sometimes also the pay button, and sometimes cannot be.**
 * It reads the Payment Gateway Handoff for which: a card form is inert until
 * something submits it, so the click collects the payment and the terms gate
 * sits in front of it; a method with its own button — PayPal — cannot be
 * collected that way at all, and then this button disables itself and says so.
 * It never asks *which* gateway, only who collects.
 */
export function PlaceOrderButtonPaymentSessions(props: Props): JSX.Element {
  const {
    children,
    label = "Place order",
    loadingLabel = "Placing...",
    disabled,
    onClick,
    placeableAttempts,
    placeableIntervalMs,
    ...p
  } = props
  const { order, setOrderErrors, getOrder } = useContext(OrderContext)
  const { isCovered, currentPaymentSession } = usePaymentSessionsState()
  const { accessToken, interceptors } = useContext(CommerceLayerContext)
  const [isLoading, setIsLoading] = useState(false)
  // The privacy and terms gate is a legal requirement of the checkout, not a
  // property of the payment model. It lives in one hook because a gateway with
  // its own button has to ask the same question — see `useCollectionPermitted`.
  const collectionPermitted = useCollectionPermitted()
  const { collection, collectedOutOfBand, errors: outOfBandErrors } = usePaymentGatewayHandoff()

  // Nothing left to pay is a complete answer: gift cards can cover an order
  // outright, and a free order has nothing to authorize. Otherwise the
  // difference needs its session.
  //
  // The zero test is strict on purpose. An order fetched without
  // `total_amount_with_taxes_cents` in its `fields` has `undefined` there, and
  // reading that as free would enable the button on an order nothing is paying
  // for — the same trap `isCovered` guards against with its `total > 0`.
  const isFree = order?.total_amount_with_taxes_cents === 0
  const isPaymentInPlace = isCovered || isFree || currentPaymentSession != null

  // Anything a gateway collected settles on that gateway's webhook, whoever
  // pressed the button — so the placeability wait is a different order of
  // magnitude either way. An explicit prop still wins: a consumer who has
  // measured their own gateway knows better than a default.
  const isGatewayPayment = collection != null
  const attempts =
    placeableAttempts ??
    (isGatewayPayment ? DEFAULT_GATEWAY_PLACEABLE_ATTEMPTS : DEFAULT_PLACEABLE_ATTEMPTS)
  const intervalMs =
    placeableIntervalMs ??
    (isGatewayPayment ? DEFAULT_GATEWAY_PLACEABLE_INTERVAL_MS : DEFAULT_PLACEABLE_INTERVAL_MS)

  const reportErrors = (errors: BaseError[], placedOrder?: Order): void => {
    setOrderErrors(errors)
    onClick?.({ placed: false, order: placedOrder, errors })
  }

  const refetch = async (): Promise<void> => {
    if (order == null) return
    try {
      await getOrder(order.id)
    } catch {
      // The error already on screen is the one worth showing; a failed refetch
      // must not replace it with a second one.
    }
  }

  /**
   * Delete the Payment Session a refusal burnt, best effort.
   *
   * Its failure is not worth reporting: if the delete is refused it is because
   * the failed authorization has already landed, and a session in that state is
   * excluded from both the current selection and the reuse predicate anyway.
   */
  const discardBurntSession = async (): Promise<void> => {
    if (accessToken == null || currentPaymentSession == null) return
    await discardPaymentSession({
      accessToken,
      interceptors,
      paymentSessionId: currentPaymentSession.id,
    })
  }

  /** Take the order the rest of the way, for a payment that is already in place. */
  const placeCollected = async (working: Order): Promise<void> => {
    if (accessToken == null) return
    // The whole order goes in: which sessions get authorized, and in which
    // order — gift cards first, then the one paying the difference — is domain
    // knowledge that belongs with the sequence, not here.
    const result = await placeOrderWithPaymentSessions({
      accessToken,
      interceptors,
      order: working,
      attempts,
      intervalMs,
    })

    if (result.placed) {
      onClick?.({ placed: true, order: result.order })
      return
    }

    reportErrors(
      result.errors.map((error) => ({
        code: "VALIDATION_ERROR" as const,
        resource: "orders" as const,
        message: error.message,
        field: error.field,
        ...(error.meta != null ? { meta: error.meta } : {}),
      })),
      result.order
    )
    // The order moved on without us — an authorization may have landed, or
    // auto_place may have fired — so pull the truth back in rather than leaving
    // the shopper looking at stale amounts.
    await refetch()
  }

  /**
   * The click path: authorize the gift cards, ask the gateway to collect, place.
   *
   * The gift cards go **first**, before the gateway is asked for anything. That
   * is the charge order the whole design depends on, and owning the submit is
   * the only reason it can be kept here:
   * the money leaves a card the moment the Drop-in is submitted, so leaving the
   * gift cards to `placeOrderWithPaymentSessions` — which runs afterwards —
   * would charge them second.
   *
   * The order is refetched in between because that sequence skips a session
   * that already carries a live authorization by reading the order it was
   * *handed*: passing the pre-authorization copy on would authorize the same
   * cards again and take the money twice.
   */
  const collectAndPlace = async (): Promise<void> => {
    if (order == null || accessToken == null) return

    // A method with its own button is not ours to collect through. The button
    // is disabled for it, so this is a guard rather than a branch — but it is
    // the guard that stops the order being placed with nothing collected, which
    // is what happened when a gateway component registered from a card it was
    // not rendering.
    if (collection?.by === "gateway") return

    let working = order

    if (collection?.by === "host") {
      const authorized = await authorizeGiftCardSessions({
        accessToken,
        interceptors,
        order: working,
      })

      if (authorized.errors.length > 0) {
        reportErrors(
          authorized.errors.map((error) => ({
            code: "VALIDATION_ERROR" as const,
            resource: "orders" as const,
            message: error.message,
            field: error.field,
            ...(error.meta != null ? { meta: error.meta } : {}),
          }))
        )
        await refetch()
        return
      }

      if (authorized.authorizedSessionIds.length > 0) {
        working = (await getOrder(order.id)) ?? working
      }

      const collected = await collection.submit()

      if (collected.status === "incomplete") {
        // The gateway is showing its own validation. Nothing to report, and
        // nothing to roll back: no money moved.
        return
      }

      if (collected.status === "failed") {
        // A verdict: the card took nothing.
        //
        // **The gift cards stay charged and applied**, and this is the version
        // that replaced an automatic refund. A refused card is the *ordinary*
        // failure of a checkout — the shopper tries another card — so giving
        // their credit back here destroys exactly what the next attempt needs,
        // and they cannot simply re-apply it: `canAddGiftCard` is false while
        // anything is authorized, and the codes would have to be typed again.
        // Giving the money back is theirs to ask for, one card at a time,
        // through `<PaymentSettingGiftCardRemoveButton>`.
        //
        // The Payment Session is burnt, and deleted: retrying on it is broken
        // server-side, and until the gateway's webhook lands the failed
        // authorization it goes on reading as reusable. Nothing is created in
        // its place — the shopper picks the payment method again.
        await discardBurntSession()
        reportErrors([gatewayError(collected.code)])
        await refetch()
        return
      }

      if (collected.status === "unknown") {
        // The payment may have gone through. Nothing is rolled back and the
        // session is **not** deleted — refunding could take back money for a
        // card that did charge, and the session is the record the gateway's
        // webhook settles against.
        reportErrors([gatewayError(collected.code)])
        await refetch()
        return
      }
    }

    await placeCollected(working)
  }

  const place = async (run: () => Promise<void>): Promise<void> => {
    if (order == null || accessToken == null || isLoading) return
    setIsLoading(true)
    setOrderErrors([])
    try {
      await run()
    } catch (error) {
      reportErrors([
        {
          code: "VALIDATION_ERROR",
          resource: "orders",
          message: error instanceof Error ? error.message : "The order could not be placed.",
        },
      ])
      // Refetch here too, and not only on the reported-error path above.
      // Authorizations may well have been created before this threw, and the
      // order in context still shows their sessions without one — which reads
      // as "nothing has been charged yet". A shopper who clicks again on that
      // stale order gets a second authorization over the first, and the money
      // taken twice. Pulling the order back makes the existing
      // `hasLiveAuthorization` guard see what actually happened.
      await refetch()
    } finally {
      setIsLoading(false)
    }
  }

  const handleClick = async (event?: MouseEvent<HTMLButtonElement>): Promise<void> => {
    event?.preventDefault()
    event?.stopPropagation()
    await place(collectAndPlace)
  }

  /**
   * An **Out-of-Band Collection** completed: the money is taken and nobody
   * clicked anything.
   *
   * Two things produce it and they are one event. A 3DS redirect came back, on
   * a page that reloaded — so acceptance of the terms did not survive, and
   * asking for it again would leave anyone who declines with a paid, unplaced
   * order. Or a method with its own button collected, where the click was never
   * ours to gate. Acceptance did happen in both: before the redirect, or inside
   * the method's own click. So the order is placed here on the library's own
   * initiative, and these are the only paths where that is true.
   *
   * The order is refetched first. On the redirect path the resume hook has
   * already done it, but a gateway's own button has not — and the gift cards it
   * authorized before collecting are invisible in the copy held here, which
   * would authorize them a second time.
   */
  const outOfBandRef = useRef(async (): Promise<void> => {})
  outOfBandRef.current = async (): Promise<void> => {
    if (order == null) return
    await place(async () => {
      const refreshed = (await getOrder(order.id)) ?? order
      await placeCollected(refreshed)
    })
  }
  const failedOutOfBandRef = useRef(async (): Promise<void> => {})
  failedOutOfBandRef.current = async (): Promise<void> => {
    await discardBurntSession()
    await refetch()
  }

  const outOfBandHandledRef = useRef(false)
  useEffect(() => {
    if (collectedOutOfBand === "done" && !outOfBandHandledRef.current) {
      outOfBandHandledRef.current = true
      void outOfBandRef.current()
      return
    }
    if (collectedOutOfBand === "failed" && !outOfBandHandledRef.current) {
      outOfBandHandledRef.current = true
      setOrderErrors(outOfBandErrors)
      // Burnt for the same reason as a refusal on our own click, so it goes the
      // same way. The gift cards are **not** given back here: on a redirect
      // they were charged on a previous page load and this one has no record of
      // which of them this attempt authorized, so returning them could take
      // money for a payment that is still settling.
      void failedOutOfBandRef.current()
    }
  }, [collectedOutOfBand, outOfBandErrors, setOrderErrors])

  const isCollecting = collectedOutOfBand === "in-progress" || collectedOutOfBand === "done"
  const busy = isLoading || isCollecting
  // A method with its own button cannot be collected through this one, so the
  // button says so rather than offering a second route to one action where its
  // own route leads nowhere: `submit` on such a gateway throws by design.
  const cannotCollect = collection?.by === "gateway"
  const disabledButton =
    disabled !== undefined
      ? disabled
      : isCollecting || cannotCollect || !collectionPermitted || !isPaymentInPlace
  const labelButton = busy ? loadingLabel : typeof label === "function" ? label() : label

  return children ? (
    <Parent {...{ ...props, disabled: disabledButton, handleClick, isLoading: busy }}>
      {children}
    </Parent>
  ) : (
    <button
      type="button"
      disabled={disabledButton || busy}
      onClick={(event) => {
        void handleClick(event)
      }}
      {...p}
    >
      {labelButton}
    </button>
  )
}

/**
 * A gateway's verdict, carrying its own code and no copy of ours.
 *
 * Adyen gives a `resultCode` and nothing else — `refusalReason` does not exist
 * in this API and the authorization's `response_data` is withheld from
 * storefront tokens — so the code goes in `meta.error` for an application to map
 * and in `message` because the field is required. Inventing prose here would put
 * payment wording, in one hard-coded language, in a package that cannot know the
 * checkout's locale.
 *
 * **`resource: "orders"` because that is the store it goes into.** This was
 * `payment_methods` at first, which reads more descriptively and made the error
 * invisible: `<Errors>` matches on `resource` (`getAllErrors`), so the outlet
 * every consumer mounts — `<Errors resource="orders">`, next to the place button
 * — filtered out the one message telling the shopper their card was refused. The
 * tag has to name the channel, not the subject.
 */
function gatewayError(code: string): BaseError {
  return {
    code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
    resource: "orders",
    message: code,
    meta: { error: code },
  }
}

export default PlaceOrderButtonPaymentSessions

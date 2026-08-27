/* eslint-disable @typescript-eslint/no-unsafe-argument */

import {
  type AdditionalDetailsData,
  AdyenCheckout,
  type CardConfiguration,
  type CheckoutAdvancedFlowResponse,
  type CoreConfiguration,
  Dropin,
  type DropinConfiguration,
  type ICore,
  type OnChangeData,
  type PayPalConfiguration,
  type SubmitData,
  type UIElement,
  type UIElementProps,
} from "@adyen/adyen-web/auto"
import type { AdyenPayment as AdyenPaymentType, Order } from "@commercelayer/sdk"
import { type FormEvent, type JSX, useContext, useEffect, useRef, useState } from "react"
import Parent from "#components/utils/Parent"
import CommerceLayerContext from "#context/CommerceLayerContext"
import CustomerContext from "#context/CustomerContext"
import OrderContext from "#context/OrderContext"
import PaymentMethodContext from "#context/PaymentMethodContext"
import PlaceOrderContext from "#context/PlaceOrderContext"
import { getAdyenShopperLocale } from "#utils/adyenShopperLocale"
import browserInfo, { cleanUrlBy } from "#utils/browserInfo"
import { getPublicIP } from "#utils/getPublicIp"
import { hasSubscriptions } from "#utils/hasSubscriptions"
import { setCustomerOrderParam } from "#utils/localStorage"
import type { PaymentSourceProps } from "./PaymentSource"

interface PaymentMethodsStyle {
  card?: CardConfiguration["styles"]
  paypal?: PayPalConfiguration["style"]
}

type PaymentMethodType = "scheme" | "giftcard" | "paypal" | "applepay" | "googlepay" | (string & {})

/**
 * Configuration options for the Adyen payment component.
 */
export interface AdyenPaymentConfig {
  /**
   * Payment methods to be used for subscriptions.
   * This is an array of payment method types that are supported for subscription payments.
   * For example, it can include "scheme" for card payments.
   * @default all available payment methods
   * @example ["scheme"]
   */
  subscriptionPaymentMethods?: PaymentMethodType[]
  /**
   * Optional CSS class name for the card container.
   */
  cardContainerClassName?: string

  /**
   * Optional CSS class name for the 3D Secure container.
   * @deprecated
   */
  threeDSecureContainerClassName?: string

  /**
   * Callback function to be called when an order is placed.
   * @param response - An object containing the placement status.
   */
  placeOrderCallback?: (response: { placed: boolean }) => void

  /**
   * Optional styles for the payment methods.
   */
  styles?: PaymentMethodsStyle

  /**
   * Configuration options for the payment methods.
   */
  paymentMethodsConfiguration?: DropinConfiguration["paymentMethodsConfiguration"]

  /**
   * Callback function to disable a stored payment method.
   * @param props - An object containing the recurring detail reference and shopper reference.
   * @returns A promise that resolves to a boolean indicating whether the stored payment method was disabled.
   */
  onDisableStoredPaymentMethod?: (props: {
    recurringDetailReference: string
    shopperReference: string | undefined
  }) => Promise<boolean>
  /**
   * Callback function to be called when the Adyen component is ready.
   * @returns void.
   */
  onReady?: () => void
  /**
   * onSelect callback function to be called when a payment method is selected.
   * @param component - The selected payment method component.
   * @returns void.
   */
  onSelect?: (component: UIElement<UIElementProps>) => void
  giftcardErrorComponent?: (message: string) => JSX.Element
  /**
   * The locale Adyen should use for anything **it** renders — in particular the hosted page a
   * redirect payment method sends the shopper to (Klarna, iDEAL, …). Sent as `shopper_locale`
   * in the payment request, and it also selects the Drop-in's own translations.
   *
   * Without it the locale is derived from `order.language_code`, and Adyen falls back to the
   * merchant account default or the country code when that language cannot be expanded — which
   * is how a Drop-in in English ends up handing over to a Klarna page in Italian.
   *
   * Read once when the Drop-in is built: changing it on a mounted Drop-in has no effect.
   *
   * @default derived from `order.language_code` (see `getAdyenShopperLocale`)
   * @example "en-US"
   */
  shopperLocale?: string
}

interface Props {
  clientKey?: string
  config?: AdyenPaymentConfig
  templateCustomerSaveToWallet?: PaymentSourceProps["templateCustomerSaveToWallet"]
  locale?: CoreConfiguration["locale"]
  environment?: CoreConfiguration["environment"]
}

// Adyen's own fallback when a locale does not resolve, spelled the way Adyen documents it:
// `language-REGION`. It used to read `en_US` here, which their client normalizes but their
// payment request does not.
const DEFAULT_LOCALE = "en-US"

const defaultConfig: AdyenPaymentConfig = {}

export function AdyenPayment({
  clientKey,
  config,
  templateCustomerSaveToWallet,
  environment = "test",
  locale = DEFAULT_LOCALE,
}: Props): JSX.Element | null {
  const {
    cardContainerClassName,
    styles,
    onDisableStoredPaymentMethod,
    giftcardErrorComponent,
    onReady,
    onSelect,
    subscriptionPaymentMethods,
    shopperLocale: shopperLocaleConfig,
  } = {
    ...defaultConfig,
    ...config,
  }
  const [loadAdyen, setLoadAdyen] = useState(false)
  const [checkout, setCheckout] = useState<UIElement<UIElementProps> | undefined>()
  const [giftcardError, setGiftcardError] = useState<string | null>(null)
  // Set when the API rejects a call because Adyen's `order_data` expired. A new payment
  // source alone cannot stand in for this: <PaymentGateway> also creates one, with a new
  // id, whenever the amount is mismatched, and rebuilding the Drop-in there is the reload
  // loop that was fixed earlier. Only an expiry invalidates the session itself.
  const [sessionExpiredAt, setSessionExpiredAt] = useState<number | null>(null)
  const {
    setPaymentSource,
    paymentSource,
    setPaymentMethodErrors,
    currentPaymentMethodType,
    setPaymentRef,
    currentCustomerPaymentSourceId,
  } = useContext(PaymentMethodContext)
  const { order, updateOrder, getOrderByFields } = useContext(OrderContext)
  const authConfig = useContext(CommerceLayerContext)
  const { placeOrderButtonRef, setPlaceOrder, status } = useContext(PlaceOrderContext)
  const { customers } = useContext(CustomerContext)
  // Two distinct locales that Adyen does not treat as interchangeable, deliberately derived
  // from one source. `dropInLocale` goes into the Core configuration and is client-side only:
  // it picks the Drop-in's translation bundle. `shopperLocale` travels with the payment
  // request and is what Adyen uses for the pages it renders itself, which is why the two must
  // not be allowed to disagree — a Drop-in in English handing over to a Klarna page in Italian
  // is the bug this fixes.
  //
  // The config value is read here rather than only in the request, so an integration that
  // sets it moves both. `getAdyenShopperLocale` then normalizes it (`en_US`, `PT_br`) and
  // expands a bare `language_code` into the `language-REGION` form the payment request needs,
  // returning undefined — and so omitting the field — rather than guessing.
  const dropInLocale = shopperLocaleConfig ?? order?.language_code ?? locale
  const shopperLocale = getAdyenShopperLocale(dropInLocale)
  const ref = useRef<null | HTMLFormElement>(null)
  const dropinRef = useRef<Dropin | null>(null)
  // The Core instance, kept alongside the Drop-in: refreshing the amount after a partial
  // authorization goes through Core, not the Drop-in. See the `onSubmit` handler below.
  const checkoutRef = useRef<ICore | null>(null)
  // Latches the partial-authorization refresh: refreshing the Drop-in once, when the order
  // becomes partially authorized, is intended — doing it again for the same authorization is
  // the glitch. Keyed by payment source id so a genuinely new source can refresh again.
  const refreshedForSourceRef = useRef<string | null>(null)
  // Which payment source the live Drop-in was initialized from. Adyen's session, including
  // the `order_data` that expires, is baked into the instance at creation, so a replacement
  // source leaves the instance on screen talking to a session the API already rejects.
  const initializedForSourceRef = useRef<string | null>(null)
  // The Drop-in's `onSubmit` is installed once, so it closes over the payment source from
  // the render that built it. <PaymentGateway> recreates the source whenever the order has
  // more than one payment method, and when that lands between the build and the shopper's
  // click, the submit authorizes against a source the order no longer points at: the gift
  // card is redeemed at Adyen, `gift_card_amount_cents` stays 0, and no amount ever shows.
  const paymentSourceRef = useRef(paymentSource)
  // An effect rather than a render-phase write, so StrictMode's discarded double render
  // cannot leave a stale value behind.
  useEffect(() => {
    paymentSourceRef.current = paymentSource
  }, [paymentSource])
  // A replacement payment source is created empty and filled a moment later, so the id
  // alone is not enough to rebuild on: doing that yields a Drop-in with no payment
  // methods. Counting them gives the effect below something to wait for.
  const availablePaymentMethodsCount: number =
    // @ts-expect-error no type
    paymentSource?.payment_methods?.paymentMethods?.length ?? 0

  // Tear the Adyen instance down on real unmount only, and clear the refs so a remounted
  // component can initialize a fresh one (the init guard below is `!dropinRef.current`, so a
  // leftover reference would leave the component wired to a destroyed Drop-in forever).
  //
  // Deliberately its own mount-scoped effect: the main effect below re-runs whenever the
  // place-order `status` changes, and destroying the Drop-in on those passes would throw the
  // shopper's selection away mid-checkout.
  useEffect(() => {
    return () => {
      // `remove()` rather than `unmount()`: Adyen documents it as the "destroy" cleanup — it
      // unmounts the element *and* drops it from `core.components`, so Core stops holding a
      // reference to a dead element (which `triggerAmountUpdate()` would otherwise iterate).
      dropinRef.current?.remove()
      dropinRef.current = null
      checkoutRef.current = null
    }
  }, [])
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<boolean> => {
    const savePaymentSourceToCustomerWallet: string =
      // @ts-expect-error no type
      e?.elements?.save_payment_source_to_customer_wallet?.checked
    if (savePaymentSourceToCustomerWallet)
      setCustomerOrderParam(
        "_save_payment_source_to_customer_wallet",
        savePaymentSourceToCustomerWallet
      )
    if (dropinRef.current) {
      // `Dropin.submit()` throws synchronously when it has no `activePaymentMethod` — e.g.
      // the shopper has not picked a method, or the Drop-in was re-rendered and lost the
      // selection while `ref.current.onsubmit` stayed patched from an earlier `onChange`.
      // Because this function is async the throw became a rejected promise that
      // <PlaceOrderButton> awaited without a catch, surfacing as an unhandledRejection that
      // takes the page (and the e2e run) down instead of telling the shopper anything.
      try {
        dropinRef.current.submit()
      } catch (error) {
        setPaymentMethodErrors([
          {
            code: "VALIDATION_ERROR",
            resource: "payment_methods",
            field: currentPaymentMethodType,
            message: error instanceof Error ? error.message : String(error),
          },
        ])
        return false
      }
    }
    return false
  }
  const handleChange = async (state: OnChangeData): Promise<void> => {
    if (state.isValid) {
      if (ref.current) {
        ref.current.onsubmit = async () => {
          return await handleSubmit(ref.current as unknown as FormEvent<HTMLFormElement>)
        }
        setPaymentMethodErrors([])
        setPaymentRef({ ref })
        if (placeOrderButtonRef?.current != null) {
          placeOrderButtonRef.current.disabled = false
        }
      }
    }
  }
  const handleOnAdditionalDetails = async (
    state: AdditionalDetailsData,
    component?: UIElement<UIElementProps>
  ): Promise<CheckoutAdvancedFlowResponse> => {
    const attributes = {
      payment_request_details: state.data,
      _details: 1,
    }
    try {
      const latestPaymentSource = paymentSourceRef.current ?? paymentSource
      const pSource =
        latestPaymentSource &&
        (await setPaymentSource({
          paymentSourceId: latestPaymentSource.id,
          paymentResource: "adyen_payments",
          attributes,
        }))
      // @ts-expect-error no type
      const resultCode = pSource?.payment_response?.resultCode
      if (["Authorised", "Pending", "Received"].includes(resultCode)) {
        if (placeOrderButtonRef?.current != null) {
          if (placeOrderButtonRef.current.disabled) {
            placeOrderButtonRef.current.disabled = false
          }
          placeOrderButtonRef.current.click()
        }
        return {
          resultCode,
        }
      }
      if (["Cancelled", "Refused"].includes(resultCode)) {
        // @ts-expect-error no type
        const message = pSource?.payment_response?.refusalReason
        setPaymentMethodErrors([
          {
            code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
            resource: "payment_methods",
            field: currentPaymentMethodType,
            message,
          },
        ])
        if (component) {
          component.mount("#adyen-dropin")
        }
      }
      return {
        resultCode,
      }
    } catch (error: unknown) {
      console.error("Adyen additional details error:", error)
      return {
        resultCode: "Error",
      }
    }
  }
  const onSubmit = async (
    state: SubmitData,
    component: UIElement<UIElementProps>
  ): Promise<
    CheckoutAdvancedFlowResponse & {
      paymentMethodType?: string
      message?: string
      paymentStatus?: Order["payment_status"]
      /** Still to be covered by another payment method, in Adyen's `{ currency, value }` shape. */
      remainingAmount?: { currency: string; value: number }
    }
  > => {
    const url = cleanUrlBy()
    const { type: currentPaymentMethodType } = state.data.paymentMethod
    const shopperIp = await getPublicIP()
    // Captured once for the whole submit rather than re-read per call: the expired-session
    // path below deliberately reuses the id the reducer has just destroyed.
    const currentPaymentSourceId = paymentSourceRef.current?.id ?? paymentSource?.id
    const control = await setPaymentSource({
      paymentSourceId: currentPaymentSourceId,
      paymentResource: "adyen_payments",
    })
    // @ts-expect-error no type
    const controlCode = control?.payment_response?.resultCode
    const paymentMethodType =
      // @ts-expect-error no type
      control?.payment_response?.paymentMethod?.type ??
      // @ts-expect-error no type
      control?.payment_request_data?.payment_method?.type
    const getOrderStatus = await getOrderByFields({
      orderId: order?.id ?? "",
      fields: ["status", "payment_status"],
      config: authConfig,
    })
    const paymentStatus = getOrderStatus?.payment_status
    if (
      controlCode === "Authorised" &&
      paymentMethodType !== "giftcard" &&
      paymentStatus !== "partially_authorized"
    ) {
      return {
        resultCode: controlCode,
      }
    }
    // biome-ignore lint/suspicious/noExplicitAny: No types
    const attributes: any = {
      payment_request_data: {
        ...state.data,
        payment_method: state.data.paymentMethod,
        return_url: url,
        origin: window.location.origin,
        redirect_from_issuer_method: "GET",
        shopper_ip: shopperIp,
        shopperInteraction: "Ecommerce",
        // The language Adyen renders its own hosted pages in (the Klarna screen a redirect
        // method hands over to). The Drop-in's `locale` is client-side only and never reaches
        // Adyen, so without this the hosted page falls back to the account default or the
        // country code. snake_case because these are Commerce Layer attributes, and it is the
        // API that maps them onto Adyen's own camelCase names.
        ...(shopperLocale != null ? { shopper_locale: shopperLocale } : {}),
        browser_info: {
          ...browserInfo(),
        },
      },
    }
    delete attributes.payment_request_data.paymentMethod
    try {
      await setPaymentSource({
        paymentSourceId: currentPaymentSourceId,
        paymentResource: "adyen_payments",
        attributes,
      })
      if (order?.id == null) {
        console.error("Order id is missing")
        return {
          resultCode: "Error",
        }
      }
      // First gift card authorization for partial or total amount
      if (currentPaymentMethodType === "giftcard") {
        // Request balance check if the gift card can cover the total amount
        const giftCardBalanceCheck = (await setPaymentSource({
          paymentSourceId: currentPaymentSourceId,
          paymentResource: "adyen_payments",
          attributes: {
            _balance: true,
          },
        })) as AdyenPaymentType | undefined
        const totalAmount = order?.total_amount_with_taxes_cents ?? 0
        // A missing response means the request itself failed, not that the card is empty.
        // The usual cause is Adyen's `order_data` having expired, which makes the reducer
        // tear the payment source down and the app build a new one. Folding that into the
        // zero-balance branch below told the shopper to find a different gift card over
        // what is really a stale session, and hid the retry they actually need.
        if (giftCardBalanceCheck == null) {
          setSessionExpiredAt(Date.now())
          const message =
            "The payment session expired before the gift card could be redeemed. Please try again."
          setPaymentMethodErrors([
            {
              code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
              resource: "payment_methods",
              field: currentPaymentMethodType,
              message,
            },
          ])
          return {
            resultCode: "Refused",
            message,
          }
        }
        const currentBalance = giftCardBalanceCheck.balance ?? 0
        if (currentBalance === 0) {
          const message = "The gift card has no balance. Please use a different one."
          setPaymentMethodErrors([
            {
              code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
              resource: "payment_methods",
              field: currentPaymentMethodType,
              message,
            },
          ])
          return {
            resultCode: "Refused",
            message,
          }
        }
        const attributes =
          currentBalance >= totalAmount
            ? {
                _authorize: true,
              }
            : {
                _authorization_amount_cents: currentBalance,
                _authorize: true,
              }
        const { order: orderUpdated } = await updateOrder({
          id: order.id,
          attributes,
        })
        const resultCode =
          // @ts-expect-error no type
          orderUpdated?.payment_source?.payment_response?.resultCode
        const refusalReasonCode =
          // @ts-expect-error no type
          orderUpdated?.payment_source?.payment_response?.refusalReasonCode
        const errorCode =
          // @ts-expect-error no type
          orderUpdated?.payment_source?.payment_response?.errorCode
        const action =
          // @ts-expect-error no type
          orderUpdated?.payment_source?.payment_response?.action
        const paymentStatus = orderUpdated?.payment_status
        if (
          (["Cancelled", "Refused"].includes(resultCode) && refusalReasonCode !== "12") ||
          errorCode
        ) {
          const message =
            // @ts-expect-error no type
            orderUpdated?.payment_response?.refusalReason ??
            // @ts-expect-error no type
            orderUpdated?.payment_response?.message

          return {
            resultCode: errorCode ? "Refused" : resultCode,
            message,
          }
        }
        // What the shopper still has to cover with another method, in Adyen's
        // `{ currency, value }` shape.
        //
        // Do NOT derive this from `gift_card_amount_cents`: that field is the sum of the
        // Commerce Layer `gift_card` resources applied to the order, and an Adyen gift card
        // authorized through `_authorization_amount_cents` never creates one — it stays 0,
        // so the subtraction would hand the Drop-in back the full total.
        //
        // Adyen's own `remainingAmount` is authoritative when the account uses the
        // partial-payments order flow (it already nets off every card authorized so far);
        // otherwise fall back to what we just authorized ourselves: `currentBalance`, the
        // amount sent as `_authorization_amount_cents` above.
        const adyenRemainingAmount =
          // @ts-expect-error no type
          orderUpdated?.payment_source?.payment_response?.order?.remainingAmount
        const currency = orderUpdated?.currency_code ?? order?.currency_code
        const remainingValue =
          typeof adyenRemainingAmount?.value === "number"
            ? adyenRemainingAmount.value
            : Math.max(totalAmount - currentBalance, 0)
        return {
          resultCode: "Authorised",
          paymentMethodType: currentPaymentMethodType,
          action,
          paymentStatus,
          // Adyen validates the amount and silently cancels the update on an empty
          // currency, so only report one when the currency is actually known.
          ...(currency != null && remainingValue > 0
            ? { remainingAmount: { currency, value: remainingValue } }
            : {}),
        }
      }
      const res = await setPaymentSource({
        paymentSourceId: currentPaymentSourceId,
        paymentResource: "adyen_payments",
        attributes: {
          _authorize: 1,
        },
      })
      // @ts-expect-error no type
      const action = res?.payment_response?.action
      // @ts-expect-error no type
      const resultCode = res?.payment_response?.resultCode
      if (action != null) {
        return {
          resultCode,
          action,
        }
      }

      // @ts-expect-error no type
      const issuerType = res?.payment_instrument?.issuer_type
      if (["Authorised", "Pending", "Received"].includes(resultCode)) {
        if (["apple pay", "google pay"].includes(issuerType) && setPlaceOrder != null) {
          await setPlaceOrder({
            paymentSource: res,
            currentCustomerPaymentSourceId,
          })
          return {
            resultCode,
          }
        }
        if (placeOrderButtonRef?.current != null) {
          if (placeOrderButtonRef.current.disabled) {
            placeOrderButtonRef.current.disabled = false
          }
          placeOrderButtonRef.current.click()
        }
        return {
          resultCode,
        }
      }
      if (["Cancelled", "Refused"].includes(resultCode)) {
        // @ts-expect-error no type
        const message = res?.payment_response?.refusalReason
        setPaymentMethodErrors([
          {
            code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
            resource: "payment_methods",
            field: currentPaymentMethodType,
            message,
          },
        ])
        if (component) {
          component.mount("#adyen-dropin")
        }
      }
      // @ts-expect-error no type
      const errorType = res?.payment_response?.errorType
      if (errorType) {
        // @ts-expect-error no type
        const errorCode = res?.payment_response?.errorCode
        if (errorCode === "14_006") {
          onSubmit(state, component)
        } else {
          // @ts-expect-error no type
          const message = res?.payment_response?.message
          setPaymentMethodErrors([
            {
              code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
              resource: "payment_methods",
              field: currentPaymentMethodType,
              message,
            },
          ])
        }
      }
      return {
        resultCode,
        paymentMethodType: currentPaymentMethodType,
      }
    } catch (error: unknown) {
      const { message } = error as Record<string, string>
      setPaymentMethodErrors([
        {
          code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
          resource: "payment_methods",
          field: currentPaymentMethodType,
          message: message ?? "An error occurred",
        },
      ])
      return {
        resultCode: "Error",
      }
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: Infinite loop
  useEffect(() => {
    const paymentMethodsResponse = {
      // @ts-expect-error no type
      paymentMethods: paymentSource?.payment_methods?.paymentMethods
        ? // @ts-expect-error no type
          paymentSource?.payment_methods.paymentMethods
        : [],
      // @ts-expect-error no type
      storedPaymentMethods: paymentSource?.payment_methods?.storedPaymentMethods
        ? // @ts-expect-error no type
          paymentSource?.payment_methods.storedPaymentMethods
        : [],
    }
    if (paymentMethodsResponse.paymentMethods.length === 0) {
      console.error("Payment methods are not available. Please, check your Adyen configuration.")
    }
    let showStoredPaymentMethods =
      // @ts-expect-error no type
      paymentSource?.payment_methods?.storedPaymentMethods != null ?? false
    if (order && hasSubscriptions(order)) {
      /**
       * If the order has subscriptions, we don't show stored payment methods
       */
      showStoredPaymentMethods = false
      /**
       * Need to reset stored payment methods
       * to avoid showing them when the order has subscriptions
       */
      paymentMethodsResponse.storedPaymentMethods = []
      /**
       * Remove scheme payment methods
       * because they are not supported in subscriptions
       */
      paymentMethodsResponse.paymentMethods =
        subscriptionPaymentMethods != null && subscriptionPaymentMethods.length > 0
          ? paymentMethodsResponse.paymentMethods.filter((pm: { type: PaymentMethodType }) =>
              subscriptionPaymentMethods.includes(pm.type)
            )
          : paymentMethodsResponse.paymentMethods
    }
    const options = {
      locale: dropInLocale,
      environment,
      clientKey,
      amount: {
        currency: order?.currency_code || "",
        value: order?.total_amount_with_taxes_cents || 0,
      },
      countryCode: order?.country_code || "",
      paymentMethodsResponse,
      showPayButton: false,
      onAdditionalDetails: (state, element, actions) => {
        const onAdditionalDetails = async (): Promise<void> => {
          const { resultCode } = await handleOnAdditionalDetails(state, element)
          if (["Cancelled", "Refused"].includes(resultCode)) {
            actions.reject()
          } else {
            actions.resolve({
              resultCode,
            })
          }
        }
        onAdditionalDetails()
      },
      onChange: (state) => {
        handleChange(state)
      },
      onSubmit: (state, element, actions) => {
        const handleSubmit = async (): Promise<void> => {
          const { resultCode, action, message, paymentStatus, remainingAmount } = await onSubmit(
            state,
            element
          )
          if (["Cancelled", "Refused"].includes(resultCode)) {
            actions.reject()
            if (message) {
              setGiftcardError(message)
            }
          } else if (action != null) {
            dropinRef.current?.handleAction(action)
          } else {
            actions.resolve({
              resultCode,
            })
            const refreshKey = paymentSource?.id ?? "unknown"
            if (
              paymentStatus === "partially_authorized" &&
              remainingAmount != null &&
              refreshedForSourceRef.current !== refreshKey
            ) {
              refreshedForSourceRef.current = refreshKey
              // Refresh the Drop-in for the reduced amount. `shouldReinitializeCheckout: true`
              // makes Core `setOptions(amount)`, re-`initialize()`, then `update()` every
              // mounted component — and `BaseElement.update()` is `state = {}` plus
              // `unmount().mount(this._node)`, i.e. a real refresh in place, with the payment
              // method list consistent with what is left to pay.
              //
              // This replaces `dropinRef.current?.mount("#adyen-dropin")`, which re-rendered
              // the Drop-in with the *old* amount: same lost selection, none of the benefit.
              //
              // Latched above, so it happens once per authorization and not on every pass.
              checkoutRef.current?.update(
                { amount: remainingAmount },
                { shouldReinitializeCheckout: true }
              )
              // The refresh resets `activePaymentMethod`, so the form is genuinely not
              // submittable until the shopper picks a method again — at which point
              // `handleChange` re-patches `ref.current.onsubmit` and re-arms the ref. Dropping
              // it here keeps <PlaceOrderButton> honest; leaving it patched is what let it
              // call `Dropin.submit()` on an empty Drop-in and throw "No active payment
              // method.".
              if (ref.current != null) {
                ref.current.onsubmit = null
              }
              setPaymentRef({ ref: { current: null } })
            }
            setGiftcardError(null)
          }
        }
        handleSubmit()
      },
    } satisfies CoreConfiguration
    if (!ref && clientKey) setCustomerOrderParam("_save_payment_source_to_customer_wallet", "false")
    // An expired `order_data` makes the reducer destroy the payment source and a fresh one
    // takes its place. The Drop-in bakes Adyen's session in at creation, so the instance on
    // screen is still talking to the session the API now rejects, and the shopper's retry
    // can never succeed. `update({ shouldReinitializeCheckout: true })`, used below for the
    // partial-authorization refresh, re-initializes Core with that same dead session, so a
    // genuine rebuild is the only way back.
    //
    // `checkout` is set once at initialization and never cleared, which is what latches the
    // branch below shut for the rest of the component's life; hence the explicit override
    // rather than another condition on the state.
    const currentSourceId = paymentSource?.id
    const sessionReplaced =
      sessionExpiredAt != null &&
      dropinRef.current != null &&
      currentSourceId != null &&
      availablePaymentMethodsCount > 0 &&
      initializedForSourceRef.current !== currentSourceId
    if (sessionReplaced) {
      dropinRef.current?.remove()
      dropinRef.current = null
      checkoutRef.current = null
      refreshedForSourceRef.current = null
      setSessionExpiredAt(null)
    }
    if (clientKey && window && (sessionReplaced || (!loadAdyen && !checkout))) {
      const initializeAdyen = async (): Promise<void> => {
        const checkout = await AdyenCheckout(options)
        checkoutRef.current = checkout
        const dropin = new Dropin(checkout, {
          disableFinalAnimation: true,
          showRemovePaymentMethodButton: showStoredPaymentMethods,
          instantPaymentTypes: ["applepay", "googlepay"],
          paymentMethodsConfiguration: {
            showStoredPaymentMethods,
            paypal: {
              showPayButton: true,
              style: styles?.paypal,
              ...config?.paymentMethodsConfiguration?.paypal,
            },
            card: {
              enableStoreDetails: showStoredPaymentMethods,
              styles: styles?.card,
              holderNameRequired: false,
              ...config?.paymentMethodsConfiguration?.card,
            },
            giftcard: {
              showPayButton: true,
              ...config?.paymentMethodsConfiguration?.giftcard,
            },
            ...config?.paymentMethodsConfiguration,
          },
          onDisableStoredPaymentMethod: (state) => {
            const recurringDetailReference = state
            const shopperReference = customers?.shopper_reference ?? undefined
            if (onDisableStoredPaymentMethod != null) {
              onDisableStoredPaymentMethod({
                recurringDetailReference,
                shopperReference,
              })
                .then((response) => {
                  if (response) {
                    setPaymentSource({
                      paymentResource: "adyen_payments",
                      order,
                      attributes: {},
                    })
                  } else {
                    console.error("onDisableStoredPaymentMethod error")
                  }
                })
                .catch((error) => {
                  console.error("onDisableStoredPaymentMethod error", error)
                })
            }
          },
          onSelect: (component) => {
            const id: string = component._id
            const isValid = component.isValid
            if (id.search("scheme") === -1) {
              if (ref.current) {
                /**
                 * For payment methods different from card, we remove the onsubmit handler
                 * to manage the submission via Adyen Drop-in and the place order button remains disabled
                 */
                if (id.search("paypal") === -1 && id.search("giftcard") === -1) {
                  ref.current.onsubmit = async () => {
                    return await handleSubmit(ref.current as unknown as FormEvent<HTMLFormElement>)
                  }
                } else {
                  ref.current.onsubmit = null
                }
                setPaymentRef({ ref })
              }
            }
            if (isValid) {
              if (ref.current) {
                ref.current.onsubmit = async () => {
                  return await handleSubmit(ref.current as unknown as FormEvent<HTMLFormElement>)
                }
                setPaymentMethodErrors([])
                setPaymentRef({ ref })
                if (placeOrderButtonRef?.current != null) {
                  placeOrderButtonRef.current.disabled = false
                }
              }
            }
            if (onSelect) {
              onSelect(component)
            }
          },
          onReady() {
            if (onReady) onReady()
          },
        }).mount("#adyen-dropin")
        if (dropin && checkout) {
          dropinRef.current = dropin
          initializedForSourceRef.current = paymentSource?.id ?? null
          setCheckout(dropin)
          setLoadAdyen(true)
        }
      }
      const html = document.getElementById("adyen-dropin")
      if (!dropinRef.current && status === "standby" && html) {
        initializeAdyen()
      }
    }
    return () => {
      setPaymentRef({ ref: { current: null } })
      setLoadAdyen(false)
    }
  }, [
    clientKey,
    ref != null,
    status,
    setPaymentMethodErrors != null,
    paymentSource?.id,
    availablePaymentMethodsCount,
    sessionExpiredAt,
  ])
  return !clientKey && !loadAdyen && !checkout ? null : (
    <form
      ref={ref}
      onSubmit={(e) => {
        handleSubmit(e)
      }}
    >
      <div className={cardContainerClassName} id="adyen-dropin" />
      {giftcardError != null && giftcardErrorComponent
        ? giftcardErrorComponent(giftcardError)
        : null}
      {templateCustomerSaveToWallet && (
        <Parent {...{ name: "save_payment_source_to_customer_wallet" }}>
          {templateCustomerSaveToWallet}
        </Parent>
      )}
    </form>
  )
}

export default AdyenPayment

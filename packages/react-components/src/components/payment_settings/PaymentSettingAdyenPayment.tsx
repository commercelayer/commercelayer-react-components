import {
  AdyenCheckout,
  type CoreConfiguration,
  Dropin,
  type ICore,
  type OnChangeData,
} from "@adyen/adyen-web/auto"
import {
  ADYEN_SETTING_TYPE,
  authorizeGiftCardSessions,
  readAdyenSession,
} from "@commercelayer/core-components"
import type { PaymentSetting } from "@commercelayer/sdk"
import { type JSX, useContext, useEffect, useRef, useState } from "react"
import Parent from "#components/utils/Parent"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import PaymentSettingChildrenContext from "#context/PaymentSettingChildrenContext"
import { useCollectionPermitted } from "#hooks/useCollectionPermitted"
import { usePaymentGatewayHandoff } from "#hooks/usePaymentGatewayHandoff"
import type { BaseError } from "#typings/errors"
import type { ChildrenFunction } from "#typings/index"
import useCustomContext from "#utils/hooks/useCustomContext"
import {
  type PaymentGatewaySubmitResult,
  registerGatewayCollection,
  registerHostCollection,
  setCollectionReady,
  setOutOfBandCollection,
} from "#utils/paymentGatewayStore"

/**
 * Which Adyen endpoint to talk to.
 *
 * `adyen-web` v6 has no notion of Adyen's `live_url_prefix` — it addresses the
 * shared `checkoutshopper-*` hosts — so the regional variants have to be named
 * here.
 */
export type AdyenEnvironment =
  | "test"
  | "live"
  | "live-us"
  | "live-au"
  | "live-apse"
  | "live-in"
  | "live-nea"

/**
 * A payment method this component has been designed for.
 *
 * Our vocabulary rather than Adyen's tx-variants, and deliberately: a consumer
 * choosing from this union cannot smuggle in a method nobody has tested, where
 * the failure is worse than a dead control — an undesigned wallet renders an
 * empty accordion panel, because `showPayButton: false` deletes its component
 * outright rather than hiding a button.
 */
export type AdyenPaymentMethod = "card" | "paypal" | "google_pay" | "apple_pay"

/** Our names to Adyen's, for `allowPaymentMethods`. */
const ADYEN_TX_VARIANTS: Record<AdyenPaymentMethod, string> = {
  card: "scheme",
  paypal: "paypal",
  google_pay: "googlepay",
  apple_pay: "applepay",
}

/**
 * What a consumer gets without asking — every method but Apple Pay.
 *
 * Apple Pay is the one exception to "offer everything that has been built", and
 * for a property no other method has: being offered is not evidence it can
 * work. Cards, PayPal and Google Pay either work or filter themselves out —
 * `isReadyToPay()`, funding eligibility, `isAvailable()`. Apple Pay's
 * availability check only asks whether the browser and device can pay at all;
 * whether *this domain* is registered for Apple Pay on the merchant account is
 * settled later, at merchant validation, after the shopper has tapped. On an
 * unregistered domain the button therefore renders and then fails.
 *
 * That registration is out-of-band — Adyen's Management API `addApplePayDomains`
 * plus a `.well-known` file served publicly — and nothing here can detect it.
 * So it is opt-in: a consumer asks for `"apple_pay"` once they have done it.
 */
const ALL_METHODS: AdyenPaymentMethod[] = ["card", "paypal", "google_pay"]

/**
 * Methods whose own control performs the payment — a **Gateway-Owned Button**.
 *
 * PayPal is here because its `submit` throws by design. Google Pay is here for
 * a different reason, and the distinction cost a correction: its `submit` works
 * — it resolves our `onClick` and then calls `loadPaymentData()` — but Google
 * requires that call to happen **inside a user gesture**, and our place
 * sequence charges the gift cards first. After that round trip the gesture is
 * spent and the sheet never opens.
 *
 * So "renders its own button" and "owns the click" are still different
 * questions, and for the wallets the answer to the second is the gesture, not
 * the API. Apple Pay is here for exactly Google Pay's reason: `submit` calls
 * `startSession()`, and `session.begin()` waits on the click resolving.
 */
const OWNS_ITS_BUTTON = new Set<string>([
  ADYEN_TX_VARIANTS.paypal,
  ADYEN_TX_VARIANTS.google_pay,
  ADYEN_TX_VARIANTS.apple_pay,
])

/**
 * PayPal's own callback signatures, which Adyen forwards verbatim into
 * `paypal.Buttons` but under-declares: `PayPalConfiguration.onClick` is typed
 * `() => void`, with no parameters at all. These come from
 * `@paypal/paypal-js`, and the casts at the call site are the price of using
 * them — pin `@adyen/adyen-web`, and treat an upgrade as something the PayPal
 * end-to-end test has to pass before it lands.
 */
interface PayPalOnClickActions {
  resolve: () => Promise<void>
  reject: () => Promise<void>
}

interface PayPalOnInitActions {
  enable: () => Promise<void>
  disable: () => Promise<void>
}

/**
 * A wallet's `onAuthorized` actions — Apple Pay's and Google Pay's alike.
 *
 * The hook fires once the shopper has chosen a card in the wallet's own sheet
 * and **before** `/payments` is called: both components run
 * `handleAuthorization().then(makePaymentsCall)`. So it is where money can
 * still be stopped after the sheet has opened, and the only such place.
 *
 * What a rejection is *made of* is the one thing that differs. Google takes a
 * `PaymentDataError` and shows a plain string verbatim; Apple takes an
 * `ApplePayError`, a Safari global, and a bare string is not one. Hence
 * `unknown` here and a per-method constructor at the call site. Neither
 * charges anything, and both keep their sheet open for another attempt.
 */
interface WalletOnAuthorizedActions<TError> {
  resolve: () => void
  reject: (error?: TError) => void
}

/**
 * A wallet's `onClick`, which takes its callbacks **positionally** rather than
 * as an actions object — `new Promise((resolve, reject) => onClick(resolve, reject))`
 * in both components, with `session.begin()` / `loadPaymentData()` waiting on
 * it. Not PayPal's shape, and the two must not be written as if they were.
 */
type WalletOnClick = (resolve: () => void, reject: () => void) => void

/**
 * Apple's error type, if we are in a browser that has one.
 *
 * Safari-only and absent from the DOM lib, so it is looked up rather than
 * imported. Looked up **when needed** and not at module load: a module-scope
 * read would fix the answer before hydration, and would make the global
 * untestable without a load-order trick.
 */
function applePayErrorCtor():
  | (new (
      code: string,
      contactField?: string,
      message?: string
    ) => ApplePayJS.ApplePayError)
  | undefined {
  return (
    globalThis as {
      ApplePayError?: new (
        code: string,
        contactField?: string,
        message?: string
      ) => ApplePayJS.ApplePayError
    }
  ).ApplePayError
}

export interface PaymentSettingAdyenPaymentChildrenProps {
  /** Whether the Drop-in has a valid payment method ready to submit. */
  isReady: boolean
  /** Whether the shopper's payment is being collected right now. */
  isSubmitting: boolean
  /**
   * Whether a 3DS redirect is being completed. The money is already taken and
   * the order is being placed without a click — see the redirect-resume hook.
   */
  isResumingRedirect: boolean
  /**
   * Whether the method the shopper has open collects through its own control.
   *
   * True for PayPal. `<PlaceOrderButton>` is disabled while it is, so an
   * application may want to say why rather than leave a dead button.
   */
  ownsItsButton: boolean
  /**
   * The gateway's own verdict on the last completed payment, when there was one.
   *
   * Worth reading: `Pending` and `Received` arrive as **success** — PayPal
   * produces them far more than cards do — so a completed payment is not
   * necessarily a captured one. The order is placed either way.
   */
  lastResultCode?: string
  /** Why the last attempt failed, if it did. */
  errors: BaseError[]
}

interface Props {
  children?: ChildrenFunction<PaymentSettingAdyenPaymentChildrenProps>
  /**
   * Defaults to `test` for a `test_`-prefixed Client Key and `live` otherwise.
   * Set it only for one of Adyen's regional live endpoints, which nothing the
   * API exposes can tell us apart.
   */
  environment?: AdyenEnvironment
  /**
   * Locale for the Drop-in, e.g. `"it-IT"`. Defaults to the Adyen session's
   * `shopperLocale`.
   *
   * `adyen-web` builds its i18n module **once** and ignores later updates, so
   * changing this on a mounted Drop-in has no effect. A checkout that lets the
   * shopper switch language mid-payment needs a `key` on this component to
   * force a remount.
   */
  locale?: string
  /**
   * Which of the designed methods to offer. Defaults to every one whose being
   * offered is evidence it can work — today cards, PayPal and Google Pay.
   *
   * Narrowing, mostly: a merchant who does not want PayPal can turn it off
   * without waiting for a release, and cannot turn on a method nobody has
   * designed for. **`"apple_pay"` is the exception and must be asked for**,
   * because its button renders wherever the device can pay and only fails
   * later, at merchant validation, if this exact domain is not registered for
   * Apple Pay on the Adyen merchant account. Pass it once that is done.
   */
  paymentMethods?: AdyenPaymentMethod[]
  /** Class on the element the Drop-in mounts into. */
  containerClassName?: string
}

/**
 * The Adyen Payment Setting (`payment_setting_adyens`), through Adyen's
 * client-side Drop-in.
 *
 * Unlike `<PaymentSettingManualPayment>`, selecting is not the whole
 * interaction: a card has to be collected, and a gateway can refuse. What makes
 * that possible without any server support is the **Sessions Flow** — Commerce
 * Layer creates an Adyen Session at Payment Session creation, this component
 * hands it to `adyen-web`, and `adyen-web` talks to Adyen directly. The 3DS
 * challenge, the redirect and the authentication result are all its business,
 * not ours.
 *
 * **The privacy-and-terms gate is enforced twice, by two mechanisms, and that
 * is the design.** Which one applies depends on who owns the click, and that is
 * a property of the payment method rather than of this component.
 *
 * For a **card**, `showPayButton: false` on the `Core` leaves the form inert and
 * `<PlaceOrderButton>` calls `submit()` through the Payment Gateway Handoff. So
 * the gate sits in front of our click — and owning that click is also what lets
 * the gift cards be authorized *before* the card, which a refused payment must
 * never leave inverted.
 *
 * For **PayPal**, none of that is available: `submit` throws by design, because
 * the popup needs a real user gesture on their branded button. `showPayButton`
 * is re-enabled for it per method — leaving it false would render an empty
 * accordion panel rather than a hidden button, since PayPal's component returns
 * `null` outright — and the gate moves inside PayPal's own click, through
 * `onInit` and `onClick`. The gift cards are authorized there too, for the same
 * reason: it is the only moment before the money moves that we are given.
 *
 * Renders `null` unless its setting is selected, so it can be dropped inside
 * `<PaymentSetting>` alongside other settings' components.
 */
export function PaymentSettingAdyenPayment(props: Props): JSX.Element | null {
  const { children, environment, locale, containerClassName, paymentMethods = ALL_METHODS } = props
  const { setting, currentPaymentSession, isSelected, readonly } = useCustomContext({
    context: PaymentSettingChildrenContext,
    contextComponentName: "PaymentSetting",
    currentComponentName: "PaymentSettingAdyenPayment",
    key: "setting",
  })
  const { order, getOrder } = useContext(OrderContext)
  const { accessToken, interceptors } = useContext(CommerceLayerContext)
  const { collectedOutOfBand } = usePaymentGatewayHandoff()
  const collectionPermitted = useCollectionPermitted()

  const containerRef = useRef<HTMLDivElement | null>(null)
  const dropinRef = useRef<Dropin | null>(null)
  /** Resolver for the submit the place-order button is waiting on. */
  const pendingRef = useRef<((result: PaymentGatewaySubmitResult) => void) | null>(null)
  /**
   * PayPal's `onInit` actions, one set per funding source.
   *
   * A collection and not a single value: Adyen renders **four** separate
   * `paypal.Buttons()` instances — PayPal, Credit, Pay Later, Venmo — each with
   * its own `onInit`, and `actions.enable()` reaches only the instance it came
   * from. Keeping just the last one handed over left a shopper who accepted the
   * terms after the buttons rendered with a working Venmo button and a PayPal
   * one that silently swallowed the click.
   */
  const payPalActionsRef = useRef<Set<PayPalOnInitActions>>(new Set())
  /**
   * We rejected Google Pay's `onAuthorized`, so the `onPaymentFailed` that
   * follows is our own abort and not the gateway's verdict.
   *
   * Adyen routes a rejected `onAuthorized` through `handleFailedResult`, which
   * calls `onPaymentFailed` — the same callback a refusal arrives on. Treated
   * as a refusal it would burn the Payment Session, and that is exactly wrong
   * here: no money moved, and the shopper is still standing in Google's sheet
   * able to pick another card. The session *is* the payment, so discarding it
   * would break the retry Google is offering.
   *
   * Consumed by the handler and reset on every click, so a flag can never
   * survive into the next attempt and swallow a real refusal.
   */
  const selfAbortedRef = useRef(false)

  const [isReady, setIsReady] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<BaseError[]>([])
  const [lastResultCode, setLastResultCode] = useState<string | undefined>(undefined)
  /**
   * The tx-variant the shopper currently has open in the Drop-in.
   *
   * The Drop-in offers every allowed method at once and the shopper chooses
   * inside it, so who collects is not known when it mounts — it changes with
   * their selection. `onSelect` is the only signal for that, and it fires for
   * the first method too, because `openFirstPaymentMethod` defaults to true.
   */
  const [activeMethod, setActiveMethod] = useState<string | undefined>(undefined)

  /**
   * Which methods the Drop-in may offer, in Adyen's vocabulary.
   *
   * Anything outside the designed set is dropped rather than passed through:
   * `showPayButton: false` deletes a wallet's component instead of hiding its
   * button, so an undesigned method would render an accordion that opens on
   * nothing — and re-enabling its button would walk past the terms gate.
   */
  const allowedMethods = paymentMethods.filter((method) => {
    if (method in ADYEN_TX_VARIANTS) return true
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[commercelayer] <PaymentSettingAdyenPayment> ignored paymentMethods entry "${method}": not one this library has been designed for.`
      )
    }
    return false
  })
  /**
   * The allowed methods as a stable string, because an array is rebuilt every
   * render and the mount effect would then remount the Drop-in on every
   * keystroke. The effect splits it back, so it cannot go stale either.
   */
  const allowedMethodsKey = allowedMethods.map((method) => ADYEN_TX_VARIANTS[method]).join(",")
  const offersPayPal = allowedMethods.includes("paypal")
  const offersGooglePay = allowedMethods.includes("google_pay")
  const offersApplePay = allowedMethods.includes("apple_pay")

  const ownsItsButton = activeMethod != null && OWNS_ITS_BUTTON.has(activeMethod)
  const activeMethodRef = useRef<string | undefined>(undefined)
  activeMethodRef.current = activeMethod
  /**
   * Everything PayPal's callbacks need that changes after they are installed.
   *
   * They are handed to `paypal.Buttons` when the Drop-in mounts and are never
   * rebuilt, so closing over these directly would have the gate reading the
   * acceptance from the render that mounted the form — which is `false` for
   * every shopper who ticks the box afterwards, i.e. all of them.
   */
  const latestRef = useRef({
    collectionPermitted,
    order,
    accessToken,
    interceptors,
    getOrder,
  })
  latestRef.current = { collectionPermitted, order, accessToken, interceptors, getOrder }

  const adyen = readAdyenSession(currentPaymentSession)
  const clientKey = readClientKey(setting)
  const resolvedEnvironment: AdyenEnvironment =
    environment ?? (clientKey?.startsWith("test_") === true ? "test" : "live")

  const orderId = order?.id
  const adyenSessionId = adyen?.id
  const adyenSessionData = adyen?.sessionData
  const isAdyen = setting?.type === ADYEN_SETTING_TYPE
  /**
   * Whether this instance is the live Adyen form.
   *
   * Both the mount effect and the handoff registration hang off it, and they
   * have to: `<PaymentSetting>` renders its children **once per available
   * setting**, so this component is mounted inside every setting's card and
   * returns `null` from all but one. Its effects still run. Registering a
   * handoff from those instances made `<PlaceOrderButton>` believe a gateway
   * would collect the payment on an order paying by bank transfer — it called
   * `submit()`, got `incomplete` from an instance with no Drop-in, and returned
   * without placing anything, silently. The Adyen tests passed through it only
   * because the selected instance happened to register last.
   *
   * Keeping the mount on the same flag also means flipping `readonly` back to
   * false re-runs the effect, instead of leaving the form permanently absent.
   */
  const shouldMount = isAdyen && isSelected === true && readonly !== true

  // Build the Drop-in, once per Adyen Session. A refused payment replaces the
  // Payment Session, which changes `adyenSessionId` and remounts everything —
  // which is also the only way back to a usable form, since the error screen
  // tears down the PCI secured-field iframes.
  useEffect(() => {
    if (!shouldMount) return
    if (adyenSessionId == null || adyenSessionData == null || clientKey == null) return
    if (typeof window === "undefined") return
    const container = containerRef.current
    if (container == null) return

    let cancelled = false
    let dropin: Dropin | undefined

    /** Answer the waiting `submit()`, if there is one. */
    const settle = (result: PaymentGatewaySubmitResult): void => {
      const resolve = pendingRef.current
      pendingRef.current = null
      resolve?.(result)
    }

    /**
     * Whether the method the shopper has open owns the click.
     *
     * Read through the ref, not from the render that built these callbacks: the
     * Drop-in offers every allowed method at once and the shopper's choice
     * arrives later, through `onSelect`.
     */
    const ownsCurrentClick = (): boolean => {
      const active = activeMethodRef.current
      return active != null && OWNS_ITS_BUTTON.has(active)
    }

    void (async () => {
      try {
        const core: ICore = await AdyenCheckout({
          clientKey,
          environment: resolvedEnvironment,
          // The Adyen Session, as the API passed Adyen's own response through.
          session: { id: adyenSessionId, sessionData: adyenSessionData },
          // `<PlaceOrderButton>` is the pay button. This has to be here rather
          // than on the `Dropin`: the Drop-in forwards only `{ elementRef,
          // isDropin }` to its children, so setting it there does nothing.
          showPayButton: false,
          allowPaymentMethods: allowedMethodsKey.split(","),
          ...(locale != null ? { locale } : {}),
          onChange: (state: OnChangeData) => {
            const valid = state.isValid === true
            setIsReady(valid)
            setCollectionReady(orderId, valid)
          },
          onPaymentCompleted: (data) => {
            if (cancelled) return
            // Not necessarily captured funds: `Pending` and `Received` arrive
            // here as success, and PayPal produces them far more than cards do.
            // The order is placed either way — the authorization stays
            // `pending` and the placeability loop waits — but an application
            // that wants to say "we are confirming your payment" needs the code.
            const code = readResultCode(data)
            setLastResultCode(code)
            if (ownsCurrentClick()) {
              // Nobody pressed our button, so there is no promise to settle:
              // this is an Out-of-Band Collection and `<PlaceOrderButton>`
              // takes the order the rest of the way on its own initiative.
              setOutOfBandCollection(orderId, "done")
              return
            }
            settle({ status: "completed" })
          },
          onPaymentFailed: (data) => {
            if (cancelled) return
            if (selfAbortedRef.current) {
              // Ours, not Adyen's. Already reported, nothing was charged, and
              // the Adyen Session must survive for the retry Google is offering.
              selfAbortedRef.current = false
              return
            }
            // A verdict: no money moved. Replacing the burnt Payment Session is
            // `<PlaceOrderButton>`'s, not ours — it also decides whether the
            // gift cards are given back, and that changes the amount the
            // replacement has to be created for.
            const code = readResultCode(data) ?? "Refused"
            setLastResultCode(code)
            setErrors([refusalError(code)])
            if (ownsCurrentClick()) {
              setOutOfBandCollection(orderId, "failed", [refusalError(code)])
              return
            }
            settle({ status: "failed", code })
          },
          onError: (error) => {
            if (cancelled) return
            // **Every** `onError` is an unknown outcome, whatever its `name`
            // says. A shopper closing PayPal's overlay arrives here with
            // `name: "CANCEL"` and an empty message, and so does a failed
            // script load — with a message. Separating them on that undocumented
            // convention would put "does this shopper get their money back" on
            // it, so it decides nothing: in doubt, nothing is touched.
            //
            // For a gateway-owned button there is no pending submit either, and
            // that is the right outcome — cancelling PayPal costs nothing, the
            // Adyen Session is still there and the shopper can click again.
            const code = error?.name ?? "Error"
            settle({ status: "unknown", code })
            setErrors([
              {
                code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
                resource: "payment_methods",
                message: error?.message ?? code,
                meta: { error: code },
              },
            ])
          },
        } satisfies CoreConfiguration)

        if (cancelled) return

        // `disableFinalAnimation` because the session is replaced on a refusal:
        // Adyen's error screen would only flash before the remount, and the
        // message the shopper needs is reported through `errors` instead.
        dropin = new Dropin(core, {
          disableFinalAnimation: true,
          // Who collects changes with the shopper's choice inside the Drop-in,
          // and this is the only signal for it. It fires for the first method
          // too, because `openFirstPaymentMethod` defaults to true.
          onSelect: (component) => {
            if (cancelled) return
            const type = (component as unknown as { type?: string })?.type
            activeMethodRef.current = type
            setActiveMethod(type)
          },
          ...(offersPayPal || offersGooglePay || offersApplePay
            ? {
                paymentMethodsConfiguration: {
                  ...(offersApplePay ? { applepay: walletConfiguration(appleError) } : {}),
                  ...(offersGooglePay ? { googlepay: walletConfiguration(plainError) } : {}),
                  ...(offersPayPal
                    ? {
                        paypal: {
                          /**
                           * Re-enables PayPal at all. The `Core` keeps `false` so a
                           * card still routes through `<PlaceOrderButton>`, and this
                           * wins because the Drop-in's per-method config is spread
                           * last. Left false, PayPal's component returns `null` and
                           * the shopper gets an accordion that opens on nothing.
                           */
                          showPayButton: true,
                          onInit: ((_data: unknown, actions: PayPalOnInitActions) => {
                            // Handed over exactly once per funding source, so they
                            // are all kept: the shopper who accepts the terms *after*
                            // the buttons render needs `enable()` called on every one
                            // of them, and without holding these they stay dead for
                            // good. The gate is read here rather than closed over, so
                            // a button whose SDK loaded late is still born disabled.
                            payPalActionsRef.current.add(actions)
                            if (!latestRef.current.collectionPermitted) {
                              void Promise.resolve(actions.disable()).catch(() => {})
                            }
                          }) as unknown as () => void,
                          onClick: (async (_data: unknown, actions: PayPalOnClickActions) => {
                            await onPayPalClick(actions)
                          }) as unknown as () => void,
                        },
                      }
                    : {}),
                },
              }
            : {}),
        })
        dropin.mount(container)
        dropinRef.current = dropin
      } catch (error) {
        if (cancelled) return
        // `AdyenCheckout()` rejects when `/sessions/{id}/setup` is refused —
        // an expired Adyen Session, or a Client Key not authorized for this
        // origin, which is indistinguishable from a network error here.
        setErrors([
          {
            code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
            resource: "payment_methods",
            message:
              error instanceof Error ? error.message : "The payment form could not be loaded.",
            meta: { error: "SetupFailed" },
          },
        ])
      }
    })()

    /**
     * The gate, and the gift cards, on PayPal's own click.
     *
     * This is the last moment before the money moves that we are given, and the
     * only one: PayPal's button performs the payment, `beforeSubmit` runs after
     * the popup is already open — and rejecting it never settles the promise
     * handed to `createOrder`, hanging the popup for good.
     *
     * The gift cards go first for the reason they do on the card path: a
     * refused payment must never leave them charged *after* it. The round trip
     * is within contract — PayPal types `onClick` as returning
     * `Promise<void> | void`, so the SDK waits for it.
     */
    /**
     * Google takes a plain string and shows it verbatim — its `reject` is
     * typed `(error?: PaymentDataError | string) => void`.
     */
    function plainError(message: string): string {
      return message
    }

    /**
     * Apple takes an `ApplePayError`, and a string is not one — passed a
     * string, `completePayment` shows its own generic failure instead. `unknown`
     * is the only code that is not about a contact field.
     *
     * Whether Safari renders our message or its own wording for that code is
     * not something the DOM contract promises, so this is written to be
     * *correct* rather than to guarantee the copy, and the string is the
     * fallback for a browser without the global.
     */
    function appleError(message: string): ApplePayJS.ApplePayError | undefined {
      // `undefined` and not the string: `reject` is typed for an `ApplePayError`
      // and nothing else, and a browser with no such global never rendered an
      // Apple Pay button in the first place — so this branch is unreachable
      // rather than a degraded one.
      const Ctor = applePayErrorCtor()
      return Ctor != null ? new Ctor("unknown", undefined, message) : undefined
    }

    /**
     * Everything a wallet is configured with. Apple Pay and Google Pay share
     * all of it but the type a rejection has to be dressed in.
     *
     * That they share it is the finding, not a convenience: both re-enable
     * their own button on the Drop-in, both take a positional `onClick` whose
     * resolution opens their sheet inside the click's gesture, and both run
     * `onAuthorized` before `/payments`. Apple Pay was implemented by calling
     * this function a second time.
     */
    function walletConfiguration<TError>(makeError: (message: string) => TError) {
      return {
        /** Same reason as PayPal's: the Core keeps `false` for the card. */
        showPayButton: true,
        /**
         * The gate, and **only** the gate.
         *
         * Synchronous on purpose: whatever resolves this runs immediately
         * before `session.begin()` / `loadPaymentData()`, which both wallets
         * require inside the click's user gesture. An `await` here is a race we
         * would lose intermittently — the worst kind — so the gift cards go to
         * `onAuthorized` instead.
         *
         * Neither wallet's button has enable/disable actions, unlike PayPal's,
         * so this message is the only thing standing between a shopper and a
         * control that appears to do nothing. Both SDKs swallow the rejection
         * itself: `.catch(() => ({}))` in Apple Pay, `.catch(() => {})` in
         * Google Pay.
         */
        onClick: ((resolve, reject) => {
          selfAbortedRef.current = false
          if (!latestRef.current.collectionPermitted) {
            setErrors([
              {
                code: "VALIDATION_ERROR",
                resource: "payment_methods",
                message: "Accept the terms and conditions to continue.",
                meta: { error: "TermsNotAccepted" },
              },
            ])
            reject()
            return
          }
          setErrors([])
          resolve()
        }) satisfies WalletOnClick,
        onAuthorized: (_data: unknown, actions: WalletOnAuthorizedActions<TError>) => {
          void onWalletAuthorized(actions, makeError)
        },
      }
    }

    /**
     * The gift cards, on a wallet's authorization.
     *
     * Not on the click, where PayPal's are: `loadPaymentData()` runs as soon as
     * the click resolves and Google requires it inside the gesture, so a round
     * trip there costs us the sheet. This hook has no such constraint and is
     * still before the money — `/payments` is only called once it resolves — so
     * the invariant the card path establishes holds either way: a refused
     * payment never leaves gift cards charged after it.
     *
     * What the shopper sees on a failure is better here than anywhere else.
     * Google renders the message inside its own sheet and keeps it open, so a
     * gift card that cannot be charged does not cost them the wallet flow.
     */
    async function onWalletAuthorized<TError>(
      actions: WalletOnAuthorizedActions<TError>,
      makeError: (message: string) => TError
    ): Promise<void> {
      const {
        order: currentOrder,
        accessToken: token,
        interceptors: currentInterceptors,
        getOrder: refetch,
      } = latestRef.current

      if (currentOrder == null || token == null) {
        selfAbortedRef.current = true
        actions.reject(makeError("The payment could not be started."))
        return
      }

      try {
        const authorized = await authorizeGiftCardSessions({
          accessToken: token,
          interceptors: currentInterceptors,
          order: currentOrder,
        })
        if (authorized.errors.length > 0) {
          setErrors(
            authorized.errors.map((error) => ({
              code: "VALIDATION_ERROR" as const,
              resource: "payment_methods" as const,
              message: error.message,
              field: error.field,
              ...(error.meta != null ? { meta: error.meta } : {}),
            }))
          )
          selfAbortedRef.current = true
          // The first message goes into the wallet's own sheet; the rest are on
          // our errors, where an application renders them in full.
          actions.reject(makeError(authorized.errors[0]?.message ?? "A gift card was refused."))
          return
        }
        if (authorized.authorizedSessionIds.length > 0) await refetch(currentOrder.id)
      } catch (error) {
        setErrors([
          {
            code: "VALIDATION_ERROR",
            resource: "payment_methods",
            message:
              error instanceof Error ? error.message : "The gift cards could not be charged.",
          },
        ])
        selfAbortedRef.current = true
        actions.reject(makeError("The gift cards could not be charged."))
        return
      }

      actions.resolve()
    }

    async function onPayPalClick(actions: PayPalOnClickActions): Promise<void> {
      const {
        collectionPermitted: permitted,
        order: currentOrder,
        accessToken: token,
        interceptors: currentInterceptors,
        getOrder: refetch,
      } = latestRef.current

      if (!permitted || currentOrder == null || token == null) {
        // Reported, and this is the only place it can be: PayPal's button is
        // the one the shopper pressed, and a disabled button that absorbs the
        // click reads as broken rather than as a step not yet taken. The
        // library owns the moment, so it owns telling the application — which
        // renders the copy, keyed off `meta.error`.
        //
        // `TermsNotAccepted` is the reason worth naming. A missing order or
        // token cannot be acted on by the shopper, so they get the same
        // generic refusal rather than an explanation of our internals.
        setErrors([
          {
            code: "VALIDATION_ERROR",
            resource: "payment_methods",
            message: !permitted
              ? "Accept the terms and conditions to continue."
              : "The payment could not be started.",
            meta: { error: !permitted ? "TermsNotAccepted" : "NotReady" },
          },
        ])
        await actions.reject()
        return
      }

      setErrors([])
      try {
        const authorized = await authorizeGiftCardSessions({
          accessToken: token,
          interceptors: currentInterceptors,
          order: currentOrder,
        })
        if (authorized.errors.length > 0) {
          setErrors(
            authorized.errors.map((error) => ({
              code: "VALIDATION_ERROR" as const,
              resource: "payment_methods" as const,
              message: error.message,
              field: error.field,
              ...(error.meta != null ? { meta: error.meta } : {}),
            }))
          )
          await actions.reject()
          return
        }
        // So the place sequence, which runs after PayPal has collected, skips
        // the cards it would otherwise authorize a second time.
        if (authorized.authorizedSessionIds.length > 0) await refetch(currentOrder.id)
      } catch (error) {
        setErrors([
          {
            code: "VALIDATION_ERROR",
            resource: "payment_methods",
            message:
              error instanceof Error ? error.message : "The gift cards could not be charged.",
          },
        ])
        await actions.reject()
        return
      }

      await actions.resolve()
    }

    return () => {
      cancelled = true
      dropinRef.current = null
      payPalActionsRef.current = new Set()
      setCollectionReady(orderId, false)
      // `remove()` and not `unmount()`: it also drops the element from the
      // core's component list, which `checkout.update()` would otherwise
      // re-mount into a node React has already discarded.
      dropin?.remove()
    }
  }, [
    shouldMount,
    adyenSessionId,
    adyenSessionData,
    clientKey,
    resolvedEnvironment,
    locale,
    orderId,
    allowedMethodsKey,
    offersPayPal,
    offersGooglePay,
    offersApplePay,
  ])

  // Terms accepted — or un-accepted — after PayPal's buttons rendered. `onInit`
  // hands its actions over once and never again, so this is the only way the
  // buttons can come alive for a shopper who ticked the box afterwards. Every
  // funding source is driven, because each one only listens to its own.
  useEffect(() => {
    for (const actions of payPalActionsRef.current) {
      // Swallowed rather than reported: a funding source whose button was
      // re-rendered leaves its actions behind in the set, and PayPal rejects on
      // a destroyed instance. An unhandled rejection there would surface as an
      // uncaught page error over a button that no longer exists.
      const settled = collectionPermitted ? actions.enable() : actions.disable()
      void Promise.resolve(settled).catch(() => {})
    }
  }, [collectionPermitted])

  // Publish the handoff. Separate from the mount effect so a remount for a new
  // Adyen Session does not leave a gap where the collection is null — but gated
  // on the same condition, so only the selected Adyen form ever claims that a
  // payment can be collected for this order.
  //
  // Which kind depends on the method the shopper has open. A gateway-owned
  // button is registered as exactly that and carries no `submit`: there is
  // nothing to call, and `<PlaceOrderButton>` disables itself rather than
  // offering a route that ends in `IMPLEMENTATION_ERROR`.
  useEffect(() => {
    if (!shouldMount) return
    if (ownsItsButton) return registerGatewayCollection(orderId)
    return registerHostCollection(orderId, async () => {
      const dropin = dropinRef.current
      if (dropin == null) return { status: "incomplete" }
      // `dropin.submit()` throws a bare Error when nothing is selected, and
      // silently no-ops — showing its own validation — when the form is
      // invalid. Neither settles a promise, so the guard is not optional.
      if (!dropin.isValid) {
        dropin.submit()
        return { status: "incomplete" }
      }
      setErrors([])
      setIsSubmitting(true)
      try {
        return await new Promise<PaymentGatewaySubmitResult>((resolve) => {
          pendingRef.current = resolve
          dropin.submit()
        })
      } finally {
        pendingRef.current = null
        setIsSubmitting(false)
      }
    })
  }, [orderId, shouldMount, ownsItsButton])

  const parentProps = {
    ...props,
    isReady,
    isSubmitting,
    isResumingRedirect: collectedOutOfBand === "in-progress",
    ownsItsButton,
    lastResultCode,
    errors,
  }

  if (!isAdyen) return null

  // Nothing to mount on a recap: the card was collected by Adyen and this
  // component never held it.
  const container = shouldMount ? <div ref={containerRef} className={containerClassName} /> : null

  // The container is rendered by this component and `children` after it, rather
  // than `children` replacing it as elsewhere in the library. The Drop-in mounts
  // into that element, so handing it to a render prop would make an application
  // that forgot to render it produce a payment form that silently never appears.
  // What `children` is for is the chrome around it — a spinner while submitting,
  // the message for a Drop-in that could not load.
  if (children != null) {
    return (
      <>
        {container}
        <Parent {...parentProps}>{children}</Parent>
      </>
    )
  }

  return container
}

/**
 * The Client Key, off the Adyen Payment Setting.
 *
 * `public_key` is declared on `PaymentSettingAdyen` but `available_payment_settings`
 * is typed as the polymorphic union, and narrowing it by `type` does not reach
 * the per-provider attributes — hence the read through an index signature rather
 * than a type guard.
 */
function readClientKey(setting?: PaymentSetting): string | undefined {
  const key = (setting as { public_key?: string | null } | undefined)?.public_key
  return typeof key === "string" && key !== "" ? key : undefined
}

/** Adyen's verdict, from whichever shape the callback was handed. */
function readResultCode(data: unknown): string | undefined {
  if (data == null || typeof data !== "object") return undefined
  const code = (data as { resultCode?: unknown }).resultCode
  return typeof code === "string" && code !== "" ? code : undefined
}

/**
 * A refusal, carrying Adyen's own `resultCode` and no copy of ours.
 *
 * Note `resource` is metadata here and nothing reads it: this component's
 * errors reach an application through its render prop, not through `<Errors>`.
 * The button's `gatewayError` is the opposite case — those go into the order's
 * error store, where `<Errors>` matches on `resource`, and tagging them
 * anything but `orders` made a card refusal invisible.
 *
 * `refusalReason` does not exist in this API, and the authorization's
 * `response_data` is withheld from storefront tokens — so `resultCode` is the
 * only information there is. It goes in `meta.error` for an application to map,
 * and in `message` because the field is required and inventing prose here would
 * put payment wording, in one hard-coded language, in a package that cannot
 * know the checkout's locale.
 */
function refusalError(resultCode: string): BaseError {
  return {
    code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
    resource: "payment_methods",
    message: resultCode,
    meta: { error: resultCode },
  }
}

export default PaymentSettingAdyenPayment

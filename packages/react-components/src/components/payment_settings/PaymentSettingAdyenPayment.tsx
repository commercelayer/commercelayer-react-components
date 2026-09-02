import {
  AdyenCheckout,
  type CoreConfiguration,
  Dropin,
  type ICore,
  type OnChangeData,
} from "@adyen/adyen-web/auto"
import { readAdyenSession } from "@commercelayer/core-components"
import type { PaymentSetting } from "@commercelayer/sdk"
import { type JSX, useContext, useEffect, useRef, useState } from "react"
import Parent from "#components/utils/Parent"
import OrderContext from "#context/OrderContext"
import PaymentSettingChildrenContext from "#context/PaymentSettingChildrenContext"
import { usePaymentGatewayHandoff } from "#hooks/usePaymentGatewayHandoff"
import type { BaseError } from "#typings/errors"
import type { ChildrenFunction } from "#typings/index"
import useCustomContext from "#utils/hooks/useCustomContext"
import {
  type PaymentGatewaySubmitResult,
  registerPaymentGateway,
  setPaymentGatewayReady,
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
 * **Its own Pay button is suppressed** (`showPayButton: false`) and
 * `<PlaceOrderButton>` calls `submit()` instead, through the Payment Gateway
 * Handoff. Adyen's button charges the card directly, which would take the money
 * before the shopper accepted the privacy policy and terms — and that gate is a
 * legal requirement of the checkout, not a property of the payment model. It is
 * also what lets the gift cards be authorized *before* the card, keeping the
 * charge order the gift card ADR established.
 *
 * **Cards only** (`allowPaymentMethods: ["scheme"]`). Apple Pay, Google Pay and
 * PayPal inside the Drop-in render their own pay buttons and submit themselves,
 * which would walk straight past the button and the terms gate.
 *
 * Renders `null` unless its setting is selected, so it can be dropped inside
 * `<PaymentSetting>` alongside other settings' components.
 */
export function PaymentSettingAdyenPayment(props: Props): JSX.Element | null {
  const { children, environment, locale, containerClassName } = props
  const { setting, currentPaymentSession, isSelected, readonly } = useCustomContext({
    context: PaymentSettingChildrenContext,
    contextComponentName: "PaymentSetting",
    currentComponentName: "PaymentSettingAdyenPayment",
    key: "setting",
  })
  const { order } = useContext(OrderContext)
  const { resumePhase } = usePaymentGatewayHandoff()

  const containerRef = useRef<HTMLDivElement | null>(null)
  const dropinRef = useRef<Dropin | null>(null)
  /** Resolver for the submit the place-order button is waiting on. */
  const pendingRef = useRef<((result: PaymentGatewaySubmitResult) => void) | null>(null)

  const [isReady, setIsReady] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<BaseError[]>([])

  const adyen = readAdyenSession(currentPaymentSession)
  const clientKey = readClientKey(setting)
  const resolvedEnvironment: AdyenEnvironment =
    environment ?? (clientKey?.startsWith("test_") === true ? "test" : "live")

  const orderId = order?.id
  const adyenSessionId = adyen?.id
  const adyenSessionData = adyen?.sessionData
  // The same condition the container is rendered under, so the two cannot
  // disagree. Without it in the dependency list, flipping `readonly` back to
  // false would leave the effect never re-run and the payment form never shown.
  const shouldMount = isSelected === true && readonly !== true

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
          allowPaymentMethods: ["scheme"],
          ...(locale != null ? { locale } : {}),
          onChange: (state: OnChangeData) => {
            const valid = state.isValid === true
            setIsReady(valid)
            setPaymentGatewayReady(orderId, valid)
          },
          onPaymentCompleted: () => {
            if (cancelled) return
            settle({ status: "completed" })
          },
          onPaymentFailed: (data) => {
            if (cancelled) return
            // A verdict: no money moved. Replacing the burnt Payment Session is
            // `<PlaceOrderButton>`'s, not ours — it also decides whether the
            // gift cards are given back, and that changes the amount the
            // replacement has to be created for.
            const code = readResultCode(data) ?? "Refused"
            settle({ status: "failed", code })
            setErrors([refusalError(code)])
          },
          onError: (error) => {
            if (cancelled) return
            // Not a verdict — a network failure, an expired Adyen Session, an
            // SDK error. The payment may have gone through, so nothing is
            // replaced and nothing is rolled back.
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
        dropin = new Dropin(core, { disableFinalAnimation: true })
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

    return () => {
      cancelled = true
      dropinRef.current = null
      setPaymentGatewayReady(orderId, false)
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
  ])

  // Publish the handoff. Separate from the mount effect so the button has
  // something to call as soon as this component exists, and so a remount for a
  // new Adyen Session does not leave a gap where `submit` is null.
  useEffect(() => {
    if (readonly === true) return
    return registerPaymentGateway(orderId, async () => {
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
  }, [orderId, readonly])

  const parentProps = {
    ...props,
    isReady,
    isSubmitting,
    isResumingRedirect: resumePhase === "resuming",
    errors,
  }

  if (setting?.type !== "payment_setting_adyens") return null

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

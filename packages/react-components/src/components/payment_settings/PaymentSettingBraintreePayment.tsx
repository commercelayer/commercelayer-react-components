import {
  authorizeBraintreePaymentSession,
  BRAINTREE_SETTING_TYPE,
  readBraintreeClientToken,
} from "@commercelayer/core-components"
import type { Address, Order, PaymentSession } from "@commercelayer/sdk"
import type { Client } from "braintree-web/client"
import type {
  HostedFields,
  HostedFieldsEvent,
  HostedFieldsField,
  HostedFieldsTokenizePayload,
} from "braintree-web/hosted-fields"
import type {
  ThreeDSecure,
  ThreeDSecureBillingAddress,
  ThreeDSecureVerifyOptions,
  ThreeDSecureVerifyPayload,
} from "braintree-web/three-d-secure"
import { type JSX, useContext, useEffect, useId, useRef, useState } from "react"
import Parent from "#components/utils/Parent"
import CommerceLayerContext from "#context/CommerceLayerContext"
import OrderContext from "#context/OrderContext"
import PaymentSettingChildrenContext from "#context/PaymentSettingChildrenContext"
import { usePaymentSettingLoader } from "#hooks/usePaymentSettingLoader"
import { useStickySessionValue } from "#hooks/useStickySessionValue"
import type { BaseError } from "#typings/errors"
import type { ChildrenFunction, LoaderType } from "#typings/index"
import {
  braintreeErrorCode,
  interopDefault,
  pageThreeDSecureInstance,
  sessionAmount,
} from "#utils/braintree"
import {
  type PaymentGatewaySubmitResult,
  registerHostCollection,
  setCollecting,
  setCollectionReady,
} from "#utils/paymentGatewayStore"

/** The Hosted Fields this component can render, in the order it renders them. */
export type PaymentSettingBraintreeFieldName =
  | "cardholderName"
  | "number"
  | "expirationDate"
  | "cvv"

/**
 * Options for one Hosted Field: Braintree's own, less the container — this
 * component owns where the field mounts — plus the text of its label.
 */
export type PaymentSettingBraintreeFieldOptions = Omit<
  HostedFieldsField,
  "container" | "selector"
> & {
  label?: string
}

export interface PaymentSettingBraintreeClassNames {
  /** The element wrapping one field: its label and its input. */
  field?: string
  /** Each label. */
  label?: string
  /**
   * The element Braintree mounts a field's iframe into. It is what Braintree
   * marks with `braintree-hosted-fields-focused`, `-valid` and `-invalid`, so
   * it is the one to draw the input's border on.
   */
  input?: string
  /** The element wrapping the expiry and CVV fields, for a side-by-side row. */
  cardDetails?: string
}

export interface PaymentSettingBraintreePaymentChildrenProps {
  /** Whether Braintree has booted and the fields are on screen. */
  isLoaded: boolean
  /** Whether every field holds a valid value. */
  isReady: boolean
  /** A payment is in flight, started by `<PlaceOrderButton>`. */
  isSubmitting: boolean
  /**
   * The code behind the last failure: Braintree's own (`HOSTED_FIELDS_FIELDS_EMPTY`,
   * `THREEDS_…`), the 3DS status when the shopper did not authenticate, or the
   * authorization's status (`declined`, `failed`) when Braintree refused the
   * payment. Map it to copy in the checkout's language; the `message` on
   * `errors` is an English fallback.
   */
  lastErrorCode?: string
  errors: BaseError[]
}

interface Props {
  children?: ChildrenFunction<PaymentSettingBraintreePaymentChildrenProps>
  /**
   * Per-field options: placeholder, label and anything else Braintree accepts.
   * Number, expiry and CVV are always rendered; `cardholderName` only when it
   * is given here.
   */
  fields?: Partial<Record<PaymentSettingBraintreeFieldName, PaymentSettingBraintreeFieldOptions>>
  /**
   * Styles applied **inside** the fields' iframes, in Braintree's format —
   * selectors such as `input`, `:focus` or `.invalid` mapping to CSS
   * properties. Braintree loads no web fonts in there, so only installed fonts
   * apply. Defaults to a 16px font size, which keeps iOS from zooming in on
   * focus.
   */
  styles?: Record<string, Record<string, string>>
  /** Class on the element wrapping the whole form. */
  containerClassName?: string
  /** Classes for the parts of the form. */
  classNames?: PaymentSettingBraintreeClassNames
  /**
   * Run 3D Secure before paying. Defaults to `true`.
   *
   * Commerce Layer makes no 3DS check of its own — it authorizes whatever
   * nonce it is handed — so this is the only place 3DS can happen. Turn it off
   * only for a merchant account that does not have it enabled, where creating
   * it fails.
   */
  threeDSecure?: boolean
  /**
   * Refuse a card for which 3DS could not shift the liability at all — one not
   * enrolled, an issuer that did not answer. Defaults to `false`.
   *
   * A shopper who could have authenticated and did not is refused either way:
   * that is a failed challenge, not a missing one. This decides the other case,
   * where 3DS was simply not possible: by default the payment goes ahead with
   * the merchant carrying the risk, which is Braintree's own default.
   */
  requireLiabilityShift?: boolean
  /**
   * Shown until the fields have painted, in place of `<PaymentSetting>`'s
   * `loader` for this setting. Braintree's placeholder is this form's alone:
   * `<PaymentSettingBraintreePayPal>` and `<PaymentSettingBraintreeApplePay>`
   * belong to the same setting, and three placeholders for one wait would be
   * two too many.
   */
  loader?: LoaderType
}

type VerifyCardOptions = ThreeDSecureVerifyOptions & {
  onLookupComplete: (data: unknown, next: () => void) => void
}

const DEFAULT_STYLES: Record<string, Record<string, string>> = {
  input: { "font-size": "16px" },
}

const DEFAULT_FIELDS: Record<
  PaymentSettingBraintreeFieldName,
  PaymentSettingBraintreeFieldOptions
> = {
  cardholderName: { label: "Cardholder name", placeholder: "Name on card" },
  number: { label: "Card number", placeholder: "4111 1111 1111 1111" },
  expirationDate: { label: "Expiration date", placeholder: "MM/YY" },
  cvv: { label: "CVV", placeholder: "123" },
}

/**
 * Tokenize errors that mean the shopper has not finished typing, rather than
 * that anything went wrong.
 */
const UNFINISHED_FORM_CODES = ["HOSTED_FIELDS_FIELDS_EMPTY", "HOSTED_FIELDS_FIELDS_INVALID"]

/**
 * Braintree's Hosted Fields for an order on the `payment_sessions` model, with
 * 3D Secure.
 *
 * Mounted inside `<PaymentSetting>`, which renders it once per available
 * setting; this returns `null` for every setting that is not Braintree's, so a
 * checkout mounts it once and does not branch.
 *
 * **`<PlaceOrderButton>` is the pay button**, exactly as with the other card
 * gateways: this registers a **host collection** on the Payment Gateway
 * Handoff, so the privacy-and-terms gate stays in front of the payment and the
 * gift cards are charged before it.
 *
 * What differs is where the money moves. Braintree's browser SDK only turns the
 * card into a nonce — after 3DS, which runs in Braintree's own modal — and the
 * charge happens when Commerce Layer relays that nonce to Braintree, inside the
 * Payment Authorization. So collecting here means tokenize, authenticate, hand
 * the nonce over and wait for the authorization's verdict, and the outcome the
 * button gets is settled: there is no webhook to wait for and no redirect to
 * return from.
 *
 * `braintree-web` is loaded with a dynamic `import()`, so it stays out of every
 * checkout that never offers Braintree.
 */
export function PaymentSettingBraintreePayment(props: Props): JSX.Element | null {
  const { children } = props
  const { setting, currentPaymentSession, isSelected, isPending, readonly, renewPaymentSession } =
    useContext(PaymentSettingChildrenContext)
  const loader = usePaymentSettingLoader(props.loader)

  const isBraintree = setting?.type === BRAINTREE_SETTING_TYPE
  const clientToken = useStickySessionValue(currentPaymentSession, readBraintreeClientToken)

  /**
   * Whether a session has already been renewed because its client token was
   * refused.
   *
   * Once per mount, not once per session: every renewal *is* a new session, so
   * a per-session allowance would renew forever on a merchant account that
   * refuses every token. A refusal on the fresh session is not an expiry, and
   * is reported instead. Kept here rather than in the form, which is keyed on
   * the token and remounts with every new session, so it would forget.
   */
  const hasRenewed = useRef(false)

  /**
   * Only the selected setting's form is live.
   *
   * `<PaymentSetting>` renders its children once per setting, so without this
   * every Braintree form on the page would register a collection and the
   * place-order button would believe Braintree is collecting for an order
   * paying by bank transfer. That mistake shipped once on the Adyen path.
   */
  const shouldMount = isBraintree && isSelected === true && readonly !== true

  if (!isBraintree) return null
  if (!shouldMount || clientToken == null || currentPaymentSession == null) {
    // The Payment Session is being created for this setting: the first half
    // of the wait, before there is a client token to boot from.
    const placeholder = isPending === true && readonly !== true ? loader : null
    // No form to show, but `children` still gets to render its chrome — a recap
    // line, or the reason a session without a client token shows nothing.
    return (
      <>
        {placeholder}
        {children != null ? (
          <Parent
            {...{ ...props, isLoaded: false, isReady: false, isSubmitting: false, errors: [] }}
          >
            {children}
          </Parent>
        ) : null}
      </>
    )
  }

  /**
   * Ask for a fresh session, once. The renewal under way, or `null` when the
   * one allowed has been spent.
   */
  const onClientTokenRefused = (): Promise<void> | null => {
    if (renewPaymentSession == null || hasRenewed.current) return null
    hasRenewed.current = true
    return renewPaymentSession()
  }

  return (
    // Keyed on the token: Braintree is booted from it once, so a session
    // replaced after a refusal — or renewed after an expiry — needs a new
    // client, new fields and a new 3DS instance, not the old ones rewired.
    <BraintreeForm
      key={clientToken}
      {...props}
      loader={loader}
      clientToken={clientToken}
      session={currentPaymentSession}
      onClientTokenRefused={onClientTokenRefused}
    />
  )
}

interface BraintreeInstances {
  client: Client
  hostedFields: HostedFields
  threeDSecure: ThreeDSecure | null
}

/** The half that owns Braintree's instances, booted from one client token. */
function BraintreeForm({
  children,
  fields,
  styles,
  containerClassName,
  classNames,
  threeDSecure: withThreeDSecure = true,
  requireLiabilityShift = false,
  clientToken,
  session,
  onClientTokenRefused,
  loader,
}: Omit<Props, "loader"> & {
  loader: JSX.Element | null
  clientToken: string
  session: PaymentSession
  onClientTokenRefused: () => Promise<void> | null
}): JSX.Element {
  const { order } = useContext(OrderContext)
  const { accessToken, interceptors } = useContext(CommerceLayerContext)
  const idPrefix = useId()

  const [isLoaded, setIsLoaded] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<BaseError[]>([])
  const [lastErrorCode, setLastErrorCode] = useState<string | undefined>(undefined)

  const instancesRef = useRef<BraintreeInstances | null>(null)
  const containerRefs = useRef<Partial<Record<PaymentSettingBraintreeFieldName, HTMLDivElement>>>(
    {}
  )

  const orderId = order?.id
  const fieldNames = renderedFields(fields)
  const fieldOptions = (
    name: PaymentSettingBraintreeFieldName
  ): PaymentSettingBraintreeFieldOptions => ({
    ...DEFAULT_FIELDS[name],
    ...fields?.[name],
  })

  const fail = (code: string, message: string): void => {
    setLastErrorCode(code)
    setErrors([gatewayError(message, code)])
  }

  // The current values, for callbacks registered once and called much later.
  const latestRef = useRef({
    order,
    session,
    accessToken,
    interceptors,
    requireLiabilityShift,
    styles,
    onClientTokenRefused,
  })
  latestRef.current = {
    order,
    session,
    accessToken,
    interceptors,
    requireLiabilityShift,
    styles,
    onClientTokenRefused,
  }

  // Boot Braintree. Keyed on the token alone, through the component's `key`:
  // `fields` and `styles` are read once, because Hosted Fields cannot be
  // reconfigured in place, and an inline object prop would otherwise tear the
  // fields down on every render of the parent — and the card with them.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    let cancelled = false
    let booted: BraintreeInstances | null = null

    void (async () => {
      const [clientModule, hostedFieldsModule, threeDSecureModule] = (
        await Promise.all([
          import("braintree-web/client"),
          import("braintree-web/hosted-fields"),
          withThreeDSecure ? import("braintree-web/three-d-secure") : Promise.resolve(null),
        ])
      ).map(interopDefault)
      if (cancelled) return

      let client: Client
      try {
        client = await clientModule.create({ authorization: clientToken })
      } catch (error) {
        if (cancelled) return
        // The client token is refused, most often because it has expired: it
        // lives for a day, the session that carries it for two, and nothing
        // regenerates it. A fresh session brings a fresh token, and this form
        // remounts on it — so a form still standing once the renewal is over
        // means none arrived, and the shopper has to be told something.
        const renewal = latestRef.current.onClientTokenRefused()
        if (renewal != null) {
          await renewal.catch(() => {})
          if (cancelled) return
        }
        fail(
          braintreeErrorCode(error) ?? "CLIENT_TOKEN_REFUSED",
          "The card form could not be loaded."
        )
        return
      }

      const current = latestRef.current
      const containers = containerRefs.current
      const hostedFieldsFields = Object.fromEntries(
        fieldNames.map((name) => {
          const { label: _label, ...options } = fieldOptions(name)
          return [name, { ...options, container: containers[name] }]
        })
      )

      try {
        const [hostedFields, threeDSecure] = await Promise.all([
          hostedFieldsModule.create({
            client,
            fields: hostedFieldsFields,
            styles: current.styles ?? DEFAULT_STYLES,
          }) as Promise<HostedFields>,
          // The page's instance, not one of this form's own: Cardinal sets up
          // once per page, so a form replacing another could never set up a
          // second one. See `pageThreeDSecureInstance`.
          threeDSecureModule != null
            ? pageThreeDSecureInstance(
                () => threeDSecureModule.create({ client, version: 2 }) as Promise<ThreeDSecure>
              )
            : Promise.resolve(null),
        ])
        booted = { client, hostedFields, threeDSecure }
        if (cancelled) {
          teardown(booted)
          return
        }
        instancesRef.current = booted

        hostedFields.on("validityChange", (event: HostedFieldsEvent) => {
          const complete = Object.values(event.fields).every((field) => field.isValid)
          setIsReady(complete)
          setCollectionReady(latestRef.current.order?.id, complete)
        })
        setIsLoaded(true)
      } catch (error) {
        if (cancelled) return
        fail(braintreeErrorCode(error) ?? "SETUP_FAILED", "The card form could not be loaded.")
      }
    })()

    return () => {
      cancelled = true
      instancesRef.current = null
      if (booted != null) teardown(booted)
    }
  }, [])

  // Registered once per order: everything `submit` reads comes from refs, so
  // re-registering on every validity change would only churn the handoff.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    return registerHostCollection(orderId, async (): Promise<PaymentGatewaySubmitResult> => {
      const instances = instancesRef.current
      const current = latestRef.current
      if (instances == null || current.accessToken == null) return { status: "incomplete" }

      setErrors([])
      setLastErrorCode(undefined)

      let card: HostedFieldsTokenizePayload
      try {
        card = await instances.hostedFields.tokenize()
      } catch (error) {
        const code = braintreeErrorCode(error) ?? "TOKENIZATION_FAILED"
        if (UNFINISHED_FORM_CODES.includes(code)) {
          // Not a failure to report, but the fields show nothing until each
          // one has been left once — an untouched form stays blank. So the
          // reason is given here, where the application can render it.
          fail(code, "Complete the card details.")
          return { status: "incomplete" }
        }
        // Nothing has reached Commerce Layer, let alone Braintree's
        // processor: a verdict, and the shopper may try again.
        fail(code, "The card could not be read.")
        return { status: "failed", code }
      }

      setIsSubmitting(true)
      // From here the shopper is in Braintree's hands — a 3DS challenge, then
      // the authorization — and the Payment Session records none of it until
      // the money has moved. Nothing may delete that session in the meantime.
      setCollecting(orderId, true)
      try {
        let nonce = card.nonce

        if (instances.threeDSecure != null) {
          let verified: ThreeDSecureVerifyPayload
          try {
            const options: VerifyCardOptions = {
              nonce: card.nonce,
              bin: card.details.bin,
              amount: sessionAmount(current.session),
              // Both optional, and both raise the share of shoppers who
              // authenticate without a challenge.
              email: current.order?.customer_email ?? undefined,
              billingAddress: threeDSecureBillingAddress(current.order),
              collectDeviceData: true,
              // Required by 3DS v2, which pauses after the issuer lookup until
              // this calls `next` — and missing from the typings.
              onLookupComplete: (_data, next) => {
                next()
              },
            }
            // The typings declare the promise-returning overload as `void`.
            verified = await (instances.threeDSecure.verifyCard(
              options
            ) as unknown as Promise<ThreeDSecureVerifyPayload>)
          } catch (error) {
            const code = braintreeErrorCode(error) ?? "THREEDS_FAILED"
            fail(code, "The card could not be authenticated.")
            return { status: "failed", code }
          }

          const refusal = liabilityRefusal(verified, current.requireLiabilityShift)
          if (refusal != null) {
            fail(refusal, "The card could not be authenticated.")
            return { status: "failed", code: refusal }
          }
          nonce = verified.nonce
        }

        const result = await authorizeBraintreePaymentSession({
          accessToken: current.accessToken,
          interceptors: current.interceptors,
          paymentSessionId: current.session.id,
          nonce,
        })

        if (result.status === "authorized") return { status: "completed" }
        if (result.status === "refused") {
          fail(result.code, "The payment was declined.")
          return { status: "failed", code: result.code }
        }
        fail(result.code, "The payment could not be confirmed.")
        return { status: "unknown", code: result.code }
      } catch (error) {
        // Thrown from somewhere none of the branches above expected. The nonce
        // may already be with Commerce Layer, so this cannot be a verdict.
        const code = braintreeErrorCode(error) ?? "unknown"
        fail(code, "The payment could not be confirmed.")
        return { status: "unknown", code }
      } finally {
        setIsSubmitting(false)
        setCollecting(orderId, false)
      }
    })
  }, [orderId])

  const parentProps = { isLoaded, isReady, isSubmitting, lastErrorCode, errors }

  const field = (name: PaymentSettingBraintreeFieldName): JSX.Element => {
    const { label } = fieldOptions(name)
    const id = `${idPrefix}-${name}`
    return (
      <div key={name} className={classNames?.field}>
        {/* Braintree focuses the field when a label points at its container. */}
        <label className={classNames?.label} htmlFor={id}>
          {label}
        </label>
        <div
          id={id}
          className={classNames?.input}
          ref={(element) => {
            if (element != null) containerRefs.current[name] = element
          }}
        />
      </div>
    )
  }

  return (
    <>
      {/* Beside the fields, never instead of them: Hosted Fields mounts its
          iframes into these containers, so they have to be in the DOM. Stops
          on a boot that failed — a renewal still under way keeps it up, since
          a new form follows — because no fields are coming after that. */}
      {!isLoaded && errors.length === 0 ? loader : null}
      <div className={containerClassName}>
        {fieldNames.includes("cardholderName") ? field("cardholderName") : null}
        {field("number")}
        <div className={classNames?.cardDetails}>
          {field("expirationDate")}
          {field("cvv")}
        </div>
      </div>
      {children != null ? <Parent {...parentProps}>{children}</Parent> : null}
    </>
  )
}

/** The fields to render: the three a card needs, and the name when asked for. */
function renderedFields(fields: Props["fields"]): PaymentSettingBraintreeFieldName[] {
  const names: PaymentSettingBraintreeFieldName[] = ["number", "expirationDate", "cvv"]
  return fields?.cardholderName != null ? ["cardholderName", ...names] : names
}

/**
 * Best effort: a torn-down page has nothing left to report a failure to.
 *
 * The fields only. 3DS is the page's, and tearing it down would strip
 * Cardinal's listeners for good — the next form could not set them up again.
 */
function teardown({ hostedFields }: BraintreeInstances): void {
  // `teardown()` returns a promise when given no callback, which the typings
  // do not say; wrapped so a rejection is caught either way.
  Promise.resolve()
    .then(() => hostedFields.teardown())
    .catch(() => {})
}

/**
 * Why the 3DS outcome refuses the payment, or `undefined` when it does not.
 *
 * Commerce Layer authorizes a nonce whatever its 3DS outcome — it sends no 3DS
 * parameter and checks no liability shift — so this is the only place the
 * outcome is enforced.
 */
function liabilityRefusal(
  verified: ThreeDSecureVerifyPayload,
  requireLiabilityShift: boolean
): string | undefined {
  const info = verified.threeDSecureInfo
  if (info.liabilityShifted) return undefined
  // Possible and not shifted: the shopper failed or abandoned the challenge.
  if (info.liabilityShiftPossible || requireLiabilityShift) {
    return (info as { status?: string }).status ?? "liability_not_shifted"
  }
  return undefined
}

/** The order's billing address, as 3DS names its parts. */
function threeDSecureBillingAddress(order?: Order | null): ThreeDSecureBillingAddress | undefined {
  const address: Address | null | undefined = order?.billing_address
  if (address == null) return undefined
  return {
    givenName: address.first_name ?? undefined,
    surname: address.last_name ?? undefined,
    phoneNumber: address.phone ?? undefined,
    streetAddress: address.line_1 ?? undefined,
    extendedAddress: address.line_2 ?? undefined,
    locality: address.city ?? undefined,
    region: address.state_code ?? undefined,
    postalCode: address.zip_code ?? undefined,
    countryCodeAlpha2: address.country_code ?? undefined,
  }
}

/**
 * A refusal carrying the gateway's own code, tagged `orders`.
 *
 * `<Errors>` matches on `resource`, and the place-order button writes what it
 * gets from the handoff into the order's error state — so anything else here
 * vanishes from the only outlet consumers mount.
 */
function gatewayError(message: string, code: string): BaseError {
  return {
    code: "VALIDATION_ERROR",
    resource: "orders",
    message,
    meta: { error: code },
  }
}

export default PaymentSettingBraintreePayment

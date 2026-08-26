import { type JSX, useContext } from "react"
import Parent from "#components/utils/Parent"
import PaymentSettingGiftCardContext from "#context/PaymentSettingGiftCardContext"
import type { BaseError } from "#typings/errors"
import type { ChildrenFunction } from "#typings/index"

interface ChildrenProps extends Omit<Props, "children"> {
  errors: BaseError[]
}

interface Props extends Omit<JSX.IntrinsicElements["div"], "children"> {
  children?: ChildrenFunction<ChildrenProps>
}

/**
 * Why applying or removing a gift card failed.
 *
 * Needed as a component of its own because these errors are **not** on the
 * order: applying a card that does not exist is rejected before anything is
 * written, so `<Errors resource="orders">` never sees them and the shopper gets
 * a control that silently does nothing. Same reasoning as the `errors` render
 * prop on `<PaymentSettingManualPayment>`, one family of errors up.
 *
 * The API collapses four causes — unknown code, expired, empty, bound to
 * another market — into one message, so `code` is always
 * `INVALID_FIELD_VALUE`. A translated consumer keys off that and writes its own
 * text; one that wants the API's wording renders `message`.
 *
 * Renders nothing when there is nothing to report.
 */
export function PaymentSettingGiftCardErrors(props: Props): JSX.Element | null {
  const { children, ...p } = props
  const { errors } = useContext(PaymentSettingGiftCardContext)
  const giftCardErrors = errors ?? []

  if (giftCardErrors.length === 0) return null

  const parentProps = { ...props, errors: giftCardErrors }

  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <div {...p}>
      {giftCardErrors.map((error, index) => (
        <span
          key={`${error.code}-${
             index
          }`}
        >
          {error.message}
        </span>
      ))}
    </div>
  )
}

export default PaymentSettingGiftCardErrors

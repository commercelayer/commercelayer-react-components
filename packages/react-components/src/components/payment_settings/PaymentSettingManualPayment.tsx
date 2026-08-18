import type { PaymentSession } from "@commercelayer/sdk"
import type { JSX, ReactNode } from "react"
import Parent from "#components/utils/Parent"
import PaymentSettingChildrenContext from "#context/PaymentSettingChildrenContext"
import type { BaseError } from "#typings/errors"
import type { ChildrenFunction } from "#typings/index"
import useCustomContext from "#utils/hooks/useCustomContext"

interface ChildrenProps extends Omit<Props, "children"> {
  /** Whether this setting is the shopper's current choice. */
  isSelected: boolean
  /** Whether the Payment Session is being created right now. */
  isPending: boolean
  /**
   * The Payment Session backing the selection, once it exists. Carries
   * `formatted_amount` and `expires_at` for display.
   */
  currentPaymentSession?: PaymentSession
  errors: BaseError[]
}

interface Props {
  children?: ChildrenFunction<ChildrenProps>
  /**
   * Rendered when this setting is selected — payment instructions, for
   * example the bank details for a wire transfer.
   */
  instructions?: ReactNode
}

/**
 * The manual Payment Setting (`payment_setting_manuals`): paying out of band,
 * for instance by bank transfer.
 *
 * There is no gateway UI and nothing to collect, so selecting the setting is
 * the whole interaction — the Payment Session created by `<PaymentSetting>` is
 * all the API needs. Taking the money happens later, at place time, when the
 * Payment Authorization is created: that keeps selection reversible, so a
 * shopper changing their mind costs nothing.
 *
 * Renders `null` unless its setting is selected, so it can be dropped inside
 * `<PaymentSetting>` alongside other settings' components.
 */
export function PaymentSettingManualPayment(props: Props): JSX.Element | null {
  const { children, instructions } = props
  const { setting, currentPaymentSession, isSelected, isPending, errors } = useCustomContext({
    context: PaymentSettingChildrenContext,
    contextComponentName: "PaymentSetting",
    currentComponentName: "PaymentSettingManualPayment",
    key: "setting",
  })

  if (setting?.type !== "payment_setting_manuals") return null

  const parentProps = {
    ...props,
    isSelected: isSelected === true,
    isPending: isPending === true,
    currentPaymentSession,
    errors: errors ?? [],
  }

  if (children) return <Parent {...parentProps}>{children}</Parent>
  if (isSelected !== true) return null
  return <>{instructions}</>
}

export default PaymentSettingManualPayment

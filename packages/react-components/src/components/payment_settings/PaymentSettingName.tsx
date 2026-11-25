import type { JSX } from "react"
import Parent from "#components/utils/Parent"
import PaymentSettingChildrenContext from "#context/PaymentSettingChildrenContext"
import type { ChildrenFunction } from "#typings/index"
import useCustomContext from "#utils/hooks/useCustomContext"

interface ChildrenProps extends Omit<Props, "children"> {
  labelName: string
}

interface Props extends Omit<JSX.IntrinsicElements["label"], "children"> {
  children?: ChildrenFunction<ChildrenProps>
}

/** Fallback labels for settings an organization has not named. */
const DEFAULT_LABELS: Record<string, string> = {
  payment_setting_adyens: "Adyen",
  payment_setting_braintrees: "Braintree",
  payment_setting_externals: "External",
  payment_setting_gift_cards: "Gift card",
  payment_setting_manuals: "Manual payment",
  payment_setting_stripes: "Stripe",
}

export function PaymentSettingName(props: Props): JSX.Element {
  const { setting } = useCustomContext({
    context: PaymentSettingChildrenContext,
    contextComponentName: "PaymentSetting",
    currentComponentName: "PaymentSettingName",
    key: "setting",
  })
  // `name` is optional on every payment setting type, so fall back to the
  // resource type rather than rendering an unlabelled radio.
  const labelName = setting?.name ?? DEFAULT_LABELS[setting?.type ?? ""] ?? setting?.type ?? ""
  const htmlFor = setting?.id
  const parentProps = { htmlFor, labelName, ...props }

  return props.children ? (
    <Parent {...parentProps}>{props.children}</Parent>
  ) : (
    <label htmlFor={htmlFor} {...props}>
      {labelName}
    </label>
  )
}

export default PaymentSettingName

import type { ChangeEvent, JSX } from "react"
import Parent from "#components/utils/Parent"
import PaymentSettingChildrenContext from "#context/PaymentSettingChildrenContext"
import type { ChildrenFunction } from "#typings/index"
import useCustomContext from "#utils/hooks/useCustomContext"

interface ChildrenProps extends Omit<Props, "children"> {
  checked: boolean
  handleOnChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
}

type Props = {
  children?: ChildrenFunction<ChildrenProps>
} & JSX.IntrinsicElements["input"]

/**
 * Radio button selecting the Payment Setting of the surrounding
 * `<PaymentSetting>`.
 *
 * `checked` is derived from the order, never from local state: the selection
 * *is* the Payment Session, so what the shopper sees always reflects what the
 * API stored. The cost is that the radio does not light up on click — it lights
 * up once the session exists. `disabled` covers that round trip.
 */
export function PaymentSettingRadioButton(props: Props): JSX.Element | null {
  const { children, ...p } = props
  const { setting, isSelected, isPending, selectSetting, readonly } = useCustomContext({
    context: PaymentSettingChildrenContext,
    contextComponentName: "PaymentSetting",
    currentComponentName: "PaymentSettingRadioButton",
    key: "setting",
  })

  // A recap has nothing to pick, and a disabled checked radio reads as a broken
  // control rather than a statement. The setting's name is the recap.
  if (readonly === true) return null

  const checked = isSelected === true
  const id = setting?.id

  const handleOnChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    event.stopPropagation()
    if (checked || isPending === true) return
    await selectSetting?.()
  }

  const parentProps = { handleOnChange, checked, id, disabled: isPending, ...props }

  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <input
      type="radio"
      id={id}
      name={`payment-setting-${setting?.id ?? ""}`}
      checked={checked}
      disabled={isPending === true}
      onChange={(event) => {
        void handleOnChange(event)
      }}
      {...p}
    />
  )
}

export default PaymentSettingRadioButton

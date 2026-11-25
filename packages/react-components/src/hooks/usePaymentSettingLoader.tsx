import { type JSX, useContext } from "react"
import PaymentSettingChildrenContext from "#context/PaymentSettingChildrenContext"
import type { LoaderType } from "#typings"
import getLoaderComponent from "#utils/getLoaderComponent"

/**
 * The placeholder a payment setting component shows while its form is on its
 * way: its own `loader` when it was given one, `<PaymentSetting>`'s otherwise,
 * and `null` when neither was — so nothing changes for a checkout that passes
 * none.
 *
 * Only the element. *When* to show it is each gateway's to decide, because
 * only the gateway knows when its SDK has painted.
 */
export function usePaymentSettingLoader(loader?: LoaderType): JSX.Element | null {
  const { loader: shared } = useContext(PaymentSettingChildrenContext)
  const chosen = loader ?? shared
  return chosen != null ? getLoaderComponent(chosen) : null
}

export default usePaymentSettingLoader

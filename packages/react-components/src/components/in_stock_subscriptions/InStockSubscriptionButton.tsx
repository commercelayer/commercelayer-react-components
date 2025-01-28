import Parent from '#components/utils/Parent'
import CommerceLayerContext from '#context/CommerceLayerContext'
import InStockSubscriptionContext from '#context/InStockSubscriptionContext'
import type { ChildrenFunction } from '#typings/index'
import useCustomContext from '#utils/hooks/useCustomContext'
import { jwt } from '#utils/jwt'
import { useContext, useState, type JSX } from 'react';

interface Props
  extends Omit<JSX.IntrinsicElements['button'], 'children' | 'onClick'> {
  /**
   * The code of the sku.
   */
  skuCode: string
  /**
   * The label to display.
   */
  label?: string | JSX.Element
  /**
   * The label to display when the button is loading.
   */
  loadingLabel?: string | JSX.Element
  /**
   * The email of the customer.
   */
  customerEmail?: string
  /**
   * The children of the component.
   */
  children?: ChildrenFunction<Omit<Props, 'children'>>
  /**
   * Show the button.
   */
  show?: boolean
  /**
   * The callback function to call when the button is clicked.
   */
  onClick?: (response: { success: boolean }) => void
}

export function InStockSubscriptionButton({
  skuCode,
  customerEmail,
  children,
  onClick,
  show = false,
  label = 'Subscribe',
  loadingLabel = 'Loading...',
  ...props
}: Props): JSX.Element | null {
  const { setInStockSubscription } = useCustomContext({
    context: InStockSubscriptionContext,
    contextComponentName: 'InStockSubscriptionsContainer',
    currentComponentName: 'InStockSubscriptionButton',
    key: 'setInStockSubscription'
  })
  const { accessToken } = useContext(CommerceLayerContext)
  const [loading, setLoading] = useState(false)
  const handleClick = async (): Promise<void> => {
    if (accessToken != null && customerEmail == null) {
      const get = jwt(accessToken)
      if (get?.owner == null) {
        console.error('Missing customerEmail')
        return
      }
    }
    if (setInStockSubscription == null) {
      console.error('Missing <InStockSubscriptionsContainer>')
      return
    }
    setLoading(true)
    const res = await setInStockSubscription({
      customerEmail,
      skuCode
    })
    if (onClick != null) {
      onClick(res)
    }
    setLoading(false)
  }
  if (children != null) {
    const parentProps: Omit<Props, 'children'> = {
      skuCode,
      customerEmail,
      onClick,
      show,
      label,
      loadingLabel,
      ...props
    }
    return <Parent {...parentProps}>{children}</Parent>
  }
  return !show ? null : (
    <button
      onClick={() => {
        handleClick()
      }}
      disabled={loading}
      {...props}
    >
      {loading ? loadingLabel : label}
    </button>
  )
}

export default InStockSubscriptionButton

import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from 'react'
import Parent from './utils/Parent'
import components from '#config/components'
import { FunctionChildren } from '#typings/index'
import PlaceOrderContext from '#context/PlaceOrderContext'

const propTypes = components.PlaceOrderButton.propTypes
const defaultProps = components.PlaceOrderButton.defaultProps
const displayName = components.PlaceOrderButton.displayName

type PlaceOrderButtonChildrenProps = FunctionChildren<
  Omit<PlaceOrderButtonProps, 'children'>
>

type PlaceOrderButtonProps = {
  children?: PlaceOrderButtonChildrenProps
  label?: string
  onClick?: (response: { placed: boolean }) => void
} & JSX.IntrinsicElements['button']

const PlaceOrderButton: FunctionComponent<PlaceOrderButtonProps> = (props) => {
  const { children, label = 'Place order', disabled, onClick, ...p } = props
  const { isPermitted, setPlaceOrder } = useContext(PlaceOrderContext)
  const [notPermitted, setNotPermitted] = useState(true)
  const [forceDisable, setForceDisable] = useState(disabled)
  useEffect(() => {
    if (isPermitted) {
      setNotPermitted(false)
    } else setNotPermitted(true)
    return () => {
      setNotPermitted(true)
    }
  }, [isPermitted])
  const handleClick = async () => {
    setForceDisable(true)
    const placed = setPlaceOrder && (await setPlaceOrder())
    setForceDisable(false)
    onClick && placed && onClick(placed)
  }
  const disabledButton = disabled !== undefined ? disabled : notPermitted
  const parentProps = {
    ...p,
    label,
    disabled: disabledButton,
    handleClick,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button
      type="button"
      disabled={disabledButton || forceDisable}
      onClick={handleClick}
      {...p}
    >
      {label}
    </button>
  )
}

PlaceOrderButton.propTypes = propTypes
PlaceOrderButton.defaultProps = defaultProps
PlaceOrderButton.displayName = displayName

export default PlaceOrderButton

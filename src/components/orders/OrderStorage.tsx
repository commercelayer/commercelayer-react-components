import { ReactNode } from 'react'
import OrderStorageContext from '#context/OrderStorageContext'
import components from '#config/components'
import {
  getLocalOrder,
  setLocalOrder,
  deleteLocalOrder,
} from '#utils/localStorage'

const propTypes = components.OrderStorage.propTypes
const displayName = components.OrderStorage.displayName

type Props = {
  children: ReactNode
  persistKey: string
  clearWhenPlaced?: boolean
}

export function OrderStorage(props: Props) {
  const { children, clearWhenPlaced = true, ...p } = props
  return (
    <OrderStorageContext.Provider
      value={{
        ...p,
        setLocalOrder,
        getLocalOrder,
        deleteLocalOrder,
        clearWhenPlaced,
      }}
    >
      {children}
    </OrderStorageContext.Provider>
  )
}

OrderStorage.propTypes = propTypes
OrderStorage.displayName = displayName

export default OrderStorage

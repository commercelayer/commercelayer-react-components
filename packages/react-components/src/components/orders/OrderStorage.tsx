import { type ReactNode } from 'react'
import OrderStorageContext from '#context/OrderStorageContext'
import {
  getLocalOrder,
  setLocalOrder,
  deleteLocalOrder
} from '#utils/localStorage'

interface Props {
  children: ReactNode
  persistKey: string
  clearWhenPlaced?: boolean
}

export function OrderStorage(props: Props): JSX.Element {
  const { children, clearWhenPlaced = true, ...p } = props
  return (
    <OrderStorageContext.Provider
      value={{
        ...p,
        setLocalOrder,
        getLocalOrder,
        deleteLocalOrder,
        clearWhenPlaced
      }}
    >
      {children}
    </OrderStorageContext.Provider>
  )
}

export default OrderStorage

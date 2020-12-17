import React, { FunctionComponent, ReactNode } from 'react'
import OrderStorageContext from '../context/OrderStorageContext'
import components from '../config/components'
import {
  getLocalOrder,
  setLocalOrder,
  deleteLocalOrder,
} from '../utils/localStorage'

const propTypes = components.OrderStorage.propTypes
const displayName = components.OrderStorage.displayName

type OrderStorageProps = {
  children: ReactNode
  persistKey: string
  clearWhenPlaced?: boolean
}

const OrderStorage: FunctionComponent<OrderStorageProps> = (props) => {
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

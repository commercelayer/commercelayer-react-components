import React, { useContext, ReactNode, Fragment } from 'react'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import components from '#config/components'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'
import StockTransferChildrenContext from '#context/StockTransferChildrenContext'
import { StockTransfer as TStockTransfer } from '@commercelayer/sdk'

const propTypes = components.StockTransfer.propTypes
const displayName = components.StockTransfer.displayName

type StockTransferProps = {
  children: ReactNode
} & JSX.IntrinsicElements['p']

const StockTransfer: React.FunctionComponent<StockTransferProps> = (props) => {
  const { children } = props
  const { lineItem } = useContext(LineItemChildrenContext)
  const { stockTransfers } = useContext(ShipmentChildrenContext)
  const items = [
    ...(lineItem ? [lineItem] : []),
    ...(stockTransfers ? stockTransfers : []),
  ]
  const components = items
    ?.filter((stock) => stock.sku_code !== lineItem?.sku_code)
    .map((stockTransfer: TStockTransfer, k) => {
      const stockTransferProps = {
        stockTransfer: stockTransfer?.line_item,
      }
      return (
        <StockTransferChildrenContext.Provider
          key={k}
          value={stockTransferProps}
        >
          {children}
        </StockTransferChildrenContext.Provider>
      )
    })
  return <Fragment>{components}</Fragment>
}

StockTransfer.propTypes = propTypes
StockTransfer.displayName = displayName

export default StockTransfer

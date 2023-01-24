import { useContext } from 'react'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'
import StockTransferChildrenContext from '#context/StockTransferChildrenContext'
import { StockTransfer as TStockTransfer } from '@commercelayer/sdk'
import type { DefaultChildrenType } from '#typings/globals'

interface Props {
  children: DefaultChildrenType
}

export function StockTransfer(props: Props): JSX.Element {
  const { children } = props
  const { stockTransfers, lineItems } = useContext(ShipmentChildrenContext)
  const components = stockTransfers
    ?.filter((st) => !!lineItems?.find((l) => l.sku_code !== st.sku_code))
    .map((stockTransfer: TStockTransfer, k) => {
      const stockTransferProps = {
        stockTransfer:
          stockTransfer.type === 'line_items'
            ? stockTransfer
            : stockTransfer?.line_item
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
  return <>{components}</>
}

export default StockTransfer

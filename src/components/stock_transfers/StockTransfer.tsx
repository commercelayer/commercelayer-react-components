import { useContext, ReactNode } from 'react'
import components from '#config/components'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'
import StockTransferChildrenContext from '#context/StockTransferChildrenContext'
import { StockTransfer as TStockTransfer } from '@commercelayer/sdk'

const propTypes = components.StockTransfer.propTypes
const displayName = components.StockTransfer.displayName

type Props = {
  children: ReactNode
} & JSX.IntrinsicElements['p']

export function StockTransfer(props: Props) {
  const { children } = props
  const { stockTransfers, lineItems } = useContext(ShipmentChildrenContext)
  const components = stockTransfers
    ?.filter((st) => !!lineItems?.find((l) => l.sku_code !== st.sku_code))
    .map((stockTransfer: TStockTransfer, k) => {
      const stockTransferProps = {
        stockTransfer:
          stockTransfer.type === 'line_items'
            ? stockTransfer
            : stockTransfer?.line_item,
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

StockTransfer.propTypes = propTypes
StockTransfer.displayName = displayName

export default StockTransfer

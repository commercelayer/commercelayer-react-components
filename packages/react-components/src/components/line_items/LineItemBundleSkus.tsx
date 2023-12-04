import { useContext } from 'react'
import LineItemBundleChildrenContext from '#context/LineItemBundleChildrenContext'
import LineItemBundleSkuChildrenContext from '#context/LineItemBundleSkuChildrenContext'

interface Props {
  children: JSX.Element | JSX.Element[]
}

export function LineItemBundleSkus({ children }: Props): JSX.Element {
  const { lineItem, skuListItems } = useContext(LineItemBundleChildrenContext)
  const components = skuListItems?.map((skuListItem) => {
    const quantity =
      skuListItem?.quantity != null && lineItem?.quantity
        ? skuListItem?.quantity * lineItem?.quantity
        : 0
    const skuListProps = {
      skuListItem: {
        ...skuListItem,
        quantity
      }
    }
    return (
      <LineItemBundleSkuChildrenContext.Provider
        key={skuListItem.id}
        value={skuListProps}
      >
        {children}
      </LineItemBundleSkuChildrenContext.Provider>
    )
  })
  return <>{components}</>
}

export default LineItemBundleSkus

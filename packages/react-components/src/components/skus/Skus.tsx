import SkuChildrenContext from '#context/SkuChildrenContext'
import SkuContext from '#context/SkuContext'
import { type ReactNode, useContext, type JSX } from 'react';

interface Props {
  children: ReactNode
}

/**
 * The `Skus` components loop through the list of `skus` found in `SkusContainer` context and render the children filled with the proper sku value.
 * This means that the children will be rendered as many times as the number of skus found in the `skus` prop array
 * and there is no need to manually loop through them from your consumer app.
 *
 * <span title='Requirements' type='warning'>
 * Must be a child of the `<SkusContainer>` component.
 * </span>
 * <span title='Children' type='info'>
 * `<SkuField>`, `<AvailabilityContainer>`
 * </span>
 */
export function Skus<P extends Props>({ children }: P): JSX.Element {
  const { skus } = useContext(SkuContext)
  const components = skus?.map((sku, key) => {
    const value = { sku }
    return (
      <SkuChildrenContext.Provider key={key} value={value}>
        {children}
      </SkuChildrenContext.Provider>
    )
  })
  return <>{components}</>
}

export default Skus

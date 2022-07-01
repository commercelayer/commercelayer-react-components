import components from '#config/components'
import SkuChildrenContext from '#context/SkuChildrenContext'
import SkuContext from '#context/SkuContext'
import { ReactNode, useContext } from 'react'

type Props = {
  children: ReactNode
}

export function Skus<P extends Props>({ children }: P): JSX.Element {
  const { skus } = useContext(SkuContext)
  const components =
    skus &&
    skus.map((sku, key) => {
      const value = { sku }
      return (
        <SkuChildrenContext.Provider key={key} value={value}>
          {children}
        </SkuChildrenContext.Provider>
      )
    })
  return <>{components}</>
}

Skus.propTypes = components.Skus.propTypes

export default Skus

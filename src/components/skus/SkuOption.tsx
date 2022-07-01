import { FunctionComponent, Fragment, useContext, ReactNode } from 'react'
import SkuOptionChildrenContext from '#context/SkuOptionChildrenContext'
import SkuOptionsContext from '#context/SkuOptionsContext'
import components from '#config/components'

const propTypes = components.SkuOption.propTypes
const displayName = components.SkuOption.displayName

export type SkuOptionProps = {
  children: ReactNode
  id: string
}

const SkuOption: FunctionComponent<SkuOptionProps> = (props) => {
  const { id } = props
  const { skuOptions, skuCode } = useContext(SkuOptionsContext)
  const items =
    skuOptions &&
    skuOptions
      .filter((l) => l.id === id)
      .map((skuOption, k) => {
        return (
          <SkuOptionChildrenContext.Provider
            key={k}
            value={{ skuOption, skuCode: skuCode as string }}
          >
            {props.children}
          </SkuOptionChildrenContext.Provider>
        )
      })
  return <Fragment>{items}</Fragment>
}

SkuOption.propTypes = propTypes
SkuOption.displayName = displayName

export default SkuOption

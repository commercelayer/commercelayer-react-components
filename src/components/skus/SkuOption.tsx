import { Fragment, useContext } from 'react'
import SkuOptionChildrenContext from '#context/SkuOptionChildrenContext'
import SkuOptionsContext from '#context/SkuOptionsContext'

type Props = {
  children: JSX.Element
  id: string
}

export function SkuOption(props: Props) {
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

export default SkuOption

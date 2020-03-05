import React, { FunctionComponent, Fragment, useContext } from 'react'
import SkuOptionChildrenContext from '../context/SkuOptionChildrenContext'
import SkuOptionsContext from '../context/SkuOptionsContext'
import PropTypes, { InferProps } from 'prop-types'

const SOProps = {
  name: PropTypes.string.isRequired,
  children: PropTypes.node
}

export type SkuOptionProps = InferProps<typeof SOProps>

const SkuOption: FunctionComponent<SkuOptionProps> = props => {
  const { name } = props
  const { skuOptions, skuCode } = useContext(SkuOptionsContext)
  const items = skuOptions
    .filter(l => l.name === name)
    .map((skuOption, k) => {
      return (
        <SkuOptionChildrenContext.Provider
          key={k}
          value={{ skuOption, skuCode }}
        >
          {props.children}
        </SkuOptionChildrenContext.Provider>
      )
    })
  return <Fragment>{items}</Fragment>
}

SkuOption.propTypes = SOProps

export default SkuOption

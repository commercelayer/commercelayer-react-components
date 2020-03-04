import React, {
  FunctionComponent,
  Fragment,
  useContext,
  ReactNode
} from 'react'
import SkuOptionChildrenContext from '../context/SkuOptionChildrenContext'
import SkuOptionsContext from '../context/SkuOptionsContext'
import PropTypes from 'prop-types'

export interface SkuOptionProps {
  children?: ReactNode
  name: string
}

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

SkuOption.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.node
}

export default SkuOption

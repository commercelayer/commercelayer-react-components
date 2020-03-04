import React, {
  Fragment,
  useState,
  useEffect,
  FunctionComponent,
  useContext
} from 'react'
import _ from 'lodash'
import Parent from './utils/Parent'
import PriceContext from '../context/PriceContext'
import PropTypes from 'prop-types'
import { LoaderType } from '../reducers/PriceReducer'

export interface PriceProps {
  children?: FunctionComponent
  amountClassName?: string
  compareClassName?: string
  skuCode?: string
  showCompare?: boolean
}

export interface PriceTemplateProps extends PriceProps {
  formattedAmount: string
  formattedCompare: string
  loading?: boolean
  loader?: LoaderType
}

const PriceTemplate: FunctionComponent<PriceTemplateProps> = props =>
  props.loading ? (
    <Fragment>{props.loader || 'Loading...'}</Fragment>
  ) : (
    <Fragment>
      <span className={props.amountClassName}>{props.formattedAmount}</span>
      {props.showCompare && (
        <span className={props.compareClassName}>{props.formattedCompare}</span>
      )}
    </Fragment>
  )
const Price: FunctionComponent<PriceProps> = props => {
  const { children } = props
  const {
    prices,
    skuCode,
    loading,
    skuCodes,
    setSkuCodes,
    loader
  } = useContext(PriceContext)
  const [formattedAmount, setFormattedAmount] = useState('')
  const [formattedCompare, setFormattedCompare] = useState('')
  const [showCompare, setShowCompare] = useState(false)
  const sCode = skuCode || props.skuCode
  useEffect(() => {
    if (!_.isEmpty(prices) && prices[sCode]) {
      const amount = prices[sCode].formattedAmount
      const compare = prices[sCode].formattedCompareAtAmount
      if (prices[sCode].compareAtAmountCents > prices[sCode].amountCents) {
        setShowCompare(true)
      }
      setFormattedAmount(amount)
      setFormattedCompare(compare)
    } else {
      if (sCode && _.indexOf(skuCodes, sCode) === -1) {
        skuCodes.push(sCode)
        setSkuCodes(skuCodes)
      }
    }
    return (): void => {
      setFormattedAmount('')
      setFormattedCompare('')
      setShowCompare(false)
    }
  }, [prices])

  const parentProps = {
    showCompare,
    formattedAmount,
    formattedCompare,
    loading,
    loader,
    ...props
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <Fragment>
      <PriceTemplate
        showCompare={showCompare}
        formattedAmount={formattedAmount}
        formattedCompare={formattedCompare}
        loading={loading}
        loader={loader}
        {...props}
      />
    </Fragment>
  )
}

Price.propTypes = {
  children: PropTypes.func,
  amountClassName: PropTypes.string,
  compareClassName: PropTypes.string,
  skuCode: PropTypes.string,
  showCompare: PropTypes.bool
}

export default Price

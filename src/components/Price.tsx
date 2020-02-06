import React, {
  Fragment,
  useState,
  useEffect,
  FunctionComponent,
  useContext,
  ReactElement
} from 'react'
import _ from 'lodash'
import Parent from './utils/Parent'
import PriceContext from './context/PriceContext'

export interface PriceProps {
  children?: FunctionComponent
  amountClassName?: string
  compareClassName?: string
  skuCode?: string
  loader?: ReactElement
}

export interface PriceTemplateProps {
  formattedAmount: string
  formattedCompare: string
  showCompare: boolean
  amountClassName?: string
  compareClassName?: string
  loading?: boolean
  loader?: ReactElement
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
  const { prices, skuCode, loading, skuCodes, setSkuCodes } = useContext(
    PriceContext
  )
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
        {...props}
      />
    </Fragment>
  )
}

export default Price

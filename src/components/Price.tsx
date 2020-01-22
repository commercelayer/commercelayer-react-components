import {
  Fragment,
  useState,
  useEffect,
  ReactNode,
  FunctionComponent
} from 'react'
import _ from 'lodash'
import Parent from './utils/Parent'

export interface PriceProps {
  skuCode?: string
  prices?: object
  loading?: boolean
  children?: ReactNode
  amountClassName?: string
  compareClassName?: string
}

export interface PriceTemplateProps {
  formattedAmount: string
  formattedCompare: string
  showCompare: boolean
  amountClassName?: string
  compareClassName?: string
  loading?: boolean
}

const PriceTemplate: FunctionComponent<PriceTemplateProps> = props =>
  props.loading ? (
    <Fragment>{'Loading...'}</Fragment>
  ) : (
    <Fragment>
      <span className={props.amountClassName}>{props.formattedAmount}</span>
      {props.showCompare && (
        <span className={props.compareClassName}>{props.formattedCompare}</span>
      )}
    </Fragment>
  )

const Price: FunctionComponent<PriceProps> = props => {
  const { prices, skuCode, children } = props
  const [formattedAmount, setFormattedAmount] = useState('')
  const [formattedCompare, setFormattedCompare] = useState('')
  const [showCompare, setShowCompare] = useState(false)
  useEffect(() => {
    if (prices[skuCode]) {
      const amount = prices[skuCode].formattedAmount
      const compare = prices[skuCode].formattedCompareAtAmount
      if (prices[skuCode].compareAtAmountCents > prices[skuCode].amountCents) {
        setShowCompare(true)
      }
      setFormattedAmount(amount)
      setFormattedCompare(compare)
    }
    return () => {
      setFormattedAmount('')
      setFormattedCompare('')
      setShowCompare(false)
    }
  }, [prices])

  return children ? (
    <Parent {...props}>{children}</Parent>
  ) : (
    <Fragment>
      <PriceTemplate
        showCompare={showCompare}
        formattedAmount={formattedAmount}
        formattedCompare={formattedCompare}
        {...props}
      />
    </Fragment>
  )
}

export default Price

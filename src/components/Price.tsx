import { Fragment, useState, useEffect, ReactNode } from 'react'
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

const Price = (props: PriceProps) => {
  const {
    prices,
    loading,
    skuCode,
    children,
    amountClassName,
    compareClassName
  } = props
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
  const Template = () =>
    loading ? (
      <Fragment>{'Loading...'}</Fragment>
    ) : (
      <Fragment>
        <span className={amountClassName}>{formattedAmount}</span>
        {showCompare && (
          <span className={compareClassName}>{formattedCompare}</span>
        )}
      </Fragment>
    )
  return children ? (
    <Parent {...props}>{children}</Parent>
  ) : (
    <Fragment>
      <Template />
    </Fragment>
  )
}

export default Price

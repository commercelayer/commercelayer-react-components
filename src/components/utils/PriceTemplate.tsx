import React from 'react'
import { PriceProps } from '#components/prices/Price'

export type PTemplateProps = {
  formattedAmount?: string
  formattedCompare?: string
} & Omit<PriceProps, 'children'>

const PriceTemplate: React.FunctionComponent<PTemplateProps> = (props) => {
  const {
    showCompare,
    formattedCompare,
    compareClassName,
    className,
    formattedAmount,
    ...p
  } = props
  delete p?.['skuCode']
  return (
    <>
      <span className={className} {...p}>
        {formattedAmount}
      </span>
      {showCompare && (
        <span className={compareClassName || ''} {...p}>
          {formattedCompare}
        </span>
      )}
    </>
  )
}

export default PriceTemplate

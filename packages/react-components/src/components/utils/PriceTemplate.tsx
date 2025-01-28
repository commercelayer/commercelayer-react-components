import type { PriceProps } from '#components/prices/Price'

import type { JSX } from "react";

export type PTemplateProps = {
  formattedAmount?: string | null
  formattedCompare?: string | null
} & Omit<PriceProps, 'children'>

export function PriceTemplate(props: PTemplateProps): JSX.Element {
  const {
    showCompare,
    formattedCompare,
    compareClassName,
    className,
    formattedAmount,
    skuCode,
    ...p
  } = props
  return (
    <>
      <span data-testid={`price-${skuCode ?? ''}`} className={className} {...p}>
        {formattedAmount}
      </span>
      {showCompare && (
        <span
          data-testid={`compare-${skuCode ?? ''}`}
          className={compareClassName || ''}
          {...p}
        >
          {formattedCompare}
        </span>
      )}
    </>
  )
}

export default PriceTemplate

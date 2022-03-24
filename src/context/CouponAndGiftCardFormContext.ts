import { OrderCodeType } from '#reducers/OrderReducer'
import { createContext, RefObject } from 'react'

type DefaultContext = {
  validation?: () => RefObject<any>
  setValue?: (name: string, value: string) => void
  codeType?: OrderCodeType
}

const CouponAndGiftCardFormContext = createContext<DefaultContext>({})

export default CouponAndGiftCardFormContext

import { OrderCodeType } from '#reducers/OrderReducer'
import { createContext } from 'react'

type DefaultContext = {
  validation?: void
  setValue?: (name: string, value: string) => void
  codeType?: OrderCodeType
}

const CouponAndGiftCardFormContext = createContext<DefaultContext>({})

export default CouponAndGiftCardFormContext

import type { OrderCodeType } from '#reducers/OrderReducer'
import { createContext } from 'react'

interface DefaultContext {
  // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
    validation?: void
  setValue?: (name: string, value: string) => void
  codeType?: OrderCodeType
}

const CouponAndGiftCardFormContext = createContext<DefaultContext>({})

export default CouponAndGiftCardFormContext

import { OrderCodeType } from '#reducers/OrderReducer'
import { createContext } from 'react'

interface DefaultContext {
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  validation?: void
  setValue?: (name: string, value: string) => void
  codeType?: OrderCodeType
}

const CouponAndGiftCardFormContext = createContext<DefaultContext>({})

export default CouponAndGiftCardFormContext

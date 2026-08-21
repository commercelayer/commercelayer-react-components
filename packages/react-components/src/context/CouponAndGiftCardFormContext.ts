import { createContext } from "react"
import type { OrderCodeType } from "#reducers/OrderReducer"

interface DefaultContext {
  setValue?: (name: string, value: string) => void
  codeType?: OrderCodeType
}

const CouponAndGiftCardFormContext = createContext<DefaultContext>({})

export default CouponAndGiftCardFormContext

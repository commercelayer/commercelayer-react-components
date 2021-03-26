import { createContext, RefObject } from 'react'

type DefaultContext = {
  validation?: () => RefObject<any>
  setValue?: (name: string, value: string) => void
}

const CouponAndGiftCardFormContext = createContext<DefaultContext>({})

export default CouponAndGiftCardFormContext

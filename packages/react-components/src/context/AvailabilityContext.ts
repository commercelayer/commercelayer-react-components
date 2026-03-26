import type { DeliveryLeadTime, LeadTimes } from "@commercelayer/core"
import { createContext } from "react"

export interface AvailabilityContextType {
  skuCode?: string
  quantity?: number
  min?: LeadTimes
  max?: LeadTimes
  shipping_method?: DeliveryLeadTime["shipping_method"]
  parent?: boolean
}

const AvailabilityContext = createContext<AvailabilityContextType>({})

export default AvailabilityContext

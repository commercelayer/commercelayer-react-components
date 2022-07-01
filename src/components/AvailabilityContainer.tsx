import { useContext, useReducer, useEffect, ReactNode } from 'react'
import availabilityReducer, {
  availabilityInitialState,
  getAvailability,
  getAvailabilityByIds,
} from '#reducers/AvailabilityReducer'
import AvailabilityContext from '#context/AvailabilityContext'
import ItemContext from '#context/ItemContext'
import getCurrentItemKey from '#utils/getCurrentItemKey'
import components from '#config/components'
import CommerceLayerContext from '#context/CommerceLayerContext'
import LineItemChildrenContext from '#context/LineItemChildrenContext'
import SkuChildrenContext from '#context/SkuChildrenContext'
import SkuContext from '#context/SkuContext'
import isEqual from 'lodash/isEqual'

const propTypes = components.AvailabilityContainer.propTypes
const displayName = components.AvailabilityContainer.displayName

type Props = {
  children: ReactNode
  skuCode?: string
}

export function AvailabilityContainer(props: Props) {
  const { children, skuCode } = props
  const { item, skuCode: itemSkuCode, setItem } = useContext(ItemContext)
  const { lineItem } = useContext(LineItemChildrenContext)
  const { sku } = useContext(SkuChildrenContext)
  const { skus } = useContext(SkuContext)
  const config = useContext(CommerceLayerContext)
  const [state, dispatch] = useReducer(
    availabilityReducer,
    availabilityInitialState
  )
  const sCode =
    skuCode ||
    getCurrentItemKey(item) ||
    itemSkuCode ||
    lineItem?.sku_code ||
    sku?.code
  useEffect(() => {
    if (sCode && !skus) {
      const available = item[sCode]?.inventory?.available
      const quantity = item[sCode]?.inventory?.quantity
      const [level] = item[sCode]?.inventory?.levels || [
        {
          quantity: null,
          delivery_lead_times: [],
        },
      ]
      if (level !== undefined && level?.delivery_lead_times?.length > 0) {
        const [delivery] = level.delivery_lead_times
        dispatch({
          type: 'setAvailability',
          payload: { ...delivery, quantity: level?.quantity },
        })
      } else if (config.accessToken && !item?.[sCode]) {
        getAvailability({ skuCode: sCode, config, dispatch, setItem, item })
      } else if (!available) {
        dispatch({
          type: 'setAvailability',
          payload: { quantity },
        })
      }
    } else if (skus && config.accessToken) {
      const itemKeys = Object.keys(item)
      const skuCodes = skus.map((s) => s?.code)
      if (!isEqual(skuCodes, itemKeys)) {
        const skusIds = skus.map((s) => s.id)
        getAvailabilityByIds({ skusIds, config, dispatch, setItem })
      }
    }

    return (): void => {
      dispatch({
        type: 'setAvailability',
        payload: {},
      })
    }
  }, [config.accessToken, item, sCode, skus])
  return (
    <AvailabilityContext.Provider value={{ ...state }}>
      {children}
    </AvailabilityContext.Provider>
  )
}

AvailabilityContainer.propTypes = propTypes
AvailabilityContainer.displayName = displayName

export default AvailabilityContainer

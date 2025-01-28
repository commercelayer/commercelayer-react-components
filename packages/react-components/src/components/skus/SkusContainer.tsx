import CommerceLayerContext from '#context/CommerceLayerContext'
import SkuContext from '#context/SkuContext'
import skuReducer, { getSku, skuInitialState } from '#reducers/SkuReducer'
import type { QueryParamsList } from '@commercelayer/sdk'
import { type ReactNode, useContext, useEffect, useMemo, useReducer, type JSX } from 'react';

interface Props {
  /**
   * An array of skus to display.
   */
  skus: string[]
  /**
   * Accept a React node and [Skus](./Skus.d.ts) component as children to display above the skus.
   */
  children: ReactNode
  /**
   * An object params to query the skus resource
   */
  queryParams?: QueryParamsList
}

/**
 * Main container for the SKUs components.
 * It stores - in its context - the details for each `sku` defined in the `skus` prop array.
 *
 * It also accept a `queryParams` prop to refine pagination, sorting, filtering and includes for the fetch request.
 *
 * <span title='Requirements' type='warning'>
 * Must be a child of the `<CommerceLayer>` component.
 * </span>
 * <span title='Children' type='info'>
 * `<Skus>`
 * </span>
 */
export function SkusContainer<P extends Props>(props: P): JSX.Element {
  const { skus, children, queryParams } = props
  const [state, dispatch] = useReducer(skuReducer, skuInitialState)
  const config = useContext(CommerceLayerContext)
  const loadSkus = async (): Promise<void> => {
    await getSku({ config, dispatch, skus, queryParams })
  }
  useEffect(() => {
    if (config.accessToken && state?.skus) {
      if (state?.skus.length === 0) {
        loadSkus()
      }
    }
    return () => {
      dispatch({
        type: 'setLoading',
        payload: {
          loading: true
        }
      })
    }
  }, [config, skus])
  const contextValue = useMemo(() => state, [state])
  return (
    <SkuContext.Provider value={contextValue}>{children}</SkuContext.Provider>
  )
}

export default SkusContainer

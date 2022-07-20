import components from '#config/components'
import CommerceLayerContext from '#context/CommerceLayerContext'
import SkuContext from '#context/SkuContext'
import skuReducer, { getSku, skuInitialState } from '#reducers/SkuReducer'
import { QueryParamsList } from '@commercelayer/sdk'
import { ReactNode, useContext, useEffect, useMemo, useReducer } from 'react'

type Props = {
  skus: string[]
  children: ReactNode
  queryParams?: QueryParamsList
}

export default function SkusContainer<P extends Props>(props: P): JSX.Element {
  const { skus, children, queryParams } = props
  const [state, dispatch] = useReducer(skuReducer, skuInitialState)
  const config = useContext(CommerceLayerContext)
  const loadSkus = async () =>
    await getSku({ config, dispatch, skus, queryParams })
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
          loading: true,
        },
      })
    }
  }, [config, skus])
  const contextValue = useMemo(() => state, [state])
  return (
    <SkuContext.Provider value={contextValue}>{children}</SkuContext.Provider>
  )
}

SkusContainer.propTypes = components.SkusContainer.propTypes

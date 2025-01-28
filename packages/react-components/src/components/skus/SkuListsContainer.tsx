import { useReducer, useContext, type ReactNode, useEffect, type JSX } from 'react';
import SkuListsContext from '#context/SkuListsContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import skuListsReducer, {
  skuListsInitialState,
  getSkuList
} from '#reducers/SkuListsReducer'

interface Props {
  children: ReactNode
}

export function SkuListsContainer(props: Props): JSX.Element {
  const { children } = props
  const [state, dispatch] = useReducer(skuListsReducer, skuListsInitialState)
  const config = useContext(CommerceLayerContext)
  useEffect(() => {
    if (state.listIds && state.listIds.length > 0 && config.accessToken) {
      getSkuList({ listIds: state.listIds, dispatch, config, state })
    }
  }, [config.accessToken])
  return (
    <SkuListsContext.Provider value={state}>
      {children}
    </SkuListsContext.Provider>
  )
}

export default SkuListsContainer

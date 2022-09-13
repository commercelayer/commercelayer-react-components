import { useReducer, useContext, useEffect } from 'react'
import SkuListsContext from '#context/SkuListsContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import skuListsReducer, {
  skuListsInitialState,
  getSkuList,
} from '#reducers/SkuListsReducer'

type Props = {
  children: JSX.Element[] | JSX.Element
}

export function SkuListsContainer(props: Props): JSX.Element {
  const { children } = props
  const [state, dispatch] = useReducer(skuListsReducer, skuListsInitialState)
  const config = useContext(CommerceLayerContext)
  useEffect(() => {
    if (state.listIds && state.listIds.length > 0 && config.accessToken) {
      void getSkuList({ listIds: state.listIds, dispatch, config, state })
    }
  }, [config.accessToken])
  return (
    <SkuListsContext.Provider value={state}>
      {children}
    </SkuListsContext.Provider>
  )
}

export default SkuListsContainer

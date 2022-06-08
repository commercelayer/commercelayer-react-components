import {
  FunctionComponent,
  useReducer,
  useContext,
  ReactNode,
  useEffect,
} from 'react'
import SkuListsContext from '#context/SkuListsContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import skuListsReducer, {
  skuListsInitialState,
  getSkuList,
} from '#reducers/SkuListsReducer'

import components from '#config/components'

const propTypes = components.SkuListsContainer.propTypes
const displayName = components.SkuListsContainer.displayName

type SkuListsContainerProp = {
  children: ReactNode
}

const SkuListsContainer: FunctionComponent<SkuListsContainerProp> = (props) => {
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

SkuListsContainer.propTypes = propTypes
SkuListsContainer.displayName = displayName

export default SkuListsContainer

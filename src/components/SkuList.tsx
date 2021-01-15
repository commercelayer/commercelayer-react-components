import React, {
  FunctionComponent,
  useContext,
  useEffect,
  Fragment,
  ReactNode,
} from 'react'
import SkuListsContext from '#context/SkuListsContext'
import components from '#config/components'

const propTypes = components.SkuList.propTypes
const displayName = components.SkuList.displayName

type SkuListProp = {
  children: ReactNode
  id: string
}

const SkuList: FunctionComponent<SkuListProp> = (props) => {
  const { id, children } = props
  const { listIds } = useContext(SkuListsContext)
  useEffect(() => {
    if (!listIds.includes(id)) {
      listIds.push(id)
    }
  }, [])
  return <Fragment>{children}</Fragment>
}

SkuList.propTypes = propTypes
SkuList.displayName = displayName

export default SkuList

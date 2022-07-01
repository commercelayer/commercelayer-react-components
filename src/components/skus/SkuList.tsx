import { useContext, useEffect, Fragment, ReactNode } from 'react'
import SkuListsContext from '#context/SkuListsContext'
import components from '#config/components'

const propTypes = components.SkuList.propTypes
const displayName = components.SkuList.displayName

type Props = {
  children: ReactNode
  id: string
}

export function SkuList(props: Props) {
  const { id, children } = props
  const { listIds } = useContext(SkuListsContext)
  useEffect(() => {
    if (listIds && !listIds.includes(id)) {
      listIds.push(id)
    }
  }, [])
  return <Fragment>{children}</Fragment>
}

SkuList.propTypes = propTypes
SkuList.displayName = displayName

export default SkuList

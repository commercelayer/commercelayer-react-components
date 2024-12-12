import { useContext, useEffect, type ReactNode, type JSX } from 'react';
import SkuListsContext from '#context/SkuListsContext'

interface Props {
  children: ReactNode
  /**
   * ID of the SKU list.
   */
  id: string
}

export function SkuList(props: Props): JSX.Element {
  const { id, children } = props
  const { listIds } = useContext(SkuListsContext)
  useEffect(() => {
    if (listIds && !listIds.includes(id)) {
      listIds.push(id)
    }
  }, [])
  return <>{children}</>
}

export default SkuList

import { useContext, useEffect } from 'react'
import SkuListsContext from '#context/SkuListsContext'

type Props = {
  children: JSX.Element
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
  return <>{children}</>
}

export default SkuList

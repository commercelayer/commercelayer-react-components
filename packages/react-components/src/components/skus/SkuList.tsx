import { type JSX, type ReactNode, useContext, useEffect } from "react"
import SkuListsContext from "#context/SkuListsContext"

interface Props {
  children: ReactNode
  /**
   * ID of the SKU list.
   */
  id: string
}

export function SkuList(props: Props): JSX.Element {
  const { id, children } = props
  const { registerListId } = useContext(SkuListsContext)
  useEffect(() => {
    registerListId(id)
  }, [id, registerListId])
  return <>{children}</>
}

export default SkuList

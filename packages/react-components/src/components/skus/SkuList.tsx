import { type JSX, type ReactNode, useContext, useEffect, useMemo } from "react"
import SkuContext from "#context/SkuContext"
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
  const { registerListId, skuLists } = useContext(SkuListsContext)

  useEffect(() => {
    registerListId(id)
  }, [id, registerListId])

  // Bridge the fetched skus for this list into SkuContext so that
  // <Skus> and <SkuField> work the same way they do under <SkusContainer>.
  // skuLists[id] is undefined while loading, an array once fetched.
  const skusForList = skuLists[id]
  const skuContextValue = useMemo(
    () => ({
      skus: skusForList ?? [],
      loading: skusForList === undefined,
      skuCodes: (skusForList ?? []).map((s) => s.code ?? ""),
    }),
    [skusForList],
  )

  return (
    <SkuContext.Provider value={skuContextValue}>
      {children}
    </SkuContext.Provider>
  )
}

export default SkuList

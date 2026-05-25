import { useSkuList } from "@commercelayer/hooks"
import type { QueryParamsRetrieve, Sku, SkuList as SkuListType } from "@commercelayer/sdk"
import { type JSX, type ReactNode, useContext, useEffect, useMemo } from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import SkuContext from "#context/SkuContext"
import SkuListsContext from "#context/SkuListsContext"
import type { LoaderType } from "#typings/index"

interface Props {
  children: ReactNode
  /**
   * ID of the SKU list.
   */
  id: string
  /**
   * Optional query parameters used in standalone mode.
   * `include: ["skus"]` is always enforced.
   * Use `fields.skus` to request additional SKU attributes (default is `["code"]`).
   */
  params?: QueryParamsRetrieve<SkuListType>
  /** Loader shown while fetching in standalone mode. */
  loader?: LoaderType
}

/**
 * Renders SKUs belonging to a Commerce Layer SKU list.
 *
 * Can be used standalone — automatically fetches the list data without a `SkuListsContainer` parent.
 *
 * @example Standalone (preferred):
 * ```tsx
 * <CommerceLayer accessToken="...">
 *   <SkuList id="yZjQIDxrly">
 *     <Skus>
 *       <SkuField attribute="name" tagElement="h2" />
 *     </Skus>
 *   </SkuList>
 * </CommerceLayer>
 * ```
 */
export function SkuList(props: Props): JSX.Element {
  const { id, children, params, loader: propLoader } = props
  const { setListIds, registerListId, skuLists } = useContext(SkuListsContext)
  const { accessToken, interceptors } = useContext(CommerceLayerContext)

  const isStandalone = setListIds == null
  const loader = propLoader ?? "Loading..."

  const mergedParams = useMemo<QueryParamsRetrieve<SkuListType>>(
    () => ({
      ...params,
      include: [...new Set([...(params?.include ?? []), "skus"])],
      fields: {
        skus: ["code"],
        ...params?.fields,
      },
    }),
    [params]
  )

  const { skuList, isLoading } = useSkuList(
    isStandalone ? id : "",
    isStandalone ? (accessToken ?? "") : "",
    isStandalone ? interceptors : undefined,
    isStandalone ? mergedParams : undefined
  )

  // In container mode: register this list ID with the parent container.
  useEffect(() => {
    if (!isStandalone) {
      registerListId(id)
    }
  }, [isStandalone, id, registerListId])

  const skusForList: Sku[] | undefined = isStandalone
    ? (skuList?.skus as Sku[] | undefined)
    : skuLists[id]

  const skuContextValue = useMemo(
    () => ({
      skus: skusForList ?? [],
      loading: skusForList === undefined,
      skuCodes: (skusForList ?? []).map((s) => s.code ?? ""),
    }),
    [skusForList]
  )

  if (isStandalone && (isLoading || skusForList == null)) return loader as JSX.Element

  return <SkuContext.Provider value={skuContextValue}>{children}</SkuContext.Provider>
}

export default SkuList

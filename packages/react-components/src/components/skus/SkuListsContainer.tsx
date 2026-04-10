import { useSkuLists } from "@commercelayer/hooks"
import type { QueryParamsRetrieve, Sku, SkuList } from "@commercelayer/sdk"
import {
  type JSX,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import CommerceLayerContext from "#context/CommerceLayerContext"
import SkuListsContext, {
  type SkuListsContextType,
} from "#context/SkuListsContext"

interface Props {
  children: ReactNode
  /**
   * Optional query parameters forwarded to each SKU list retrieval call.
   * `include: ["skus"]` is always enforced; any `include` entries here are merged.
   * Use `fields.skus` to request additional SKU attributes (default is `["code"]`).
   */
  params?: QueryParamsRetrieve<SkuList>
}

export function SkuListsContainer(props: Props): JSX.Element {
  const { children, params } = props
  const config = useContext(CommerceLayerContext)
  const { retrieveSkuList } = useSkuLists(config.accessToken ?? "")
  const [registeredIds, setRegisteredIds] = useState<string[]>([])
  const [skuLists, setSkuLists] = useState<Record<string, Sku[]>>({})

  const registerListId = useCallback((id: string) => {
    setRegisteredIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  useEffect(() => {
    if (config.accessToken != null && registeredIds.length > 0) {
      const mergedParams: QueryParamsRetrieve<SkuList> = {
        ...params,
        // Always include skus relationship; merge with any caller-supplied includes.
        include: [...new Set([...(params?.include ?? []), "skus"])],
        fields: {
          skus: ["code"],
          ...params?.fields,
        },
      }
      void Promise.all(
        registeredIds.map((id) =>
          retrieveSkuList(id, mergedParams).then((skuList) => ({
            id,
            skus: (skuList?.skus ?? []) as Sku[],
          })),
        ),
      ).then((results) => {
        const updated: Record<string, Sku[]> = {}
        for (const { id, skus } of results) {
          updated[id] = skus
        }
        setSkuLists(updated)
      })
    }
  }, [config.accessToken, registeredIds, retrieveSkuList, params])

  const contextValue = useMemo<SkuListsContextType>(
    () => ({ listIds: registeredIds, skuLists, registerListId }),
    [registeredIds, skuLists, registerListId],
  )

  return (
    <SkuListsContext.Provider value={contextValue}>
      {children}
    </SkuListsContext.Provider>
  )
}

export default SkuListsContainer

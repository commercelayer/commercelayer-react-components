import { useSkuLists } from "@commercelayer/hooks"
import type { Sku } from "@commercelayer/sdk"
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
}

export function SkuListsContainer(props: Props): JSX.Element {
  const { children } = props
  const config = useContext(CommerceLayerContext)
  const { retrieveSkuList } = useSkuLists(config.accessToken ?? "")
  const [registeredIds, setRegisteredIds] = useState<string[]>([])
  const [skuLists, setSkuLists] = useState<Record<string, Sku[]>>({})

  const registerListId = useCallback((id: string) => {
    setRegisteredIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  useEffect(() => {
    if (config.accessToken != null && registeredIds.length > 0) {
      void Promise.all(
        registeredIds.map((id) =>
          retrieveSkuList(id, {
            include: ["skus"],
            fields: { skus: ["code"] },
          }).then((skuList) => ({ id, skus: (skuList?.skus ?? []) as Sku[] })),
        ),
      ).then((results) => {
        const updated: Record<string, Sku[]> = {}
        for (const { id, skus } of results) {
          updated[id] = skus
        }
        setSkuLists(updated)
      })
    }
  }, [config.accessToken, registeredIds, retrieveSkuList])

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

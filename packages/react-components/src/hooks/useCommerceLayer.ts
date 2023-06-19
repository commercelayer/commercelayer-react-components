import CommerceLayerContext from '#context/CommerceLayerContext'
import getSdk from '#utils/getSdk'
import { type CommerceLayerClient } from '@commercelayer/sdk'
import { useContext } from 'react'

interface ReturnProps {
  accessToken?: string
  sdkClient: () => CommerceLayerClient | undefined
}

export function useCommerceLayer(): ReturnProps {
  const ctx = useContext(CommerceLayerContext)
  if ('accessToken' in ctx) {
    return {
      accessToken: ctx.accessToken,
      sdkClient: () => {
        if (ctx?.accessToken != null && ctx?.endpoint != null)
          return getSdk({
            accessToken: ctx.accessToken,
            endpoint: ctx.endpoint
          })
        return undefined
      }
    }
  }
  throw new Error('Cannot use `useCommerceLayer` outside of <CommerceLayer/>')
}

export default useCommerceLayer

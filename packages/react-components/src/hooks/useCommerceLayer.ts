import CommerceLayerContext from '#context/CommerceLayerContext'
import getSdk from '#utils/getSdk'
import type { CommerceLayerClient } from '@commercelayer/sdk'
import { useContext } from 'react'

interface ReturnProps {
  /** This is the access token used to initialize the sdk client. It need to be set as prop in the main `<CommerceLayer>` component */
  accessToken?: string
  /** This method can be used to initialize an sdk client and perform list, retrieve, update or delete operations on any resource */
  sdkClient: () => CommerceLayerClient | undefined
}

/**
 * React Hook that provides access to the official Commerce Layer SDK JS Client.
 **/
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

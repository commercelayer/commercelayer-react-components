import { createContext } from 'react'

interface Context {
  url: string | null
  callExternalFunction: CallExternalFunction
}

type CallExternalFunction = (params: {
  url: string
  data: Record<string, any>
}) => Promise<Record<string, any>>

export const callExternalFunction: CallExternalFunction = async ({
  url,
  data
}) => {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to call external function')
  }

  return await response.json()
}

const ExternalFunctionContext = createContext<Context>({
  url: null,
  callExternalFunction
})

export default ExternalFunctionContext

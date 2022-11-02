import { createContext } from 'react'
import axios from 'axios'

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
}) => await axios.post(url, data)

const ExternalFunctionContext = createContext<Context>({
  url: null,
  callExternalFunction
})

export default ExternalFunctionContext

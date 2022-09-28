import { TestContext } from 'vitest'

export interface LocalContext extends TestContext {
  accessToken: string
  endpoint: string
}

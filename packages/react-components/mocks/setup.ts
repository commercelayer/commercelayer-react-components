import { server } from './server'

beforeAll(async () => {
  server.listen()
})
afterAll(() => {
  server.close()
})
afterEach(() => {
  server.resetHandlers()
})

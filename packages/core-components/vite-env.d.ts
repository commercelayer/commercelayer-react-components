/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TEST_CLIENT_ID: string
  readonly VITE_TEST_MARKET_ID: string
  readonly VITE_TEST_CLIENT_ID_INTEGRATION: string
  readonly VITE_TEST_CLIENT_SECRET: string
  readonly VITE_TEST_DOMAIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

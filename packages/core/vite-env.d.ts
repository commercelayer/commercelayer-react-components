/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SALES_CHANNEL_CLIENT_ID: string
  readonly VITE_SALES_CHANNEL_SCOPE: string
  readonly VITE_DOMAIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

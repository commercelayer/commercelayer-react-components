declare namespace NodeJS {
  interface Process {
    /**
     * @deprecated Use `typeof window` instead
     */
    readonly browser: boolean
  }

  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test'
    readonly AXERVE_PROD: string
    readonly AXERVE_SANDBOX: string
  }
}

declare namespace globalThis {
  interface Window {
    readonly axerve: {
      lightBox: {
        shop: string
        open: (
          paymentId: string,
          paymentToken: string,
          callback: (res: { status: 'OK' | string }) => void
        ) => void
      }
    }
  }
}

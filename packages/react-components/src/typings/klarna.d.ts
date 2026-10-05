/**
 * The Klarna SDK is injected by a <script> tag (see `useExternalScript` in
 * `KlarnaPayment`), so it only exists on `window` at runtime. Typed as `unknown`
 * on purpose: nothing here models the SDK surface, it only states that the
 * global may be absent, which is what the load check needs.
 */
declare global {
  interface Window {
    Klarna?: unknown
  }
}

export {}

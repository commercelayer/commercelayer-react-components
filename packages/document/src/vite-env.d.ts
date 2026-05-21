/// <reference types="vite/client" />

export {}

// Allow `type` on any HTML element — used as CSS hooks for callout spans
// (e.g. <span type="warning"> / <span type="info">) in story docs pages.
declare module 'react' {
  interface HTMLAttributes<T> {
    type?: string
  }
}

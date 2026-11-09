type TEvent = "open-cart"

/**
 * Which interaction asked the cart to open. Subscribers need this to tell a
 * deliberate `<CartLink type="mini">` click from the implicit open that follows
 * adding an item, because both publish `open-cart`.
 */
type TEventSource = "cart-link" | "add-to-cart"

interface TEventDetail {
  source: TEventSource
}

function subscribe(eventName: TEvent, listener: EventListenerOrEventListenerObject): void {
  document.addEventListener(eventName, listener)
}

function unsubscribe(eventName: TEvent, listener: EventListenerOrEventListenerObject): void {
  document.removeEventListener(eventName, listener)
}

function publish(eventName: TEvent, data?: TEventDetail): void {
  const event = new CustomEvent(eventName, { detail: data })
  document.dispatchEvent(event)
}

export { publish, subscribe, unsubscribe }
export type { TEventDetail, TEventSource }

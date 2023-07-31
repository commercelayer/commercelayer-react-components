type TEvent = 'open-cart'

function subscribe(
  eventName: TEvent,
  listener: EventListenerOrEventListenerObject
): void {
  document.addEventListener(eventName, listener)
}

function unsubscribe(
  eventName: TEvent,
  listener: EventListenerOrEventListenerObject
): void {
  document.removeEventListener(eventName, listener)
}

function publish(eventName: TEvent, data?: any): void {
  const event = new CustomEvent(eventName, { detail: data })
  document.dispatchEvent(event)
}

export { publish, subscribe, unsubscribe }

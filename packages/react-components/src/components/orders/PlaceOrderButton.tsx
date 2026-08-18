// Temporary alias. The next commit turns this file into the Payments Model
// router that picks between the `payment_source` and `payment_sessions`
// branches. Kept here so the move above stays a pure rename in the history.
export { PlaceOrderButtonPaymentSource as PlaceOrderButton } from "./PlaceOrderButtonPaymentSource"
export { default } from "./PlaceOrderButtonPaymentSource"

import { type JWTSalesChannel, jwtDecode } from "@commercelayer/js-auth"

/**
 * Decode a Commerce Layer access token.
 *
 * The shape comes from `@commercelayer/js-auth` rather than a local copy. The
 * copy this replaced had drifted: it declared `owner` and `market` as always
 * present when both are optional, and carried a `price_list_id` that is not in
 * the token and that nothing here ever read.
 *
 * The cast narrows to the one payload kind this library authenticates with.
 * `jwtIsSalesChannel`, from the same package, is the checked alternative for a
 * caller that has to handle other kinds.
 */
export function jwt(accessToken: string): JWTSalesChannel {
  return jwtDecode(accessToken).payload as JWTSalesChannel
}

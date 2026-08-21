import { authenticate } from "@commercelayer/js-auth"

interface AuthenticateProps {
  grantType: Parameters<typeof authenticate>[0]
  config: Parameters<typeof authenticate>[1]
}

/**
 * Retrieves an access token using the provided grant type and configuration.
 *
 * @param {AuthenticateProps['grantType']} grantType - The type of grant to use for authentication.
 * @param {AuthenticateProps['config']} config - The configuration object for authentication.
 * @returns {Promise<ReturnType<typeof authenticate>>} A promise that resolves to the access token.
 */
export async function getAccessToken({
  grantType,
  config,
}: AuthenticateProps): ReturnType<typeof authenticate> {
  return await authenticate(grantType, config)
}

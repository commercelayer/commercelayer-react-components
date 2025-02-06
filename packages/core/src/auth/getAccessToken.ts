import { authenticate } from "@commercelayer/js-auth"

interface AuthenticateProps {
  grantType: Parameters<typeof authenticate>[0]
  config: Parameters<typeof authenticate>[1]
}

/**
 * Retrieves an access token using the provided grant type and configuration.
 *
 * @param {AuthenticateProps} params - The parameters for authentication.
 * @param {string} params.grantType - The type of grant to use for authentication.
 * @param {object} params.config - The configuration object for authentication.
 * @returns {Promise<ReturnType<typeof authenticate>>} A promise that resolves to the access token.
 */
export async function getAccessToken({
  grantType,
  config,
}: AuthenticateProps): ReturnType<typeof authenticate> {
  return await authenticate(grantType, config)
}

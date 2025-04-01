import { authenticate } from "@commercelayer/js-auth"
import { describe, expect, vi } from "vitest"
import { type CoreTestInterface, coreTest } from "#extender"
import { getAccessToken } from "./getAccessToken"

vi.mock("@commercelayer/js-auth", () => ({
  authenticate: vi.fn(),
}))

describe("getAccessToken", () => {
  coreTest<CoreTestInterface>(
    "should call authenticate with the correct parameters",
    async ({ accessToken, config }) => {
      const token = accessToken?.accessToken
      const grantType = "client_credentials"
      const mockToken = { accessToken: token }
      // @ts-expect-error mockResolvedValue is not defined
      authenticate.mockResolvedValue(mockToken)
      const result = await getAccessToken({ grantType, config })
      await expect(authenticate).toHaveBeenCalledWith(grantType, config)
      expect(result).toEqual(mockToken)
      expect(result).toHaveProperty("accessToken")
      expect(result.accessToken).toBe(mockToken.accessToken)
    },
  )

  coreTest<CoreTestInterface>(
    "should throw an error if authenticate fails",
    async () => {
      const grantType = "client_credentials"
      const config = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      }
      const mockError = new Error("Authentication failed")
      // @ts-expect-error mockResolvedValue is not defined
      authenticate.mockRejectedValue(mockError)
      await expect(getAccessToken({ grantType, config })).rejects.toThrow(
        "Authentication failed",
      )
    },
  )
})
